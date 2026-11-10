"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input, Typography } from "antd";
import { ApiError } from "@/lib/api";
import { signUp, SignUpRequest } from "@/lib/auth";

export default function SignUpForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const onFinish = async (values: SignUpRequest) => {
    setSubmitting(true);
    setError(undefined);
    try {
      await signUp(values);
      router.push("/quotes");
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 409
          ? "This email is already registered."
          : "Could not create your account. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Typography.Title level={2}>Sign up</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Full name" name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
          <Input.Password />
        </Form.Item>

        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}

        <Button htmlType="submit" loading={submitting}>
          Sign up
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16 }}>
        Already have an account? <Link href="/signin">Sign in</Link>
      </Typography.Paragraph>
    </div>
  );
}
