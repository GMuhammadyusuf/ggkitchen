'use client';

import { Row, Col, Avatar, Button, Skeleton, Card } from 'antd';
import { UserOutlined, MailOutlined, HistoryOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PageContainer } from '@/components/ui/PageContainer';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await axios.get('/api/me');
            return data;
        },
        enabled: !!session,
    });

    if (isLoading) {
        return (
            <PageContainer>
                <Skeleton active avatar={{ size: 100 }} paragraph={{ rows: 4 }} />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Profile Header */}
            <div className="profile-header">
                <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        fontSize: 40,
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 1,
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#fff' }}>
                        {user?.name || 'User'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: 0.85 }}>
                        <MailOutlined />
                        <span>{user?.email}</span>
                    </div>
                    <div style={{
                        marginTop: 8,
                        display: 'inline-block',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                    }}>
                        {user?.role}
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card
                        style={{ borderRadius: 16, border: '1px solid #eaeaea', height: '100%' }}
                        variant="borderless"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: '#e6f4ff', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#1677ff', fontSize: 18,
                            }}>
                                <EnvironmentOutlined />
                            </div>
                            <h3 style={{ fontWeight: 600, margin: 0 }}>Delivery Address</h3>
                        </div>
                        {user?.deliveryLocation ? (
                            <div style={{ color: '#6b7280', lineHeight: 2 }}>
                                <div><strong>Building:</strong> {user.deliveryLocation.building}</div>
                                <div><strong>Room:</strong> {user.deliveryLocation.roomNumber}</div>
                            </div>
                        ) : (
                            <p style={{ color: '#9ca3af' }}>No saved delivery location yet.</p>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        style={{ borderRadius: 16, border: '1px solid #eaeaea', height: '100%' }}
                        variant="borderless"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: '#e6f4ff', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#1677ff', fontSize: 18,
                            }}>
                                <HistoryOutlined />
                            </div>
                            <h3 style={{ fontWeight: 600, margin: 0 }}>Quick Actions</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Button
                                block
                                icon={<HistoryOutlined />}
                                onClick={() => router.push('/orders')}
                                style={{ borderRadius: 10, height: 42 }}
                            >
                                View Order History
                            </Button>
                            <Button
                                block
                                icon={<EditOutlined />}
                                style={{ borderRadius: 10, height: 42 }}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
}
