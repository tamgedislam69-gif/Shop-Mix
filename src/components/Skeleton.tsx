import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={cn(
        "bg-gray-200",
        variant === 'circular' ? "rounded-full" : "rounded-md",
        className
      )}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden border border-gray-100 p-3 space-y-3">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-6 w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton variant="circular" className="h-8 w-8" />
    </div>
  </div>
);

export default Skeleton;
