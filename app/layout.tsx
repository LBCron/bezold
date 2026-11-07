import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { Provider } from "jotai";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BASE_OPEN_GRAPH, SITE_DESCRIPTION, SITE_TITLE } from "@/constant/seo";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-sans-mono",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
});

const SITE_KEYWORDS = [
  "頂讓網",
  "頂讓",
  "店面頂讓",
  "生意頂讓",
  "店面轉讓",
  "頂讓平台",
  "餐廳頂讓",
  "頂讓金",
  "接手店面",
  "台灣頂讓網",
];

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: SITE_TITLE,
    template: "%s｜頂讓網 Bezold",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${notoSansMono.variable} ${notoSansTC.variable} font-noto`}
    >
      <body>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Provider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  fontFamily:
                    "var(--font-noto-sans-mono), var(--font-noto-sans-tc)",
                  colorPrimary: "#ff4a31",
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </Provider>
      </body>
    </html>
  );
}
