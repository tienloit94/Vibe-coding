import { Card } from "@/components/ui/card";

export default function PostSkeleton() {
  return (
    <Card className="p-4 dark:bg-gray-800 dark:border-gray-700 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-3 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-4 w-3/5 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>

      {/* Image Skeleton */}
      <div className="mb-3 h-64 bg-gray-300 dark:bg-gray-600 rounded-lg" />

      {/* Actions Skeleton */}
      <div className="flex items-center space-x-4 border-t dark:border-gray-700 pt-3">
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    </Card>
  );
}
