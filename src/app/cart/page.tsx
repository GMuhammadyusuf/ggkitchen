'use client';

import { Button, InputNumber, Row, Col, message } from 'antd';
import { DeleteOutlined, ArrowRightOutlined, ShoppingOutlined, MinusOutlined, PlusOutlined, LoginOutlined } from '@ant-design/icons';
import { useCart } from '@/components/cart/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total } = useCart();
    const router = useRouter();
    const { t } = useLanguage();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        const role = (session?.user as any)?.role;
        if (role === 'ADMIN') router.replace('/admin');
        if (role === 'COURIER') router.replace('/courier');
    }, [session, status, router]);

    const userRole = (session?.user as any)?.role;
    if (userRole === 'ADMIN' || userRole === 'COURIER') return null;

    if (items.length === 0) {
        return (
            <PageContainer>
                <div className="empty-state">
                    <div className="empty-icon">
                        <ShoppingOutlined />
                    </div>
                    <h3>{t('cart.empty_title', 'Your cart is empty')}</h3>
                    <p>{t('cart.empty_hint', "Looks like you haven't added any items yet. Explore the menu to get started!")}</p>
                    <Button type="primary" size="large" onClick={() => router.push('/menu')} style={{ borderRadius: 12 }}>
                        {t('home.browse_menu', 'Browse Menu')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <SectionTitle title={t('cart.title', 'Shopping Cart')} subtitle={`${items.length} ${t('cart.items_count', 'item(s) in your cart')}`} />

            <Row gutter={[32, 24]}>
                <Col xs={24} lg={16}>
                    {items.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <img
                                className="item-image"
                                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'}
                                alt={item.name}
                            />
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-price">{item.price.toLocaleString()} сўм {t('cart.each', 'each')}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Button
                                    size="small"
                                    icon={<MinusOutlined />}
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    style={{ borderRadius: 8 }}
                                />
                                <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                                    {item.quantity}
                                </span>
                                <Button
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    style={{ borderRadius: 8 }}
                                />
                            </div>
                            <div className="item-subtotal">{(item.price * item.quantity).toLocaleString()} сўм</div>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeItem(item.id)}
                                style={{ borderRadius: 8 }}
                            />
                        </div>
                    ))}
                </Col>
                <Col xs={24} lg={8}>
                    <div className="summary-card">
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{t('cart.order_summary', 'Order Summary')}</h3>
                        <div className="summary-row">
                            <span style={{ color: '#6b7280' }}>{t('cart.subtotal', 'Subtotal')}</span>
                            <span style={{ fontWeight: 600 }}>{total.toLocaleString()} сўм</span>
                        </div>
                        <div className="summary-row">
                            <span style={{ color: '#6b7280' }}>{t('cart.delivery', 'Delivery')}</span>
                            <span style={{ fontWeight: 600, color: '#52c41a' }}>{t('cart.free', 'FREE')}</span>
                        </div>
                        <hr className="summary-divider" />
                        <div className="summary-row">
                            <span className="summary-total">{t('cart.total', 'Total')}</span>
                            <span className="summary-total" style={{ color: '#1677ff' }}>{total.toLocaleString()} сўм</span>
                        </div>
                        {session ? (
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ArrowRightOutlined />}
                                onClick={() => router.push('/checkout')}
                                style={{ marginTop: 24, height: 48, borderRadius: 12, fontWeight: 600, fontSize: 16 }}
                            >
                                {t('cart.checkout', 'Checkout')}
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<LoginOutlined />}
                                onClick={() => router.push('/auth/login')}
                                style={{ marginTop: 24, height: 48, borderRadius: 12, fontWeight: 600, fontSize: 16 }}
                            >
                                {t('header.sign_in', 'Sign In')} →
                            </Button>
                        )}
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Link href="/menu" style={{ color: '#1677ff', fontSize: 14 }}>{t('cart.continue_shopping', '← Continue Shopping')}</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </PageContainer>
    );
}
