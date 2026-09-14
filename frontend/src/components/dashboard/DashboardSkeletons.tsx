import React from 'react';

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col gap-2.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 bg-stone-200 rounded-md" />
        <div className="w-5 h-5 bg-stone-200 rounded-full" />
      </div>
      <div className="h-8 w-14 bg-stone-200 rounded-lg" />
      <div className="h-3 w-28 bg-stone-100 rounded-md" />
    </div>
  );
};

export const ActiveCourseSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto flex-1">
        <div className="w-full sm:w-56 aspect-video rounded-xl bg-stone-200 shrink-0" />
        <div className="flex flex-col gap-3 flex-1 w-full">
          <div className="h-4 w-32 bg-stone-200 rounded-md" />
          <div className="h-6 w-3/4 bg-stone-200 rounded-md" />
          <div className="h-4 w-full bg-stone-100 rounded-md" />
          <div className="h-3 w-48 bg-stone-200 rounded-full mt-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
        <div className="h-11 w-44 bg-stone-200 rounded-xl" />
        <div className="h-11 w-44 bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
};

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col animate-pulse">
      <div className="w-full aspect-video bg-stone-200" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-stone-200 rounded-md" />
          <div className="h-4 w-12 bg-stone-200 rounded-md" />
        </div>
        <div className="h-5 w-4/5 bg-stone-200 rounded-md" />
        <div className="h-3.5 w-full bg-stone-100 rounded-md" />
        <div className="h-3.5 w-2/3 bg-stone-100 rounded-md" />
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="h-4 w-16 bg-stone-200 rounded-md" />
          <div className="h-8 w-24 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TicketCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-stone-200 rounded-md" />
        <div className="h-5 w-16 bg-stone-200 rounded-full" />
      </div>
      <div className="h-5 w-2/3 bg-stone-200 rounded-md" />
      <div className="h-3.5 w-full bg-stone-100 rounded-md" />
    </div>
  );
};
