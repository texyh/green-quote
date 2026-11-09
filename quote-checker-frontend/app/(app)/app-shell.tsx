"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography } from "antd";
import { getMe, User } from "@/lib/auth";

const items = [
  { key: "/home", label: <Link href="/home">Home</Link> },
  { key: "/quotes", label: <Link href="/quotes">Quotes</Link> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selected = pathname.startsWith("/quotes") ? "/quotes" : "/home";
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(undefined));
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {user && <Typography.Text>{user.fullName}</Typography.Text>}
      </Layout.Header>
      <Layout>
        <Layout.Sider theme="light" breakpoint="md" collapsedWidth={0}>
          <Menu mode="inline" selectedKeys={[selected]} items={items} style={{ height: "100%" }} />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
