import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AppShell from "./app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quote Checker",
  description: "Check your quotes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AppShell>{children}</AppShell>
        </AntdRegistry>
      </body>
    </html>
  );
}
