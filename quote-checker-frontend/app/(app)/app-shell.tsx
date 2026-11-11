"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Layout, Space, Typography } from "antd";
import { getMe, signOut, User } from "@/lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(undefined));
  }, []);

  const onSignOut = async () => {
    await signOut();
    router.replace("/");
  };

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
        {user && (
          <Space size="large">
            {user.role === "admin" && <Link href="/admin/quotes">Admin</Link>}
            <Typography.Text>{user.email}</Typography.Text>
            <Button size="small" onClick={onSignOut}>
              Sign out
            </Button>
          </Space>
        )}
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
    </Layout>
  );
}
