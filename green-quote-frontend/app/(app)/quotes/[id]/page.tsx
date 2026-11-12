import QuoteDetails from "./quote-details";

export default async function QuoteDetailsPage({
  params,
}: PageProps<"/quotes/[id]">) {
  const { id } = await params;
  return <QuoteDetails id={id} />;
}
