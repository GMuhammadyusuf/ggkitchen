'use client';

import { Form, Input, Button, Select, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Option } = Select;

export default function RegisterPage() {
    const router = useRouter();

    const onFinish = async (values: any) => {
        try {
            await axios.post('/api/register', values);
            message.success('Account created! Please sign in.');
            router.push('/auth/login');
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: 460 }}>
                <div className="auth-header">
                    <div className="auth-logo">🍔</div>
                    <div className="auth-title">Create Account</div>
                    <div className="auth-subtitle">Join CampusFood and start ordering</div>
                </div>
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{ role: 'STUDENT' }}
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                            placeholder="Full name"
                            style={{ borderRadius: 10, height: 46 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Enter a valid email' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                            placeholder="Email address"
                            style={{ borderRadius: 10, height: 46 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter a password' },
                            { min: 6, message: 'Minimum 6 characters' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                            placeholder="Password"
                            style={{ borderRadius: 10, height: 46 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label={<span style={{ fontWeight: 500, color: '#6b7280' }}>I am a</span>}
                        rules={[{ required: true }]}
                    >
                        <Select style={{ borderRadius: 10 }}>
                            <Option value="STUDENT">🎓 Student</Option>
                            <Option value="TEACHER">👨‍🏫 Teacher</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 12 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            style={{ height: 48, borderRadius: 12, fontWeight: 600, fontSize: 16 }}
                        >
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>
                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: '#1677ff', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
