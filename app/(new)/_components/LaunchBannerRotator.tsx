"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { trackEvent } from "@/firebase/client";
import useDigitalAssetsLaunched from "@/hooks/useDigitalAssetsLaunched";
import { digitalAssetsLaunchLabels } from "@/utils/digitalAsset";
import { cn } from "@/lib/utils";
import styles from "./LaunchBanner.module.css";

type BannerMessage = {
  key: string;
  tag: string;
  /** Narrow-screen versions (≤ 720px) — one line has to fit at 360px. */
  shortTag?: string;
  text: string;
  shortText: string;
  linkLabel: string;
  href: string;
  highlightTag?: boolean;
  /** Fires `sell_cta_click` with this location when set. */
  ctaLocation?: string;
};

const ROTATE_MS = 4000;
// * matches the CSS transition — the leaving message then waits below again
const TRANSITION_MS = 450;

function bannerMessages(launched: boolean): BannerMessage[] {
  const { date, weekday, time } = digitalAssetsLaunchLabels();
  return [
    {
      key: "early-bird",
      tag: "EARLY BIRD",
      text: "開站慶 · 前 3 個月免費刊登",
      shortText: "前 3 個月免費刊登",
      linkLabel: "了解 →",
      href: "/sell",
    },
    launched
      ? {
          key: "digital-assets",
          tag: "NEW",
          text: "數位資產頂讓 正式上線",
          shortText: "數位資產頂讓 正式上線",
          linkLabel: "去看看 →",
          href: "/digital-assets",
          highlightTag: true,
        }
      : {
          key: "digital-assets",
          tag: `COMING ${date}`,
          shortTag: `${date} ${time}`,
          text: `數位資產頂讓 ${date}（${weekday}）${time}上線`,
          shortText: "數位資產頂讓上線",
          linkLabel: "搶先刊登 →",
          href: "/sell?type=digital",
          highlightTag: true,
          ctaLocation: "launch_banner",
        },
  ];
}

export default function LaunchBannerRotator({
  serverLaunched,
}: {
  serverLaunched: boolean;
}) {
  const launched = useDigitalAssetsLaunched(serverLaunched);
  const messages = useMemo(() => bannerMessages(launched), [launched]);

  // * active and leaving change together, so the old message slides out in
  // * the same frame the new one slides in
  const [slide, setSlide] = useState<{
    activeIndex: number;
    leavingIndex: number | null;
  }>({ activeIndex: 0, leavingIndex: null });
  const { activeIndex, leavingIndex } = slide;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setReduceMotion(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const showMessage = (index: number) =>
    setSlide((current) =>
      index === current.activeIndex
        ? current
        : { activeIndex: index, leavingIndex: current.activeIndex },
    );

  // * with less motion the banner stays put; the dots still switch it
  const paused = hovered || focused || reduceMotion;
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () =>
        setSlide((current) => ({
          activeIndex: (current.activeIndex + 1) % messages.length,
          leavingIndex: current.activeIndex,
        })),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [paused, messages.length]);

  useEffect(() => {
    if (leavingIndex === null) return;
    const timer = setTimeout(
      () => setSlide((current) => ({ ...current, leavingIndex: null })),
      TRANSITION_MS,
    );
    return () => clearTimeout(timer);
  }, [leavingIndex]);

  return (
    <div
      className={styles.launch}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
    >
      {messages.map((message, index) => {
        const isActive = index === activeIndex;
        return (
          <NextLink
            key={message.key}
            href={message.href}
            className={cn(
              styles.item,
              isActive && styles.active,
              index === leavingIndex && styles.leaving,
            )}
            aria-hidden={!isActive}
            tabIndex={isActive ? undefined : -1}
            onClick={() => {
              if (message.ctaLocation)
                trackEvent("sell_cta_click", {
                  cta_location: message.ctaLocation,
                });
            }}
          >
            <span
              className={cn(styles.tag, message.highlightTag && styles.tagMus)}
            >
              <span className={styles.long}>{message.tag}</span>
              <span className={styles.short}>
                {message.shortTag ?? message.tag}
              </span>
            </span>
            <b className={styles.text}>
              <span className={styles.long}>{message.text}</span>
              <span className={styles.short}>{message.shortText}</span>
            </b>
            <span className={styles.cta}>
              <span className={styles.long}>{message.linkLabel}</span>
              <span className={styles.short}>→</span>
            </span>
          </NextLink>
        );
      })}

      <div className={styles.dots}>
        {messages.map((message, index) => (
          <button
            key={message.key}
            type="button"
            className={cn(styles.dot, index === activeIndex && styles.dotOn)}
            aria-label={`第 ${index + 1} 則公告`}
            aria-pressed={index === activeIndex}
            onClick={() => showMessage(index)}
          />
        ))}
      </div>
    </div>
  );
}
