"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input, InputNumber, Typography } from "antd";
import { getMe } from "@/lib/auth";
import { createQuote, CreateQuoteRequest } from "@/lib/quotes";

export default function QuoteForm() {
  const router = useRouter();
  const [form] = Form.useForm<CreateQuoteRequest>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getMe()
      .then((user) => form.setFieldsValue({ fullName: user.fullName, email: user.email }))
      .catch(() => setError("Could not load your account details."));
  }, [form]);

  const onFinish = async (values: CreateQuoteRequest) => {
    setSubmitting(true);
    setError(undefined);
    try {
      const quote = await createQuote(values);
      router.push(`/quotes/${quote.id}`);
    } catch {
      setError("Could not create the quote. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <Typography.Title level={2}>Request a quote</Typography.Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Full name" name="fullName" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
          <Input disabled />
        </Form.Item>

        <Form.Item label="Address" name="address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Monthly consumption (kWh)" name="monthlyConsumptionKwh" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="System size (kW)" name="systemSizeKw" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Down payment (€)" name="downPayment">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}

        <Button htmlType="submit" loading={submitting}>
          Get pre-qualification
        </Button>
      </Form>
    </div>
  );
}
