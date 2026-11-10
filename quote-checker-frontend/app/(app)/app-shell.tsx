"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layout, Typography } from "antd";
import { getMe, User } from "@/lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
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
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/quotes">
          <Typography.Text strong>GreenQuote</Typography.Text>
        </Link>
        {user && <Typography.Text>{user.fullName}</Typography.Text>}
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
    </Layout>
  );
}
