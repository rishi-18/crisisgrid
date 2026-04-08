import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-[500px] rounded-2xl" />
      <Skeleton className="h-[500px] rounded-2xl" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
  </div>
);

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {[1, 2, 3].map(i => (
       <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map(j => <Skeleton key={j} className="h-40 w-full rounded-2xl" />)}
       </div>
     ))}
  </div>
);
