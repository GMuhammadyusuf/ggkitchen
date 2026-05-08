'use client';

import { Form, Input, Select, Button, Card, Typography, Row, Col, List, message } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '@/components/cart/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useEffect } from 'react';

const { Text } = Typography;
const { Option } = Select;

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { mutateAsync: createOrder, isPending } = useCreateOrder();
    const { data: session } = useSession();
    const router = useRouter();

    const onFinish = async (values: any) => {
        if (!session) {
            message.warning('Please login to place an order');
            router.push('/auth/login');
            return;
        }

        try {
            const orderData = {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
                totalPrice: total,
                paymentMethod: values.paymentMethod,
                building: values.building,
                roomNumber: values.roomNumber,
            };

            await createOrder(orderData);
            message.success('Order placed successfully!');
            clearCart();
            router.push('/orders');
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to place order');
        }
    };

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    if (items.length === 0) {
        return null;
    }

    return (
        <PageContainer>
            <SectionTitle title="Checkout" subtitle="Complete your order" />

            <Form layout="vertical" onFinish={onFinish} size="large">
                <Row gutter={[32, 24]}>
                    <Col xs={24} lg={14}>
                        {/* Delivery */}
                        <Card
                            title={
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <EnvironmentOutlined style={{ color: '#1677ff' }} />
                                    Delivery Location
                                </span>
                            }
                            style={{ borderRadius: 16, marginBottom: 24, border: '1px solid #eaeaea' }}
                            variant="borderless"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="building"
                                        label="Building"
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <Input placeholder="e.g. Science Block A" style={{ borderRadius: 10 }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="roomNumber"
                                        label="Room Number"
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <Input placeholder="e.g. 302" style={{ borderRadius: 10 }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Payment */}
                        <Card
                            title={
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CreditCardOutlined style={{ color: '#1677ff' }} />
                                    Payment Method
                                </span>
                            }
                            style={{ borderRadius: 16, border: '1px solid #eaeaea' }}
                            variant="borderless"
                        >
                            <Form.Item
                                name="paymentMethod"
                                rules={[{ required: true }]}
                                initialValue="CASH"
                            >
                                <Select style={{ borderRadius: 10 }}>
                                    <Option value="CASH">💵 Cash on Delivery</Option>
                                    <Option value="CARD" disabled>💳 Card Payment (Coming Soon)</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={10}>
                        <div className="summary-card">
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShoppingCartOutlined style={{ color: '#1677ff' }} />
                                Order Summary
                            </h3>

                            {items.map(item => (
                                <div key={item.id} className="summary-row">
                                    <span style={{ color: '#6b7280' }}>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {(item.quantity * item.price).toLocaleString()} сўм
                                    </span>
                                </div>
                            ))}

                            <hr className="summary-divider" />

                            <div className="summary-row">
                                <span style={{ color: '#6b7280' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>{total.toLocaleString()} сўм</span>
                            </div>
                            <div className="summary-row">
                                <span style={{ color: '#6b7280' }}>Delivery</span>
                                <span style={{ fontWeight: 600, color: '#52c41a' }}>FREE</span>
                            </div>

                            <hr className="summary-divider" />

                            <div className="summary-row">
                                <span className="summary-total">Total</span>
                                <span className="summary-total" style={{ color: '#1677ff' }}>{total.toLocaleString()} сўм</span>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={isPending}
                                style={{ marginTop: 24, height: 52, borderRadius: 14, fontWeight: 700, fontSize: 16 }}
                            >
                                Place Order — {total.toLocaleString()} сўм
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </PageContainer>
    );
}
