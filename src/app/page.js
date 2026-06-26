import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
          Ecom<span className="gradient-text">TalentMatch</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard">
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Login</button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Start Free Trial</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section (PAS Framework) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background Glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '99px', color: '#818cf8', fontWeight: '500', fontSize: '0.9rem', animation: 'fadeInDown 0.6s ease-out' }}>
            ✨ Now indexing 3.2M+ verified e-commerce professionals
          </div>

          <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'fadeInUp 0.8s ease-out' }}>
            Hire top e-commerce talent.<br />
            <span className="gradient-text">In seconds, not weeks.</span>
          </h1>
          
          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6', animation: 'fadeInUp 1s ease-out' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Stop drowning in unqualified applicants.</strong> The wrong hire leads to missed messages and lost revenue. Access an AI-powered database of pre-vetted Shopify experts, customer support reps, and media buyers instantly.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animation: 'fadeInUp 1.2s ease-out' }}>
            <Link href="/dashboard">
              <button className="btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
                Search Candidates Now
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div style={{ marginTop: '6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', animation: 'fadeInUp 1.4s ease-out' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>AI Semantic Search</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Don't rely on basic keywords. Our AI understands complex queries like "Shopify expert fluent in Dutch under $10/hr" to find the exact match.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Instant Unlocks</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Skip the back-and-forth interviewing. Unlock full profiles with direct contact links and hire them on the spot.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Pre-vetted Data</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Every profile comes with parsed platform data, hours worked, activity status, and assessment scores so you hire with confidence.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
