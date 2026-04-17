import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Check, Zap, Sparkles, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Perfect to test the waters.',
    monthlyPrice: 0,
    annualPrice: 0,
    color: '#8b96ff',
    gradient: 'linear-gradient(135deg,rgba(91,110,245,0.12),rgba(155,89,255,0.06))',
    border: 'rgba(91,110,245,0.25)',
    badge: null,
    cta: 'Get Started Free',
    ctaStyle: 'outline',
    features: [
      '3 docs & 1 YouTube video / mo',
      'Max file size: 5 MB',
      'Basic AI Notes & Flashcards',
      '10 AI Chat messages / mo',
      { text: 'Audio Podcasts', included: false },
      { text: 'Priority Support', included: false },
    ],
  },
  {
    id: 'scholar',
    name: 'Scholar',
    tagline: 'For individual dedicated students.',
    monthlyPrice: 299,
    annualPrice: 2499,
    color: '#fff',
    gradient: 'linear-gradient(135deg,#5b6ef5 0%,#9b59ff 100%)',
    border: 'rgba(91,110,245,0.6)',
    badge: 'Most Popular',
    cta: 'Start Scholar Plan',
    ctaStyle: 'solid-white',
    features: [
      'Unlimited Docs (25 MB each)',
      'Unlimited Notes, Flashcards & Quizzes',
      '500 AI Chat messages / mo',
      '10 Audio Podcasts / mo',
      'PPT Export & Mind Maps',
      { text: 'Priority Support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Power learners & educators.',
    monthlyPrice: 599,
    annualPrice: 4999,
    color: '#8b96ff',
    gradient: 'linear-gradient(135deg,rgba(0,192,107,0.12),rgba(91,110,245,0.08))',
    border: 'rgba(0,192,107,0.3)',
    badge: null,
    cta: 'Upgrade to Pro',
    ctaStyle: 'outline-green',
    features: [
      'Everything in Scholar',
      'Upload up to 100 MB',
      'Unlimited AI Chat messages',
      'Unlimited Audio Podcasts',
      'Classroom Feature (50 students)',
      'Priority 24/7 Support',
    ],
  },
];

const Pricing = () => {
  const [billing, setBilling] = useState('monthly');

  return (
    <Layout>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(91,110,245,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(91,110,245,0.1)', border: '1px solid rgba(91,110,245,0.25)', fontSize: 13, fontWeight: 700, color: '#8b96ff', marginBottom: 24 }}>
            <Sparkles size={13} /> Simple Pricing
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Plans for every learner
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 36 }}>
            Pick the plan that fits your study needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 99, padding: 4 }}>
            {['monthly', 'annually'].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: '9px 22px', borderRadius: 99,
                  background: billing === b ? '#5b6ef5' : 'transparent',
                  color: billing === b ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: billing === b ? '0 2px 12px rgba(91,110,245,0.4)' : 'none',
                }}
              >
                {b === 'monthly' ? 'Monthly' : 'Annually'}
                {b === 'annually' && (
                  <span style={{ background: '#00c06b', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>-30%</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'center' }}>
          {plans.map((plan) => {
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const isPopular = plan.badge === 'Most Popular';
            const unit = billing === 'monthly' ? '/mo' : '/yr';

            return (
              <div
                key={plan.id}
                style={{
                  background: plan.gradient,
                  border: `1px solid ${plan.border}`,
                  borderRadius: 28,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transform: isPopular ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: isPopular ? '0 24px 60px rgba(91,110,245,0.35)' : 'none',
                  zIndex: isPopular ? 1 : 0,
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 16px', borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(91,110,245,0.5)' }}>
                    ⭐ {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{plan.name}</h2>
                  <p style={{ fontSize: 13, color: isPopular ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{plan.tagline}</p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 46, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                      {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    {price !== 0 && (
                      <span style={{ fontSize: 14, color: isPopular ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 500 }}>{unit}</span>
                    )}
                  </div>
                  {billing === 'annually' && price !== 0 && (
                    <p style={{ fontSize: 12, color: '#00c06b', marginTop: 4, fontWeight: 600 }}>
                      ≈ ₹{Math.round(price / 12).toLocaleString('en-IN')}/month — billed yearly
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/signup"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '13px',
                    borderRadius: 12,
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    marginBottom: 28,
                    transition: 'all 0.2s ease',
                    ...(plan.ctaStyle === 'solid-white'
                      ? { background: '#fff', color: '#5b6ef5', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }
                      : plan.ctaStyle === 'outline-green'
                      ? { background: 'rgba(0,192,107,0.12)', border: '1px solid rgba(0,192,107,0.35)', color: '#00c06b' }
                      : { background: 'rgba(91,110,245,0.12)', border: '1px solid rgba(91,110,245,0.3)', color: '#8b96ff' }
                    ),
                  }}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
                  {plan.features.map((feat, i) => {
                    const isObj = typeof feat === 'object';
                    const text = isObj ? feat.text : feat;
                    const included = isObj ? feat.included : true;
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: included ? (isPopular ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)') : 'rgba(255,255,255,0.2)' }}>
                        {included
                          ? <Check size={15} color={isPopular ? '#00e5a0' : '#5b6ef5'} style={{ flexShrink: 0, marginTop: 1 }} />
                          : <X size={15} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 1 }} />
                        }
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ note */}
        <p style={{ textAlign: 'center', marginTop: 48, fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>
          All plans include a 24-hour full-feature trial. No credit card required.{' '}
          <Link to="/contact" style={{ color: '#8b96ff', textDecoration: 'none', fontWeight: 600 }}>Have questions? Contact us →</Link>
        </p>
      </section>
    </Layout>
  );
};

export default Pricing;
