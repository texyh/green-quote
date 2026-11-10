"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Descriptions, Result, Spin, Typography } from "antd";
import { ApiError } from "@/lib/api";
import { getQuote, Quote } from "@/lib/quotes";

export default function QuoteDetails({ id }: { id: string }) {
  const [quote, setQuote] = useState<Quote>();
  const [error, setError] = useState<"not-found" | "failed">();

  useEffect(() => {
    getQuote(id)
      .then(setQuote)
      .catch((e) =>
        setError(e instanceof ApiError && (e.status === 404 || e.status === 400) ? "not-found" : "failed"),
      );
  }, [id]);

  if (error === "not-found") {
    return (
      <Result
        status="404"
        title="Quote not found"
        extra={
          <Link href="/quotes">
            <Button>Back to my quotes</Button>
          </Link>
        }
      />
    );
  }
  if (error) return <Alert type="error" title="Could not load the quote. Please try again." />;
  if (!quote) return <Spin />;

  return (
    <div style={{ maxWidth: 640 }}>
      <Typography.Title level={2}>Quote</Typography.Title>
      <Descriptions
        bordered
        column={1}
        items={[
          { label: "Date", children: new Date(quote.createdAt).toLocaleString() },
          { label: "Full name", children: quote.fullName },
          { label: "Email", children: quote.email },
          { label: "Address", children: quote.address },
          { label: "Monthly consumption", children: `${quote.monthlyConsumptionKwh} kWh` },
          { label: "System size", children: `${quote.systemSizeKw} kW` },
          { label: "Down payment", children: `€${quote.downPayment}` },
        ]}
      />
      <Link href="/quotes">
        <Button style={{ marginTop: 16 }}>Back to my quotes</Button>
      </Link>
    </div>
  );
}
