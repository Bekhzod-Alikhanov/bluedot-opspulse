export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 rounded-lg bg-slate-800/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="panel h-72 rounded-2xl xl:col-span-3" />
        <div className="panel h-72 rounded-2xl xl:col-span-2" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
