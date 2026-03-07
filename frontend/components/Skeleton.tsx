import React from 'react';

interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div
            className={`animate-pulse bg-theme-bg border border-theme-border rounded-lg ${className}`}
            style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(209,96,61,0.05), transparent)', backgroundSize: '200% 100%' }}
        ></div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-theme-card border border-theme-border rounded-xl p-6 flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-theme-bg rounded w-3/4"></div>
                <div className="flex gap-4">
                    <div className="h-4 bg-theme-bg rounded w-20"></div>
                    <div className="h-4 bg-theme-bg rounded w-16"></div>
                </div>
            </div>
            <div className="ml-6 w-20 h-10 bg-theme-bg rounded-lg"></div>
        </div>
    );
};

export const StatSkeleton: React.FC = () => {
    return (
        <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl animate-pulse">
            <div className="h-3 bg-theme-bg rounded w-24 mb-3"></div>
            <div className="h-10 bg-theme-bg rounded w-16 mb-2"></div>
            <div className="h-3 bg-theme-bg rounded w-32"></div>
        </div>
    );
};

export default Skeleton;
