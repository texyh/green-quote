import { request } from "./api";

export type CreateQuoteRequest = {
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
};

export type Quote = CreateQuoteRequest & {
  id: string;
  downPayment: number;
  createdAt: string;
};

export function createQuote(body: CreateQuoteRequest): Promise<Quote> {
  return request<Quote>("/quotes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
