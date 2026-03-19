'use client';

import { Tag } from 'antd';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: 'Pending' },
    ACCEPTED: { color: 'blue', label: 'Accepted' },
    COOKING: { color: 'geekblue', label: 'Cooking' },
    ON_THE_WAY: { color: 'purple', label: 'On the Way' },
    DELIVERED: { color: 'green', label: 'Delivered' },
    CANCELED: { color: 'red', label: 'Canceled' },
};

export function OrderStatusTag({ status }: { status: string }) {
    const config = STATUS_CONFIG[status] || { color: 'default', label: status };
    return (
        <Tag
            color={config.color}
            style={{
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                padding: '2px 10px',
            }}
        >
            {config.label}
        </Tag>
    );
}
