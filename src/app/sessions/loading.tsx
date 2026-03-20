import { SkeletonHeader, SkeletonRow, Skeleton } from "@/components/Skeleton";

export default function SessionsLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <SkeletonHeader />
      <div className="mb-6 flex gap-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="mb-8 rounded-lg border border-vena-border bg-vena-surface p-6">
        <Skeleton className="mb-4 h-3 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
