"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Descriptions,
  Flex,
  Result,
  Spin,
  Table,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import { ApiError } from "@/lib/api";
import { formatEur } from "@/lib/format";
import { getQuote, Offer, Quote } from "@/lib/quotes";
import ScheduleModal from "./schedule-modal";

const offerColumns = (
  onViewSchedule: (offer: Offer) => void,
): TableProps<Offer>["columns"] => [
  {
    title: "Term",
    dataIndex: "termYears",
    render: (years: number) => `${years} years`,
  },
  { title: "APR", dataIndex: "apr", render: (apr: number) => `${apr}%` },
  {
    title: "Principal",
    dataIndex: "principalUsed",
    render: (amount: number) => formatEur(amount),
  },
  {
    title: "Monthly payment",
    dataIndex: "monthlyPayment",
    render: (amount: number) => formatEur(amount),
  },
  {
    title: "",
    key: "schedule",
    render: (_, offer) => (
      <Button size="small" onClick={() => onViewSchedule(offer)}>
        View Schedule
      </Button>
    ),
  },
];

export default function QuoteDetails({ id }: { id: string }) {
  const [quote, setQuote] = useState<Quote>();
  const [error, setError] = useState<"not-found" | "failed">();
  const [scheduleOffer, setScheduleOffer] = useState<Offer>();

  useEffect(() => {
    getQuote(id)
      .then(setQuote)
      .catch((e) =>
        setError(
          e instanceof ApiError && (e.status === 404 || e.status === 400)
            ? "not-found"
            : "failed",
        ),
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
  if (error) {
    return (
      <Alert type="error" title="Could not load the quote. Please try again." />
    );
  }
  if (!quote) {
    return (
      <Flex justify="center" style={{ padding: 48 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <Typography.Title level={2}>Your pre-qualification</Typography.Title>
      <Descriptions
        bordered
        column={1}
        items={[
          { label: "System price", children: formatEur(quote.systemPrice) },
          {
            label: "Risk band",
            children: `${quote.riskBand} (${quote.apr}% APR)`,
          },
        ]}
      />

      <Typography.Title level={4} style={{ marginTop: 24 }}>
        Offers
      </Typography.Title>
      <Table
        rowKey="termYears"
        scroll={{ x: "max-content" }}
        columns={offerColumns(setScheduleOffer)}
        dataSource={quote.offers}
        pagination={false}
      />
      {scheduleOffer && (
        <ScheduleModal
          quoteId={quote.id}
          offer={scheduleOffer}
          onClose={() => setScheduleOffer(undefined)}
        />
      )}

      <Typography.Title level={4} style={{ marginTop: 24 }}>
        Your request
      </Typography.Title>
      <Descriptions
        bordered
        column={1}
        items={[
          {
            label: "Date",
            children: new Date(quote.createdAt).toLocaleString(),
          },
          { label: "Full name", children: quote.fullName },
          { label: "Email", children: quote.email },
          { label: "Address", children: quote.address },
          {
            label: "Monthly consumption",
            children: `${quote.monthlyConsumptionKwh} kWh`,
          },
          { label: "System size", children: `${quote.systemSizeKw} kW` },
          { label: "Down payment", children: formatEur(quote.downPayment) },
        ]}
      />
      <Link href="/quotes">
        <Button style={{ marginTop: 16 }}>Back to my quotes</Button>
      </Link>
    </div>
  );
}
