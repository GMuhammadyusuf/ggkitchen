'use client';

import { ReactNode } from 'react';

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={`page-container ${className || ''}`}>
            {children}
        </div>
    );
}
