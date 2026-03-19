'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { queryClient } from '@/lib/query-client';
import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';

import { CartProvider } from '@/components/cart/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <CartProvider>
                    <LanguageProvider>
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#1677ff',
                                    borderRadius: 12,
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    colorBgContainer: '#ffffff',
                                    colorBgLayout: '#f7f8fa',
                                    colorBorder: '#eaeaea',
                                    colorText: '#1f1f1f',
                                    colorTextSecondary: '#6b7280',
                                    controlHeight: 40,
                                    fontSize: 14,
                                },
                                components: {
                                    Button: {
                                        borderRadius: 10,
                                        controlHeight: 40,
                                        controlHeightLG: 48,
                                        paddingContentHorizontal: 24,
                                    },
                                    Card: {
                                        borderRadiusLG: 16,
                                    },
                                    Input: {
                                        borderRadius: 10,
                                        controlHeight: 42,
                                    },
                                    Select: {
                                        borderRadius: 10,
                                        controlHeight: 42,
                                    },
                                    Table: {
                                        borderRadius: 12,
                                        headerBg: '#fafafa',
                                    },
                                    Tag: {
                                        borderRadiusSM: 6,
                                    },
                                    Menu: {
                                        itemBorderRadius: 8,
                                    },
                                    Modal: {
                                        borderRadiusLG: 16,
                                    },
                                },
                            }}
                        >
                            {children}
                        </ConfigProvider>
                    </LanguageProvider>
                </CartProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
