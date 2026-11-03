export default function Loading() {
  return (
    <div className="mx-auto grid max-w-[1192px] animate-pulse gap-8 px-4 pt-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <div className="h-9 w-56 rounded-2xl bg-surface" />
        <div className="h-4 w-80 rounded-xl bg-surface" />
        <div className="h-44 rounded-[20px] bg-surface" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-56 rounded-[20px] bg-surface" />
          <div className="h-56 rounded-[20px] bg-surface" />
          <div className="h-56 rounded-[20px] bg-surface" />
        </div>
      </div>
      <div className="hidden space-y-4 xl:block">
        <div className="h-64 rounded-[20px] bg-surface" />
        <div className="h-32 rounded-[20px] bg-surface" />
      </div>
    </div>
  );
}
