export default function Card({
  title,
  actions,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-gray-900 border border-gray-800 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-gray-800">
          {title && (
            <h2 className="customCircle relative text-[1.8rem] text-gray-200 font-medium capitalize ml-4">{title}</h2>
          )}
          {actions}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
