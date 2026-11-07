import type { MetadataRoute } from "next";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import { STORE_STATUS } from "@/types";
import { getAllPostsMeta } from "@/lib/blog";

// * ISR: newly approved / sold stores show up within an hour, no redeploy needed.
// Crawlers re-fetch sitemaps far less often than that, so a shorter window only adds Firestore reads.
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

const route = (
  path: string,
  changeFrequency: ChangeFrequency,
  priority: number,
): MetadataRoute.Sitemap[number] => ({
  url: `${BASE_URL}${path}`,
  changeFrequency,
  priority,
});

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  route("/", "daily", 1),
  route("/store-list", "daily", 0.9),
  route("/digital-assets", "daily", 0.8),
  route("/sell", "weekly", 0.8),
  route("/faq", "monthly", 0.5),
  route("/store-guide", "monthly", 0.5),
  route("/policy/editor-pick", "monthly", 0.5),
  route("/blog", "weekly", 0.6),
  route("/about", "monthly", 0.4),
  route("/contact", "monthly", 0.4),
  route("/privacy", "yearly", 0.3),
  route("/terms", "yearly", 0.3),
  route("/disclaimer", "yearly", 0.3),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await db
    .collection(COLLECTIONS.STORE)
    .where("status", "in", [STORE_STATUS.APPROVED, STORE_STATUS.SOLD])
    .get();

  // * sold listings stay listed as closed deals — they still get search traffic
  const storeRoutes: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
    const data = doc.data();
    const isSold = data.status === STORE_STATUS.SOLD;
    return {
      url: `${BASE_URL}/store/${doc.id}`,
      lastModified: data.updateTime?.toDate?.() ?? new Date(),
      changeFrequency: isSold ? "monthly" : "weekly",
      priority: isSold ? 0.4 : 0.7,
    };
  });

  const blogRoutes: MetadataRoute.Sitemap = getAllPostsMeta().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...STATIC_ROUTES, ...blogRoutes, ...storeRoutes];
}
