import { Skeleton } from "@/components/ui/skeleton";

export default function DispatchLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-xl" />
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  );
}
