import { request } from "./api";

export type CreateQuoteRequest = {
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment?: number;
};

export type Offer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

export type Quote = CreateQuoteRequest & {
  id: string;
  downPayment: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: "A" | "B" | "C";
  apr: number;
  offers: Offer[];
  createdAt: string;
};

export type QuoteList = {
  items: Quote[];
  total: number;
  page: number;
  limit: number;
};

export function listQuotes(page: number, limit: number): Promise<QuoteList> {
  return request<QuoteList>(`/quotes?page=${page}&limit=${limit}`);
}

export function listAllQuotes(
  page: number,
  limit: number,
  search: string,
): Promise<QuoteList> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    params.set("search", search);
  }
  return request<QuoteList>(`/admin/quotes?${params}`);
}

export function getQuote(id: string): Promise<Quote> {
  return request<Quote>(`/quotes/${id}`);
}

export function createQuote(body: CreateQuoteRequest): Promise<Quote> {
  return request<Quote>("/quotes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
