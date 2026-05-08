'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Input, Skeleton, Empty, Button } from 'antd';
import { SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { PageContainer } from '@/components/ui/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: categories } = useCategories();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        const role = (session?.user as any)?.role;
        if (role === 'ADMIN') router.replace('/admin');
        if (role === 'COURIER') router.replace('/courier');
    }, [session, status, router]);

    const userRole = (session?.user as any)?.role;
    if (userRole === 'ADMIN' || userRole === 'COURIER') return null;

    const filteredProducts = products?.filter((product: any) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {/* Menu Hero */}
            <PageContainer>
                <div className="hero" style={{ marginBottom: 0 }}>
                    <h1>{t('menu.hero_title', 'What are you craving? 🍽️')}AAAAAAlmaz</h1>
                    <p>{t('menu.hero_subtitle', 'Browse our fresh menu and order your favorites.')}</p>
                    <div style={{ marginTop: 24, maxWidth: 480, position: 'relative', zIndex: 1 }}>
                        <Input
                            placeholder={t('menu.search_placeholder', 'Search for food...')}
                            prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
                            size="large"
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                borderRadius: 14,
                                height: 52,
                                fontSize: 16,
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            }}
                        />
                    </div>
                </div>
            </PageContainer>

            {/* Category Pills */}
            <PageContainer>
                <div className="category-pills">
                    <button
                        className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        🍽️ {t('menu.all', 'All')}
                    </button>
                    {categories?.map((cat: any) => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {productsLoading ? (
                    <Row gutter={[24, 24]}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Skeleton.Image active style={{ width: '100%', height: 200, borderRadius: 16 }} />
                                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 12 }} />
                            </Col>
                        ))}
                    </Row>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                    <Row gutter={[20, 20]}>
                        {filteredProducts.map((product: any) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <ShoppingOutlined />
                        </div>
                        <h3>{t('menu.no_dishes', 'No dishes found')}</h3>
                        <p>{t('menu.no_dishes_hint', 'Try adjusting your search or browse a different category.')}</p>
                        <Button type="primary" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                            {t('menu.clear_filters', 'Clear Filters')}
                        </Button>
                    </div>
                )}
            </PageContainer>
        </>
    );
}
