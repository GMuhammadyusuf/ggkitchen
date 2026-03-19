'use client';

import { Button, Row, Col, Spin, Empty, message } from 'antd';
import {
    UserOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    CarOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { OrderStatusTag } from '@/components/ui/OrderStatusTag';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useOrderSSE } from '@/hooks/useOrderSSE';

export default function CourierPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { data: orders, isLoading } = useOrders();
    const { mutateAsync: updateStatus } = useUpdateOrderStatus();
    const { t } = useLanguage();
    useOrderSSE();

    useEffect(() => {
        if (status === 'loading') return;
        const role = (session?.user as any)?.role;
        if (role === 'ADMIN') router.replace('/admin');
        else if (role !== 'COURIER') router.replace('/');
    }, [session, status, router]);

    const userRole = (session?.user as any)?.role;
    if (status === 'loading' || userRole !== 'COURIER') return null;

    const handleUpdate = async (id: number, status: string) => {
        try {
            await updateStatus({ id, status });
            message.success(`Order #${id} updated to ${status}`);
        } catch (e) {
            message.error('Failed to update status');
        }
    };

    const activeOrders = orders?.filter((o: any) => ['ACCEPTED', 'COOKING', 'ON_THE_WAY'].includes(o.status)) || [];
    const myDeliveries = orders?.filter((o: any) => o.status === 'ON_THE_WAY') || [];
    const availableOrders = orders?.filter((o: any) => o.status === 'ACCEPTED' || o.status === 'COOKING') || [];

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <Spin size="large" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
          <LogoutButton />
            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={8}>
                    <div className="stat-card">
                        <div className="stat-value">{activeOrders.length}</div>
                        <div className="stat-label">{t('courier.active', 'Active')}</div>
                    </div>
                </Col>
                <Col xs={8}>
                    <div className="stat-card">
                        <div className="stat-value">{myDeliveries.length}</div>
                        <div className="stat-label">{t('courier.in_transit', 'In Transit')}</div>
                    </div>
                </Col>
                <Col xs={8}>
                    <div className="stat-card">
                        <div className="stat-value">{availableOrders.length}</div>
                        <div className="stat-label">{t('courier.available', 'Available')}</div>
                    </div>
                </Col>
            </Row>

            {/* My Deliveries */}
            {myDeliveries.length > 0 && (
                <>
                    <SectionTitle title={t('courier.my_deliveries', 'My Deliveries')} subtitle={t('courier.delivering', "Orders you're delivering")} />
                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {myDeliveries.map((order: any) => (
                            <Col xs={24} sm={12} lg={8} key={order.id}>
                                <div className="delivery-card">
                                    <div className="delivery-header">
                                        <span className="delivery-id">Order #{order.id}</span>
                                        <OrderStatusTag status={order.status} />
                                    </div>
                                    <div className="delivery-info">
                                        <div className="delivery-info-row">
                                            <UserOutlined />
                                            <span>{order.user?.name || 'Customer'}</span>
                                        </div>
                                        <div className="delivery-info-row">
                                            <DollarOutlined />
                                            <span>{Number(order.totalPrice).toLocaleString()} сўм</span>
                                        </div>
                                        <div className="delivery-info-row">
                                            <EnvironmentOutlined />
                                            <span>{order.building || 'Campus'}, Room {order.roomNumber || '—'}</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="primary"
                                        block
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleUpdate(order.id, 'DELIVERED')}
                                        style={{
                                            background: '#52c41a',
                                            borderColor: '#52c41a',
                                            borderRadius: 10,
                                            height: 42,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t('courier.mark_delivered', 'Mark as Delivered')}
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
            <SectionTitle title={t('courier.available_orders', 'Available Orders')} subtitle={t('courier.pick_up_desc', 'Pick up and deliver these orders')} />
            {availableOrders.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {availableOrders.map((order: any) => (
                        <Col xs={24} sm={12} lg={8} key={order.id}>
                            <div className="delivery-card">
                                <div className="delivery-header">
                                    <span className="delivery-id">Order #{order.id}</span>
                                    <OrderStatusTag status={order.status} />
                                </div>
                                <div className="delivery-info">
                                    <div className="delivery-info-row">
                                        <UserOutlined />
                                        <span>{order.user?.name || 'Customer'}</span>
                                    </div>
                                    <div className="delivery-info-row">
                                        <DollarOutlined />
                                        <span>{Number(order.totalPrice).toLocaleString()} сўм</span>
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    icon={<CarOutlined />}
                                    onClick={() => handleUpdate(order.id, 'ON_THE_WAY')}
                                    style={{ borderRadius: 10, height: 42, fontWeight: 600 }}
                                >
                                    {t('courier.pick_up', 'Pick Up Order')}
                                </Button>
                            </div>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        <CarOutlined />
                    </div>
                    <h3>{t('courier.no_orders', 'No available orders')}</h3>
                    <p>{t('courier.check_back', 'Check back soon for new delivery assignments.')}</p>
                </div>
            )}
        </PageContainer>
    );
}
