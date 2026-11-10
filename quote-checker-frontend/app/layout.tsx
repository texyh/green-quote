import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quote Checker",
  description: "Check your quotes",
};

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#000",
    colorInfo: "#000",
    colorLink: "#000",
    colorBgLayout: "#fff",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>{children}</ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
