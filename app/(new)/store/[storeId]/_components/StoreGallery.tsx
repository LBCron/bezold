"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { StoreTag } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import ImageLightbox from "./ImageLightbox";
import styles from "./StoreGallery.module.css";

interface StoreGalleryProps {
  images: string[];
  tags?: StoreTag[];
}

// * empty-slot labels: the hero, then the four thumbnails
const SLOT_LABELS = {
  hero: "店面外觀",
  thumbs: ["內裝", "廚房", "設備", "其他"],
};

function Placeholder({ label }: { label: string }) {
  return (
    <div className={styles.placeholder}>
      <span>{label}</span>
    </div>
  );
}

export default function StoreGallery({ images, tags }: StoreGalleryProps) {
  const isUrgent = tags?.includes(STORE_TAG.EMERGENCY);
  const slots = Array.from({ length: 5 }, (_, index) => images[index] ?? null);
  const totalImages = images.length;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(index: number) {
    if (images.length === 0) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          {/* Hero — spans both rows */}
          <div
            className={`${styles.hero} ${totalImages > 0 ? styles.clickable : ""}`}
            onClick={() => openLightbox(0)}
          >
            {slots[0] ? (
              <Image
                src={slots[0]}
                fill
                alt="店面主圖"
                className={styles.img}
                sizes="55vw"
              />
            ) : (
              <Placeholder label={SLOT_LABELS.hero} />
            )}
            {isUrgent && <span className={styles.ribbon}>急售</span>}
            {totalImages > 0 && (
              <span className={styles.photoCount}>
                <Camera size={13} strokeWidth={2.5} /> {totalImages} 張
              </span>
            )}
          </div>

          {/* 4 thumbnails */}
          {SLOT_LABELS.thumbs.map((label, thumbIndex) => {
            const index = thumbIndex + 1;
            const src = slots[index];
            return (
              <div
                key={index}
                className={`${styles.thumb} ${src ? styles.clickable : ""}`}
                onClick={() => src && openLightbox(index)}
              >
                {src ? (
                  <Image
                    src={src}
                    fill
                    alt={label}
                    className={styles.img}
                    sizes="22vw"
                  />
                ) : (
                  <Placeholder label={label} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
