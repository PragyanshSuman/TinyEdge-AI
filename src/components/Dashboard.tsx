export function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  );
}
