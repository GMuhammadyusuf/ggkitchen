'use client';

import { Layout } from 'antd';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

const { Content } = Layout;

export function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f7f8fa' }}>
                <Content style={{ flex: 1, background: '#f7f8fa' }}>
                    {children}
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f7f8fa' }}>
            <AppHeader />
            <Content style={{ flex: 1, background: '#f7f8fa' }}>
                {children}
            </Content>
            <AppFooter />
        </Layout>
    );
}
