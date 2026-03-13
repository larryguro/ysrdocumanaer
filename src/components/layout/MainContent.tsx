interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 min-w-0 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </main>
  );
}
