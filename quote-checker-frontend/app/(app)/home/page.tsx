"use client";

import Link from "next/link";
import { Button, Typography } from "antd";

export default function Home() {
  return (
    <main>
      <Typography.Title>Welcome</Typography.Title>
      <Link href="/quotes/new">
        <Button>Check a quote</Button>
      </Link>
    </main>
  );
}
