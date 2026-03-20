'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export function AppFooter() {
    const { t } = useLanguage();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>🍳 GGKitchen</h3>
                    <p>
                        {t('footer.description', 'Fresh and delicious food delivered right to your campus room. Order in seconds, get it in minutes.')}
                    </p>
                </div>
                <div className="footer-links">
                    <h4>{t('footer.quick_links', 'Quick Links')}</h4>
                    <ul>
                        <li><Link href="/menu">{t('home.browse_menu', 'Browse Menu')}</Link></li>
                        <li><Link href="/orders">{t('header.my_orders', 'My Orders')}</Link></li>
                        <li><Link href="/cart">{t('header.shopping_cart', 'Shopping Cart')}</Link></li>
                        <li><Link href="/profile">{t('header.my_profile', 'My Profile')}</Link></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4>{t('footer.support', 'Support')}</h4>
                    <ul>
                        <li><a href="#">{t('footer.help_center', 'Help Center')}</a></li>
                        <li><a href="#">{t('footer.contact_us', 'Contact Us')}</a></li>
                        <li><a href="#">{t('footer.privacy_policy', 'Privacy Policy')}</a></li>
                        <li><a href="#">{t('footer.terms', 'Terms of Service')}</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                © {new Date().getFullYear()} GGKitchen. {t('footer.rights', 'All rights reserved.')}
            </div>
        </footer>
    );
}
