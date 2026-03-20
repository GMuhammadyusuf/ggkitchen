'use client';

import { Badge, Button, Dropdown, Drawer, Input, Tooltip } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuOutlined,
    HistoryOutlined,
    SearchOutlined,
    BellOutlined,
    CloseOutlined,
    GiftOutlined,
    HomeOutlined,
    CoffeeOutlined,
    FileTextOutlined,
    SettingOutlined,
    CarOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/components/cart/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const PROMO_MESSAGES = [
    '🔥 20% OFF all burgers today! Use code BURGER20',
    '🎉 Free delivery on orders over $15!',
    '⭐ New! Try our Chef\'s Special Pasta — limited time only',
    '🍕 Buy 2 Pizzas, Get 1 FREE this week!',
];

interface NavItem {
    key: string;
    label: string;
    icon: React.ReactNode;
}

export function AppHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { items } = useCart();
    const { data: orders } = useOrders();
    const { language, setLanguage, t } = useLanguage();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [bannerVisible, setBannerVisible] = useState(true);
    const [currentPromo, setCurrentPromo] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const searchInputRef = useRef<any>(null);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const activeOrderCount = orders?.filter(
        (o: any) => !['DELIVERED', 'CANCELED'].includes(o.status)
    ).length || 0;

    // Track scroll for header style change
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Rotate promo messages
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPromo((prev) => (prev + 1) % PROMO_MESSAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Auto-focus search
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 200);
        }
    }, [searchOpen]);

    const handleSearch = (value: string) => {
        if (value.trim()) {
            router.push(`/menu?search=${encodeURIComponent(value.trim())}`);
            setSearchOpen(false);
            setSearchValue('');
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'uz' : 'en');
    };

    const userRole = (session?.user as any)?.role;

    const navItems: NavItem[] = [];

    if (!userRole || userRole === 'STUDENT' || userRole === 'TEACHER') {
        // Students and Teachers (and guests) see the ordering pages
        navItems.push(
            { key: '/', label: t('nav.home', 'Home'), icon: <HomeOutlined /> },
            { key: '/menu', label: t('nav.menu', 'Menu'), icon: <CoffeeOutlined /> },
        );
        if (userRole) {
            navItems.push({ key: '/orders', label: t('nav.orders', 'Orders'), icon: <FileTextOutlined /> });
        }
    }

    if (userRole === 'ADMIN') {
        navItems.push({ key: '/admin', label: t('nav.admin', 'Admin'), icon: <SettingOutlined /> });
    }

    if (userRole === 'COURIER') {
        navItems.push({ key: '/courier', label: t('nav.deliveries', 'Deliveries'), icon: <CarOutlined /> });
    }

    const showCart = !userRole || userRole === 'STUDENT' || userRole === 'TEACHER';

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: t('header.my_profile', 'My Profile'),
            onClick: () => router.push('/profile'),
        },
        {
            key: 'orders',
            icon: <HistoryOutlined />,
            label: t('header.my_orders', 'My Orders'),
            onClick: () => router.push('/orders'),
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            icon: signingOut ? undefined : <LogoutOutlined />,
            label: signingOut ? 'Signing out...' : t('header.sign_out', 'Sign Out'),
            danger: true,
            disabled: signingOut,
            onClick: async () => {
                setSigningOut(true);
                await signOut();
            },
        },
    ];

    const userName = (session?.user as any)?.name || session?.user?.email?.split('@')[0] || 'there';

    return (
        <>
            {/* Promo Banner */}
            {bannerVisible && (
                <div className="promo-banner">
                    <div className="promo-banner-inner">
                        <GiftOutlined className="promo-icon" />
                        <span className="promo-text" key={currentPromo}>
                            {PROMO_MESSAGES[currentPromo]}
                        </span>
                    </div>
                    <button className="promo-close" onClick={() => setBannerVisible(false)} aria-label="Close banner">
                        <CloseOutlined />
                    </button>
                </div>
            )}

            {/* Main Header */}
            <header className={`app-header ${scrolled ? 'header-scrolled' : ''}`}>
                <div className="header-inner">
                    {/* Logo */}
                    <Link href="/" className="header-logo">
                        <div className="header-logo-mark">
                            <span>G</span>
                        </div>
                        <div className="header-logo-text">
                            <span className="header-logo-name">GG<span className="header-logo-accent">Kitchen</span></span>
                            <span className="header-logo-tagline">{t('header.fresh_fast', 'Fresh & Fast')}</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header-nav-desktop">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                className={`nav-link ${pathname === item.key ? 'nav-link-active' : ''}`}
                                onClick={() => router.push(item.key)}
                            >
                                {item.label}
                                {pathname === item.key && <span className="nav-indicator" />}
                            </button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {/* Search */}
                        <div className={`header-search ${searchOpen ? 'header-search-open' : ''}`}>
                            {searchOpen ? (
                                <div className="search-input-wrap">
                                    <Input
                                        ref={searchInputRef}
                                        placeholder={t('header.search_food', 'Search food...')}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onPressEnter={() => handleSearch(searchValue)}
                                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                                        suffix={
                                            <CloseOutlined
                                                style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}
                                                onClick={() => { setSearchOpen(false); setSearchValue(''); }}
                                            />
                                        }
                                        style={{ borderRadius: 12, height: 40, border: '1.5px solid #e5e7eb' }}
                                    />
                                </div>
                            ) : (
                                <Tooltip title={t('header.search_menu', 'Search menu')}>
                                    <button className="header-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                                        <SearchOutlined />
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        {/* Language Switcher */}
                        <Tooltip title={language === 'en' ? "O'zbekcha" : 'English'}>
                            <button
                                className="header-icon-btn header-lang-btn"
                                onClick={toggleLanguage}
                                aria-label="Change language"
                            >
                                <GlobalOutlined />
                                <span className="lang-label">{language === 'en' ? 'EN' : 'UZ'}</span>
                            </button>
                        </Tooltip>

                        {/* Notification Bell — only for students/teachers */}
                        {showCart && (
                        <Tooltip title={activeOrderCount > 0 ? `${activeOrderCount} ${t('header.active_orders', 'active orders')}` : t('header.no_active_orders', 'No active orders')}>
                            <button
                                className={`header-icon-btn ${activeOrderCount > 0 ? 'icon-btn-active' : ''}`}
                                onClick={() => router.push('/orders')}
                                aria-label="Notifications"
                            >
                                <BellOutlined />
                                {activeOrderCount > 0 && <span className="icon-btn-dot" />}
                            </button>
                        </Tooltip>
                        )}

                        {/* Cart — only for students/teachers */}
                        {showCart && (
                        <Tooltip title={t('header.cart', 'Cart')}>
                            <button className="header-icon-btn header-cart-btn" onClick={() => router.push('/cart')} aria-label="Cart">
                                <ShoppingCartOutlined />
                                {cartCount > 0 && <span className="cart-count">{cartCount > 9 ? '9+' : cartCount}</span>}
                            </button>
                        </Tooltip>
                        )}

                        {/* Divider */}
                        <div className="header-divider" />

                        {/* User / Sign In */}
                        {session ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                                <button className="header-user-btn">
                                    <span className="header-user-avatar">{userName.charAt(0).toUpperCase()}</span>
                                    <span className="header-user-name">{userName}</span>
                                </button>
                            </Dropdown>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => router.push('/auth/login')}
                                className="header-signin-btn"
                            >
                                {t('header.sign_in', 'Sign In')}
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button className="header-mobile-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                            <MenuOutlined />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <Drawer
                title={null}
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                size="default"
                styles={{ body: { padding: 0 }, header: { display: 'none' } }}
            >
                {/* Drawer Header */}
                <div className="drawer-header">
                    <div className="drawer-logo-mark">G</div>
                    <div>
                        {session ? (
                            <>
                                <div className="drawer-user-name">Hi, {userName} 👋</div>
                                <div className="drawer-user-email">{session.user?.email}</div>
                            </>
                        ) : (
                            <>
                                <div className="drawer-user-name">{t('header.welcome', 'Welcome!')} 👋</div>
                                <div className="drawer-user-email">{t('header.sign_in_to_order', 'Sign in to order food')}</div>
                            </>
                        )}
                    </div>
                    <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>
                        <CloseOutlined />
                    </button>
                </div>

                {/* Drawer Nav */}
                <div className="drawer-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={`drawer-nav-item ${pathname === item.key ? 'drawer-nav-active' : ''}`}
                            onClick={() => { router.push(item.key); setDrawerOpen(false); }}
                        >
                            <span className="drawer-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Language Switcher in Drawer */}
                <div className="drawer-section">
                    <div className="drawer-section-title">{t('header.quick_actions', 'Quick Actions')}</div>
                    <button className="drawer-action-item" onClick={toggleLanguage}>
                        <GlobalOutlined />
                        <span>{language === 'en' ? "O'zbekcha" : 'English'}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                            {language === 'en' ? '🇺🇿' : '🇬🇧'}
                        </span>
                    </button>
                    <button className="drawer-action-item" onClick={() => { router.push('/cart'); setDrawerOpen(false); }}>
                        <ShoppingCartOutlined />
                        <span>{t('header.shopping_cart', 'Shopping Cart')}</span>
                        {cartCount > 0 && <Badge count={cartCount} size="small" />}
                    </button>
                    {activeOrderCount > 0 && (
                        <button className="drawer-action-item" onClick={() => { router.push('/orders'); setDrawerOpen(false); }}>
                            <BellOutlined />
                            <span>{t('header.active_orders', 'Active Orders')}</span>
                            <Badge count={activeOrderCount} size="small" color="#52c41a" />
                        </button>
                    )}
                </div>

                {/* Drawer Footer */}
                <div className="drawer-footer">
                    {session ? (
                        <>
                            <Button block icon={<UserOutlined />} onClick={() => { router.push('/profile'); setDrawerOpen(false); }}
                                style={{ borderRadius: 12, height: 44, marginBottom: 8 }}>
                                {t('header.my_profile', 'My Profile')}
                            </Button>
                            <Button block danger icon={signingOut ? undefined : <LogoutOutlined />} onClick={async () => { setSigningOut(true); await signOut(); }}
                loading={signingOut}
                disabled={signingOut}
                style={{ borderRadius: 12, height: 44 }}>
                {t('header.sign_out', 'Sign Out')}
            </Button>
                        </>
                    ) : (
                        <Button block type="primary" onClick={() => { router.push('/auth/login'); setDrawerOpen(false); }}
                            style={{ borderRadius: 12, height: 48, fontWeight: 600, fontSize: 15 }}>
                            {t('header.sign_in', 'Sign In')}
                        </Button>
                    )}
                </div>
            </Drawer>
        </>
    );
}
