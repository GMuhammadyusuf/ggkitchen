'use client';

import { ReactNode } from 'react';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
    return (
        <div className="section-title">
            <div className="title-row">
                <h2>{title}</h2>
                {action && <div>{action}</div>}
            </div>
            {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
    );
}
