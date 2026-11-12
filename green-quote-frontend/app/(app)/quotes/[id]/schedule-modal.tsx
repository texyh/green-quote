"use client";

import { useEffect, useState } from "react";
import { Alert, Modal, Table } from "antd";
import type { TableProps } from "antd";
import { formatEur } from "@/lib/format";
import { getSchedule, Offer, ScheduleRow } from "@/lib/quotes";

const columns: TableProps<ScheduleRow>["columns"] = [
  { title: "Month", dataIndex: "month" },
  {
    title: "Payment",
    dataIndex: "payment",
    render: (amount: number) => formatEur(amount),
  },
  {
    title: "Interest",
    dataIndex: "interest",
    render: (amount: number) => formatEur(amount),
  },
  {
    title: "Principal",
    dataIndex: "principal",
    render: (amount: number) => formatEur(amount),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    render: (amount: number) => formatEur(amount),
  },
];

type Props = {
  quoteId: string;
  offer: Offer;
  onClose: () => void;
};

export default function ScheduleModal({ quoteId, offer, onClose }: Props) {
  const [rows, setRows] = useState<ScheduleRow[]>();
  const [error, setError] = useState(false);

  useEffect(() => {
    getSchedule(quoteId, offer.termYears)
      .then(setRows)
      .catch(() => setError(true));
  }, [quoteId, offer.termYears]);

  return (
    <Modal
      open
      title={`${offer.termYears}-year repayment schedule`}
      footer={null}
      onCancel={onClose}
      width={720}
    >
      {error ? (
        <Alert type="error" title="Could not load the schedule." />
      ) : (
        <Table
          rowKey="month"
          size="small"
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={rows}
          loading={!rows}
          pagination={{ pageSize: 12, showSizeChanger: false }}
        />
      )}
    </Modal>
  );
}
