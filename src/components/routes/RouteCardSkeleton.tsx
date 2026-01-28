import { Skeleton } from "@/components/ui/skeleton";

interface RouteCardSkeletonProps {
  count?: number;
}

export const RouteCardSkeleton = ({ count = 4 }: RouteCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative bg-background rounded-2xl border border-border p-6 space-y-4"
        >
          {/* Header */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>

          {/* Button */}
          <Skeleton className="h-10 w-full rounded-md mt-2" />
        </div>
      ))}
    </>
  );
};
