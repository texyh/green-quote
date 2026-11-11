"use client";

import Link from "next/link";
import { Button, Space, Typography } from "antd";

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 480, textAlign: "center" }}>
      <Typography.Title>GreenQuote</Typography.Title>
      <Typography.Paragraph>
        Find out in a minute whether you pre-qualify for financing your solar
        system.
      </Typography.Paragraph>
      <Space>
        <Link href="/signin">
          <Button>Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </Space>
    </div>
  );
}
