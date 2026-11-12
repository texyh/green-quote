"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Flex, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { formatEur } from "@/lib/format";
import { listQuotes, Quote, QuoteList } from "@/lib/quotes";

const PAGE_SIZE = 10;

const columns: TableProps<Quote>["columns"] = [
  {
    title: "Date",
    dataIndex: "createdAt",
    render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
  },
  {
    title: "System size",
    dataIndex: "systemSizeKw",
    render: (kw: number) => `${kw} kW`,
  },
  {
    title: "Price",
    dataIndex: "systemPrice",
    render: (price: number) => formatEur(price),
  },
  { title: "Band", dataIndex: "riskBand" },
  {
    title: "",
    key: "view",
    render: (_, quote) => (
      <Link href={`/quotes/${quote.id}`}>
        <Button size="small">View</Button>
      </Link>
    ),
  },
];

export default function QuotesTable() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<QuoteList>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    listQuotes(page, PAGE_SIZE)
      .then((result) => {
        setData(result);
        setError(undefined);
      })
      .catch(() => setError("Could not load your quotes. Please try again."));
  }, [page]);

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2}>My quotes</Typography.Title>
        <Link href="/quotes/new">
          <Button>New quote</Button>
        </Link>
      </Flex>

      {error && (
        <Alert type="error" title={error} style={{ marginBottom: 16 }} />
      )}

      <Table
        rowKey="id"
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={data?.items}
        loading={!data && !error}
        locale={{
          emptyText: (
            <Link href="/quotes/new">
              No quotes yet. Request your first one.
            </Link>
          ),
        }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.total,
          onChange: setPage,
        }}
      />
    </div>
  );
}
