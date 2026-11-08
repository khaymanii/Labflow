import { Skeleton } from "@/components/ui/skeleton";

export default function SamplesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  );
}
