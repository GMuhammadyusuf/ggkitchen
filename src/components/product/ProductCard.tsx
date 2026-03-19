'use client';

import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCart } from '@/components/cart/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description: string | null;
        price: number | any;
        image: string | null;
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { t } = useLanguage();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            image: product.image || undefined,
        });
        message.success(`${product.name} ${t('product.added_to_cart', 'added to cart')}`);
    };

    return (
        <div className="product-card">
            <div className="image-wrapper">
                <img
                    className="card-image"
                    alt={product.name}
                    src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'}
                />
                <div className="price-badge">
                    {Number(product.price).toLocaleString()} сўм
                </div>
            </div>
            <div className="card-body">
                <div className="card-title">{product.name}</div>
                <div className="card-desc">{product.description || t('product.default_desc', 'Freshly prepared with the finest ingredients.')}</div>
            </div>
            <div className="card-footer">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddToCart}
                    block
                    style={{ borderRadius: 10, fontWeight: 600 }}
                >
                    {t('product.add_to_cart', 'Add to Cart')}
                </Button>
            </div>
        </div>
    );
}
