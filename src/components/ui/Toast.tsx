import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay to trigger animation
        const timer = setTimeout(() => setIsVisible(true), 10);

        const autoCloseTimer = setTimeout(() => {
            setIsVisible(false);
            // Wait for animation to finish before removing
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [id, duration, onClose]);

    const bgColors = {
        success: 'bg-[#4CAF50]', // Green
        error: 'bg-[#D32F2F]',   // Red
        info: 'bg-[#2196F3]',    // Blue
    };

    // Using project specific colors for better integration if preferred, 
    // but sticking to standard success/error indicators for clarity is often better.
    // Let's use the project's brand color for Info and standard colors for success/error but with similar styling.

    const styles = {
        success: { backgroundColor: '#48bb78', color: 'white' }, // Green-500 equivalent
        error: { backgroundColor: '#f56565', color: 'white' },   // Red-500 equivalent
        info: { backgroundColor: '#F89E1A', color: 'white' },    // Brand Orange
    };

    return (
        <div
            className={`
        fixed top-4 right-4 z-50 print:hidden
        transition-all duration-300 ease-in-out transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]
      `}
            style={styles[type]}
        >
            <div className="flex-1 font-medium">{message}</div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(id), 300);
                }}
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
