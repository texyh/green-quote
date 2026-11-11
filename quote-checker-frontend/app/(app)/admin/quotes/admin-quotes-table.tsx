"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Input, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { ApiError } from "@/lib/api";
import { formatEur } from "@/lib/format";
import { listAllQuotes, Quote, QuoteList } from "@/lib/quotes";

const PAGE_SIZE = 10;

const columns: TableProps<Quote>["columns"] = [
  {
    title: "Date",
    dataIndex: "createdAt",
    render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
  },
  {
    title: "Customer",
    key: "customer",
    render: (_, quote) => (
      <>
        <div>{quote.fullName}</div>
        <Typography.Text type="secondary">{quote.email}</Typography.Text>
      </>
    ),
  },
  { title: "System size", dataIndex: "systemSizeKw", render: (kw: number) => `${kw} kW` },
  { title: "Price", dataIndex: "systemPrice", render: (price: number) => formatEur(price) },
  { title: "Band", dataIndex: "riskBand" },
  { title: "", key: "view", render: (_, quote) => <Link href={`/quotes/${quote.id}`}>View</Link> },
];

export default function AdminQuotesTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<QuoteList>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    listAllQuotes(page, PAGE_SIZE, search)
      .then((result) => {
        setData(result);
        setError(undefined);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) {
          router.replace("/quotes");
          return;
        }
        setError("Could not load quotes. Please try again.");
      });
  }, [page, search, router]);

  const onSearch = (value: string) => {
    setSearch(value.trim());
    setPage(1);
  };

  return (
    <div>
      <Typography.Title level={2}>All quotes</Typography.Title>

      <Input.Search
        placeholder="Search by customer name or email"
        allowClear
        onSearch={onSearch}
        style={{ maxWidth: 400, marginBottom: 16 }}
      />

      {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        loading={!data && !error}
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
