import { SkeletonHeader, SkeletonCard, Skeleton } from "@/components/Skeleton";

export default function AgentsLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <SkeletonHeader />
      <div className="mb-6 flex gap-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
      </div>
    </div>
  );
}
