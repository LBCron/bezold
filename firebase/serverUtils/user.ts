import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, db } from "@/firebase/server";
import { User, UserBase } from "@/types";
import { COLLECTIONS } from "@/firebase/constants";

const COLLECTION = COLLECTIONS.USER;

export const getUserById = async (userId: string) => {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    return null;
  } else {
    const userData = doc.data();

    const user = {
      id: doc.id,
      ...userData,
      createTime: userData!.createTime.toDate(),
      updateTime: userData!.updateTime.toDate(),
    } as User;
    return user;
  }
};

export const createUser = async (user: UserBase) => {
  const userRef = await db.collection(COLLECTION).add({
    ...user,
    createTime: new Date(),
    updateTime: new Date(),
  });
  return userRef.id;
};

// * Firebase Auth caps getUsers() at 100 identifiers per call
const AUTH_LOOKUP_BATCH_SIZE = 100;

// * a missing or malformed Timestamp becomes undefined instead of throwing
export const timestampToDate = (value: unknown): Date | undefined =>
  value instanceof Timestamp ? value.toDate() : undefined;

// * one batched read for many sellers (keyed by uid). A seller doc without an
// * email falls back to the Firebase Auth account's email.
export const getUsersByIds = async (
  userIds: string[],
): Promise<Map<string, User>> => {
  const users = new Map<string, User>();
  if (userIds.length === 0) return users;

  const docs = await db.getAll(
    ...userIds.map((userId) => db.collection(COLLECTION).doc(userId)),
  );
  docs.forEach((doc) => {
    if (!doc.exists) return;
    const userData = doc.data()!;
    users.set(doc.id, {
      id: doc.id,
      ...userData,
      createTime: timestampToDate(userData.createTime),
      updateTime: timestampToDate(userData.updateTime),
    } as User);
  });

  const missingEmailIds = Array.from(users.values())
    .filter((user) => !user.email)
    .map((user) => user.id);
  for (
    let start = 0;
    start < missingEmailIds.length;
    start += AUTH_LOOKUP_BATCH_SIZE
  ) {
    const batch = missingEmailIds.slice(start, start + AUTH_LOOKUP_BATCH_SIZE);
    const { users: authUsers } = await adminAuth.getUsers(
      batch.map((uid) => ({ uid })),
    );
    authUsers.forEach((authUser) => {
      const user = users.get(authUser.uid);
      if (user && authUser.email) user.email = authUser.email;
    });
  }

  return users;
};
