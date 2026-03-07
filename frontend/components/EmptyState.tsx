import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = "fa-folder-open",
    actionLabel,
    onAction
}) => {
    return (
        <div className="text-center py-24 bg-theme-card/30 border border-dashed border-theme-border rounded-3xl animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-theme-bg rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <i className={`fas ${icon} text-theme-dim text-4xl`}></i>
            </div>
            <h3 className="text-theme-text text-2xl font-black mb-3 tracking-tight">{title}</h3>
            <p className="text-theme-dim text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-navy text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-theme-accent transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-navy/10"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
