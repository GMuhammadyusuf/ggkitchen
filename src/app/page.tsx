'use client';

import { Button, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@/components/ui/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === 'loading') return;
    const role = (session?.user as any)?.role;
    if (role === 'ADMIN') router.replace('/admin');
    if (role === 'COURIER') router.replace('/courier');
  }, [session, status, router]);

  const role = (session?.user as any)?.role;
  if (role === 'ADMIN' || role === 'COURIER') return null;

  return (
    <>
      {/* Hero Section */}
      <PageContainer>
        <div className="hero">
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} md={14}>
              <h1>{t('home.hero_title', 'Delicious Campus Food,\nDelivered to Your Door 🍕')}</h1>
              <p>
                {t('home.hero_subtitle', 'Fresh meals from our campus kitchen. Browse the menu, place your order, and get it delivered in minutes — right to your building.')}
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => router.push('/menu')}
                  style={{
                    height: 52,
                    paddingInline: 32,
                    fontSize: 16,
                    fontWeight: 600,
                    background: '#fff',
                    color: '#1677ff',
                    border: 'none',
                    borderRadius: 14,
                  }}
                >
                  {t('home.browse_menu', 'Browse Menu')}
                </Button>
                <Button
                  size="large"
                  ghost
                  onClick={() => router.push(session ? '/menu' : '/auth/register')}
                  style={{
                    height: 52,
                    paddingInline: 32,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 14,
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#fff',
                  }}
                >
                  {t('home.get_started', 'Get Started')}
                </Button>
              </div>
            </Col>
            <Col xs={24} md={10} style={{ position: 'relative', zIndex: 1 }}>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"
                alt="Delicious food"
                style={{
                  width: '100%',
                  borderRadius: 20,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              />
            </Col>
          </Row>
        </div>
      </PageContainer>

      {/* Features Section */}
      <PageContainer>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {t('home.why_title', 'Why CampusFood?')}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
            {t('home.why_subtitle', 'The easiest way to get food on campus')}
          </p>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="feature-card">
              <div className="feature-icon">
                <ThunderboltOutlined />
              </div>
              <h3>{t('home.feature_fast', 'Lightning Fast')}</h3>
              <p>{t('home.feature_fast_desc', 'Get your food delivered in under 20 minutes to any building on campus.')}</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="feature-card">
              <div className="feature-icon">
                <RocketOutlined />
              </div>
              <h3>{t('home.feature_easy', 'Easy Ordering')}</h3>
              <p>{t('home.feature_easy_desc', 'Browse, tap, order. Our simple interface makes ordering a breeze.')}</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="feature-card">
              <div className="feature-icon">
                <SafetyCertificateOutlined />
              </div>
              <h3>{t('home.feature_quality', 'Quality Meals')}</h3>
              <p>{t('home.feature_quality_desc', 'Prepared fresh daily by professional campus chefs with the best ingredients.')}</p>
            </div>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}
