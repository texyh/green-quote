"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConfigProvider, Layout, Menu } from "antd";

const items = [
  { key: "/", label: <Link href="/">Home</Link> },
  { key: "/quotes", label: <Link href="/quotes">Quotes</Link> },
];

const theme = {
  token: {
    colorPrimary: "#000",
    colorInfo: "#000",
    colorLink: "#000",
    colorBgLayout: "#fff",
  },
  components: {
    Menu: { itemSelectedBg: "#000", itemSelectedColor: "#fff" },
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selected = pathname.startsWith("/quotes") ? "/quotes" : "/";

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Sider theme="light" breakpoint="md" collapsedWidth={0}>
          <Menu mode="inline" selectedKeys={[selected]} items={items} style={{ height: "100%" }} />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
