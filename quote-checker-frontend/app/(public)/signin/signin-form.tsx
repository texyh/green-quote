"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input, Typography } from "antd";
import { ApiError } from "@/lib/api";
import { signIn, SignInRequest } from "@/lib/auth";

export default function SignInForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const onFinish = async (values: SignInRequest) => {
    setSubmitting(true);
    setError(undefined);
    try {
      await signIn(values);
      router.push("/home");
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? "Invalid email or password."
          : "Could not sign you in. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Typography.Title level={2}>Sign in</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>

        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}

        <Button htmlType="submit" loading={submitting}>
          Sign in
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16 }}>
        No account yet? <Link href="/signup">Sign up</Link>
      </Typography.Paragraph>
    </div>
  );
}
