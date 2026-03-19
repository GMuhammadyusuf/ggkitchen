'use client';

import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const onFinish = async (values: any) => {
        const result = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        if (result?.error) {
            message.error(result.error);
        } else {
            message.success(t('auth.welcome_msg', 'Welcome back!'));
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🍔</div>
                    <div className="auth-title">{t('auth.welcome_back', 'Welcome Back')}</div>
                    <div className="auth-subtitle">{t('auth.sign_in_subtitle', 'Sign in to your CampusFood account')}</div>
                </div>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Enter a valid email' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                            placeholder={t('auth.email_placeholder', 'Email address')}
                            style={{ borderRadius: 10, height: 46 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                            placeholder={t('auth.password_placeholder', 'Password')}
                            style={{ borderRadius: 10, height: 46 }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 12 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            style={{ height: 48, borderRadius: 12, fontWeight: 600, fontSize: 16 }}
                        >
                            {t('auth.sign_in', 'Sign In')}
                        </Button>
                    </Form.Item>
                </Form>
                <div className="auth-footer">
                    {t('auth.no_account', "Don't have an account?")}{' '}
                    <Link href="/auth/register" style={{ color: '#1677ff', fontWeight: 600 }}>
                        {t('auth.sign_up', 'Sign up')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
