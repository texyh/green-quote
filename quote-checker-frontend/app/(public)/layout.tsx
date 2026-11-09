export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "64px 16px" }}>
      {children}
    </main>
  );
}
