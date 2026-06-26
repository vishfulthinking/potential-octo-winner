'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [aiMode, setAiMode] = useState(false);
  const [aiFilters, setAiFilters] = useState(null);

  useEffect(() => {
    fetchCandidates('', false);
  }, []);

  const fetchCandidates = async (searchQuery, useAi) => {
    setLoading(true);
    setAiFilters(null);
    try {
      const res = await fetch(`/api/candidates?q=${encodeURIComponent(searchQuery)}&ai=${useAi}`);
      const data = await res.json();
      if (data.data) {
        setCandidates(data.data);
        setTotal(data.total);
        if (data.aiFilters) {
          setAiFilters(data.aiFilters);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(query, aiMode);
  };

  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Talent <span className="gradient-text">Search</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Searching {total.toLocaleString()} candidates</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {status === 'loading' ? (
            <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
          ) : session ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {session.user?.email}
              </span>
              <span className="badge">Credits: {session.user?.credits ?? 0}</span>
              <button onClick={() => signOut()} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Log out</button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="btn-primary">Sign In to Unlock Profiles</button>
          )}
        </div>
      </div>

      <div className="glass-card mb-4">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            className="input-glass" 
            placeholder="e.g. Shopify customer support fluent in Dutch under $5/hr" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input 
              type="checkbox" 
              checked={aiMode}
              onChange={(e) => setAiMode(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }}
            />
            <span style={{ fontWeight: '500', color: aiMode ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>AI Search ✨</span>
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {aiFilters && (
        <div className="mb-8" style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px', display: 'inline-flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#818cf8', fontWeight: '600' }}>AI Parsed Filters:</span>
          {aiFilters.keywords && aiFilters.keywords.length > 0 && (
            <span style={{ fontSize: '0.9rem' }}>Keywords: <b>{aiFilters.keywords.join(', ')}</b></span>
          )}
          {aiFilters.max_rate !== null && (
            <span style={{ fontSize: '0.9rem' }}>Max Rate: <b>${aiFilters.max_rate}/hr</b></span>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Scanning database...</p>
        </div>
      ) : (
        <div className="grid-auto">
          {candidates.map(candidate => (
            <div key={candidate.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{candidate.title || 'E-commerce VA'}</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {candidate.skills && candidate.skills.split(',').slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="badge" style={{ fontSize: '0.75rem' }}>{skill.trim()}</span>
                ))}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexGrow: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {candidate.description || 'No description provided.'}
              </p>

              <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>{candidate.rateRaw || 'Negotiable'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last active: {candidate.lastActive || 'Recently'}</div>
                </div>
                <Link href={`/candidate/${candidate.id}`}>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Unlock Profile
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && candidates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No candidates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
