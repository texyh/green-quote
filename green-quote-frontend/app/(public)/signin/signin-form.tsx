"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Divider, Form, Input, Typography } from "antd";
import { ApiError } from "@/lib/api";
import { signIn, SignInRequest } from "@/lib/auth";

export default function SignInForm({
  keycloakFailed,
}: {
  keycloakFailed: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(
    keycloakFailed ? "Could not sign you in with Keycloak." : undefined,
  );

  const onFinish = async (values: SignInRequest) => {
    setSubmitting(true);
    setError(undefined);
    try {
      const user = await signIn(values);
      router.push(user.role === "admin" ? "/admin/quotes" : "/quotes");
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
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Typography.Title level={2}>Sign in</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>

        {error && (
          <Alert type="error" title={error} style={{ marginBottom: 16 }} />
        )}

        <Button htmlType="submit" loading={submitting}>
          Sign in
        </Button>
      </Form>
      <Divider plain>or</Divider>
      <Button block href="/api/auth/keycloak/login">
        Sign in with Keycloak
      </Button>
      <Typography.Paragraph style={{ marginTop: 16 }}>
        No account yet? <Link href="/signup">Sign up</Link>
      </Typography.Paragraph>
    </div>
  );
}
