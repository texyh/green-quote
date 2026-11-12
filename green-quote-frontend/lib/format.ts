const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function formatEur(amount: number): string {
  return eur.format(amount);
}
