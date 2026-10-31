import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { 
  Newspaper, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Clock, 
  Globe, 
  Zap,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function NewsTab() {
  const [articles, setArticles] = useState([]);
  const [ticker, setTicker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const categories = [
    { id: 'all', label: 'All Intel' },
    { id: 'equities', label: 'Equities & Nifty' },
    { id: 'mutual_funds', label: 'Mutual Funds & SIPs' },
    { id: 'rbi_macro', label: 'RBI & Macro' },
    { id: 'scam_alert', label: 'Scam Alerts' },
    { id: 'commodities', label: 'Gold & Commodities' }
  ];

  const fetchNews = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (forceRefresh) params.append('refresh', 'true');

      const url = `/news${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiRequest(url);

      setArticles(data.articles || []);
      setTicker(data.ticker || []);
      setLastUpdated(data.last_updated || new Date().toLocaleTimeString());
    } catch (err) {
      console.warn("Failed to fetch news from server, using fallback", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'BULLISH':
        return { color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', label: '▲ BULLISH' };
      case 'CAUTIOUS':
        return { color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', label: '▼ CAUTIOUS' };
      case 'WATCH':
        return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', label: '⚡ ALERT' };
      default:
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', label: '● NEUTRAL' };
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. TOP HEADER & LIVE SCRAPED TICKER */}
      <div className="pixel-box-cyan" style={{ padding: '22px 26px', backgroundColor: '#091524' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div className="pixel-badge" style={{ color: '#00f0ff', borderColor: '#00f0ff', marginBottom: '8px' }}>
              REAL-TIME WEB SCRAPED INTEL // MARKET NEWS DESK
            </div>
            <h2 className="font-pixel" style={{ fontSize: '17px', color: '#f8fafc', letterSpacing: '0.5px' }}>
              DAILY INVESTMENT NEWS & MACRO RADAR
            </h2>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '4px' }}>
              Aggregated daily dispatches across Indian equities, SIPs, RBI repo policy, and regulatory fraud bulletins.
            </p>
          </div>

          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="pixel-btn"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '11px', 
              padding: '10px 18px',
              backgroundColor: '#0f2238',
              borderColor: '#00f0ff',
              color: '#38bdf8'
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'SCRAPING LIVE...' : 'RE-SCRAPE FEEDS'}</span>
          </button>
        </div>

        {/* Live Index Ticker Strip */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
          gap: '10px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          {ticker.map((item, idx) => (
            <div 
              key={idx}
              style={{
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.18)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>{item.name}</div>
                <div className="font-pixel" style={{ fontSize: '12px', color: '#f8fafc', marginTop: '2px' }}>{item.value}</div>
              </div>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: 700, 
                color: item.isPositive ? '#34d399' : '#f87171' 
              }}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search investment news (e.g., SIP, Nifty, RBI, Gold, Crypto)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 38px',
                backgroundColor: '#0c1220',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            className="pixel-btn pixel-btn-green"
            style={{ fontSize: '11px', padding: '0 20px' }}
          >
            FILTER
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'rgba(15, 23, 42, 0.7)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SCROLLABLE ARTICLE LIST */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px', 
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
        paddingRight: '6px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div className="font-pixel" style={{ fontSize: '13px', color: '#00f0ff', marginBottom: '8px' }}>
              CONNECTING TO LIVE SCRAPING ENGINE...
            </div>
            <p style={{ fontSize: '12px' }}>Fetching latest financial dispatches and market sentiment.</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="pixel-box" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#0f172a' }}>
            <Newspaper size={32} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 className="font-pixel" style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '6px' }}>NO DISPATCHES FOUND</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Try searching another keyword or select All Intel.</p>
          </div>
        ) : (
          articles.map((item) => {
            const sentiment = getSentimentBadge(item.sentiment);
            return (
              <div 
                key={item.id}
                className="pixel-box"
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#0c1322',
                  border: '1px solid rgba(56, 189, 248, 0.16)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.16)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.source}
                    </span>
                    <span style={{ color: '#475569', fontSize: '11px' }}>•</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {item.published_at}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '4px',
                    color: sentiment.color,
                    background: sentiment.bg,
                    border: `1px solid ${sentiment.border}`,
                    letterSpacing: '0.5px'
                  }}>
                    {sentiment.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', lineHeight: '1.4', margin: '2px 0' }}>
                  {item.title}
                </h3>

                {/* Summary */}
                <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {item.summary}
                </p>

                {/* Mentor Key Takeaway Box */}
                {item.key_takeaway && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderLeft: '3px solid #00f0ff',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Sparkles size={14} color="#00f0ff" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <strong style={{ color: '#00f0ff' }}>TACTICAL LESSON:</strong> {item.key_takeaway}
                    </span>
                  </div>
                )}

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#38bdf8'}
                  >
                    <span>READ FULL DISPATCH</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

