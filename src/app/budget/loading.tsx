import { SkeletonHeader, SkeletonCard, Skeleton } from "@/components/Skeleton";

export default function BudgetLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <SkeletonHeader />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <Skeleton className="mb-4 h-3 w-32" />
          <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        </div>
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <Skeleton className="mb-4 h-3 w-32" />
          <div className="space-y-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
