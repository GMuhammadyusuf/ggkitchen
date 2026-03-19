'use client';

import { useState, useMemo } from 'react';
import { Button, Spin, Empty, Tooltip, Segmented } from 'antd';
import {
    ShoppingOutlined,
    ReloadOutlined,
    CalendarOutlined,
    FilterOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    StarOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    FireOutlined,
    CarOutlined,
    SyncOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/components/cart/CartContext';
import { format } from 'date-fns';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { OrderStatusTag } from '@/components/ui/OrderStatusTag';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useOrderSSE } from '@/hooks/useOrderSSE';

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'COOKING', 'ON_THE_WAY', 'DELIVERED'];

const STATUS_ICONS: Record<string, React.ReactNode> = {
    PENDING: <ClockCircleOutlined />,
    ACCEPTED: <CheckCircleOutlined />,
    COOKING: <FireOutlined />,
    ON_THE_WAY: <CarOutlined />,
    DELIVERED: <EnvironmentOutlined />,
};

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
type SortDir = 'newest' | 'oldest';

export default function OrdersPage() {
    const { data: session, status: sessionStatus } = useSession();
    const { data: orders, isLoading } = useOrders();
    const { addItem } = useCart();
    const router = useRouter();
    const { t } = useLanguage();
    const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
    const [sortDir, setSortDir] = useState<SortDir>('newest');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    // Real-time order status updates via SSE
    useOrderSSE();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [sessionStatus, router]);

    const STATUS_LABELS: Record<string, string> = {
        PENDING: t('status.pending', 'Pending'),
        ACCEPTED: t('status.accepted', 'Accepted'),
        COOKING: t('status.cooking', 'Cooking'),
        ON_THE_WAY: t('status.on_the_way', 'On the Way'),
        DELIVERED: t('status.delivered', 'Delivered'),
    };

    // Stats
    const stats = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const totalSpent = orders.reduce((sum: number, o: any) => sum + Number(o.totalPrice), 0);
        const itemCounts: Record<string, number> = {};
        orders.forEach((o: any) => {
            o.items?.forEach((item: any) => {
                const name = item.product?.name || 'Unknown';
                itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
            });
        });
        const favoriteItem = Object.entries(itemCounts).sort(([, a], [, b]) => b - a)[0];

        return {
            totalOrders: orders.length,
            totalSpent,
            favoriteItem: favoriteItem ? favoriteItem[0] : 'N/A',
        };
    }, [orders]);

    // Filtered & sorted orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        let filtered = [...orders];

        switch (filterTab) {
            case 'ACTIVE':
                filtered = filtered.filter((o: any) =>
                    ['PENDING', 'ACCEPTED', 'COOKING', 'ON_THE_WAY'].includes(o.status)
                );
                break;
            case 'COMPLETED':
                filtered = filtered.filter((o: any) => o.status === 'DELIVERED');
                break;
            case 'CANCELED':
                filtered = filtered.filter((o: any) => o.status === 'CANCELED');
                break;
        }

        filtered.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortDir === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [orders, filterTab, sortDir]);

    const handleReorder = (order: any) => {
        order.items?.forEach((item: any) => {
            addItem({
                id: item.product.id,
                name: item.product.name,
                price: Number(item.price),
                quantity: item.quantity,
                image: item.product.image,
            });
        });
        router.push('/cart');
    };

    const getStepStatus = (orderStatus: string, stepStatus: string) => {
        if (orderStatus === 'CANCELED') return 'canceled';
        const orderIdx = STATUS_STEPS.indexOf(orderStatus);
        const stepIdx = STATUS_STEPS.indexOf(stepStatus);
        if (stepIdx < orderIdx) return 'done';
        if (stepIdx === orderIdx) return 'current';
        return 'upcoming';
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#9ca3af' }}>{t('orders.loading', 'Loading your orders...')}</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <SectionTitle title={t('orders.title', 'My Orders')} subtitle={t('orders.subtitle', 'Track, manage, and reorder your favorites')} />

            {/* Stats Bar */}
            {stats && (
                <div className="order-stats-bar">
                    <div className="order-stat-card">
                        <div className="order-stat-icon" style={{ background: '#e6f4ff', color: '#1677ff' }}>
                            <ShoppingOutlined />
                        </div>
                        <div>
                            <div className="order-stat-value">{stats.totalOrders}</div>
                            <div className="order-stat-label">{t('orders.total_orders', 'Total Orders')}</div>
                        </div>
                    </div>
                    <div className="order-stat-card">
                        <div className="order-stat-icon" style={{ background: '#f6ffed', color: '#52c41a' }}>
                            <DollarOutlined />
                        </div>
                        <div>
                            <div className="order-stat-value">{stats.totalSpent.toLocaleString()} сўм</div>
                            <div className="order-stat-label">{t('orders.total_spent', 'Total Spent')}</div>
                        </div>
                    </div>
                    <div className="order-stat-card">
                        <div className="order-stat-icon" style={{ background: '#fff7e6', color: '#fa8c16' }}>
                            <StarOutlined />
                        </div>
                        <div>
                            <div className="order-stat-value favorite-truncate">{stats.favoriteItem}</div>
                            <div className="order-stat-label">{t('orders.most_ordered', 'Most Ordered')}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Sort Controls */}
            {orders && orders.length > 0 && (
                <div className="order-controls">
                    <Segmented
                        options={[
                            { label: t('orders.all', 'All'), value: 'ALL' },
                            { label: `🟡 ${t('orders.active', 'Active')}`, value: 'ACTIVE' },
                            { label: `✅ ${t('orders.completed', 'Completed')}`, value: 'COMPLETED' },
                            { label: `❌ ${t('orders.canceled', 'Canceled')}`, value: 'CANCELED' },
                        ]}
                        value={filterTab}
                        onChange={(val) => setFilterTab(val as FilterTab)}
                    />
                    <Tooltip title={sortDir === 'newest' ? t('orders.newest', 'Showing newest first') : t('orders.oldest', 'Showing oldest first')}>
                        <Button
                            icon={sortDir === 'newest' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                            onClick={() => setSortDir(sortDir === 'newest' ? 'oldest' : 'newest')}
                        >
                            {sortDir === 'newest' ? t('orders.newest', 'Newest') : t('orders.oldest', 'Oldest')}
                        </Button>
                    </Tooltip>
                </div>
            )}

            {/* Order Cards */}
            {filteredOrders.length > 0 ? (
                <div className="order-cards-list">
                    {filteredOrders.map((order: any) => {
                        const isActive = !['DELIVERED', 'CANCELED'].includes(order.status);
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div
                                key={order.id}
                                className={`order-card ${isActive ? 'order-card-active' : ''}`}
                            >
                                {/* Card Header */}
                                <div className="order-card-header">
                                    <div className="order-card-id-row">
                                        <span className="order-card-id">Order #{order.id}</span>
                                        <OrderStatusTag status={order.status} />
                                    </div>
                                    <div className="order-card-meta">
                                        <span>
                                            <CalendarOutlined style={{ marginRight: 6 }} />
                                            {format(new Date(order.createdAt), 'MMM dd, yyyy · HH:mm')}
                                        </span>
                                        <span className="order-card-total">
                                            {Number(order.totalPrice).toLocaleString()} сўм
                                        </span>
                                    </div>
                                </div>

                                {/* Status Stepper (for non-canceled orders) */}
                                {order.status !== 'CANCELED' && (
                                    <div className="order-stepper">
                                        {STATUS_STEPS.map((step, idx) => {
                                            const stepStatus = getStepStatus(order.status, step);
                                            return (
                                                <div key={step} className={`stepper-step stepper-${stepStatus}`}>
                                                    <div className="stepper-icon">
                                                        {STATUS_ICONS[step]}
                                                    </div>
                                                    <span className="stepper-label">{STATUS_LABELS[step]}</span>
                                                    {idx < STATUS_STEPS.length - 1 && (
                                                        <div className={`stepper-line stepper-line-${stepStatus}`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Items Preview */}
                                <div className="order-card-items">
                                    <button
                                        className="order-items-toggle"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        {order.items?.slice(0, 2).map((item: any) => item.product?.name).join(', ')}
                                        {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                                        <span className="toggle-arrow">{isExpanded ? '▲' : '▼'}</span>
                                    </button>

                                    {isExpanded && (
                                        <div className="order-items-expanded">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="order-item-row">
                                                    <span className="order-item-name">
                                                        {item.product?.name}
                                                        <span className="order-item-qty"> × {item.quantity}</span>
                                                    </span>
                                                    <span className="order-item-price">
                                                        {(Number(item.price) * item.quantity).toLocaleString()} сўм
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Reorder Button (only for delivered) */}
                                {order.status === 'DELIVERED' && (
                                    <div className="order-card-actions">
                                        <Button
                                            type="primary"
                                            icon={<ReloadOutlined />}
                                            onClick={() => handleReorder(order)}
                                            className="reorder-btn"
                                        >
                                            {t('orders.reorder', 'Reorder 🔄')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state-enhanced">
                    <div className="empty-state-icon-wrap">
                        <ShoppingOutlined />
                    </div>
                    <h3>
                        {filterTab !== 'ALL'
                            ? `${t('orders.no_orders', 'No')} ${filterTab.toLowerCase()} ${t('nav.orders', 'orders')}`
                            : t('orders.no_orders', 'No orders yet')}
                    </h3>
                    <p>
                        {filterTab !== 'ALL'
                            ? t('menu.no_dishes_hint', 'Try switching to a different filter.')
                            : t('orders.no_orders_hint', 'Your order history is empty. Start by browsing our delicious menu!')}
                    </p>
                    {filterTab !== 'ALL' ? (
                        <Button onClick={() => setFilterTab('ALL')}>{t('orders.show_all', 'Show All Orders')}</Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => router.push('/menu')}
                            style={{ borderRadius: 12, fontWeight: 600, height: 48, paddingInline: 32 }}
                        >
                            {t('home.browse_menu', 'Browse Menu')}
                        </Button>
                    )}
                </div>
            )}
        </PageContainer>
    );
}
