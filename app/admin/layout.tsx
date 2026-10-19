import BottomNav from "./_components/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-papel">
      <div className="pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
