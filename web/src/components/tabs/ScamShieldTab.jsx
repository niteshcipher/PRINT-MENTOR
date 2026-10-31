import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { ShieldAlert, AlertTriangle, CheckCircle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const FALLBACK_SAMPLES = [
  {
    title: "VIP Telegram Bot",
    is_scam: true,
    text: "Join our secret VIP Telegram group! 100% guaranteed 25% weekly returns on secret crypto trading bot. Deposit 5000 now to unlock."
  },
  {
    title: "Penny Stock Urgency",
    is_scam: true,
    text: "URGENT penny stock tip: Tomorrow it will hit upper circuit 20%. Put your full salary before market opens at 9:15 AM!"
  },
  {
    title: "Double Money in 48h",
    is_scam: true,
    text: "Hey bro, transfer ₹10,000 to my verified algo trading bot and I will double your money within 48 hours with zero risk guaranteed!"
  },
  {
    title: "Pyramid Forex Scheme",
    is_scam: true,
    text: "Deposit ₹15,000 in Global Forex Pool and earn ₹2,000 daily return, plus ₹3,000 referral bonus for every friend you recruit to join!"
  },
  {
    title: "Advance Release Fee",
    is_scam: true,
    text: "Your account has accumulated ₹2,50,000 profits! Please send money for 15% tax deposit first before we can release and transfer your payout."
  },
  {
    title: "Index Fund SIP",
    is_scam: false,
    text: "Invest in low-cost NIFTY 50 Index Fund via direct plan with 0.1% expense ratio for a 10-year compounding horizon."
  },
  {
    title: "Bank FD / PPF",
    is_scam: false,
    text: "Public Provident Fund (PPF) offering 7.1% tax-free annual returns backed by the Government of India, or scheduled bank FD insured up to ₹5 lakh by DICGC."
  }
];

export default function ScamShieldTab() {
  const [inputTip, setInputTip] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [samples, setSamples] = useState(FALLBACK_SAMPLES);

  useEffect(() => {
    apiRequest('/scam/samples')
      .then(data => {
        if (data && data.length > 0) setSamples(data);
      })
      .catch(() => {});
  }, []);

  const handleAnalyze = async (textToScan) => {
    const text = textToScan || inputTip;
    if (!text.trim() || analyzing) return;

    setAnalyzing(true);
    try {
      const res = await apiRequest('/scam/check', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      setResult(res);
    } catch (e) {
      alert("Analysis failed: " + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getMeterColor = (score) => {
    if (score >= 60) return '#ef4444';
    if (score >= 30) return '#f59e0b';
    return '#10b981';
  };

  // Render text with highlighted character spans
  const renderHighlightedText = () => {
    if (!result || !result.spans || result.spans.length === 0) {
      return <span>{inputTip}</span>;
    }

    const elements = [];
    let lastIndex = 0;
    const sortedSpans = [...result.spans].sort((a, b) => a.start - b.start);

    sortedSpans.forEach((span, idx) => {
      if (span.start > lastIndex) {
        elements.push(inputTip.substring(lastIndex, span.start));
      }
      elements.push(
        <mark
          key={idx}
          title={span.label}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            padding: '2px 4px',
            borderRadius: '2px',
            fontWeight: 600,
            borderBottom: '2px solid #b91c1c'
          }}
        >
          {inputTip.substring(span.start, span.end)}
        </mark>
      );
      lastIndex = Math.max(lastIndex, span.end);
    });

    if (lastIndex < inputTip.length) {
      elements.push(inputTip.substring(lastIndex));
    }

    return elements;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#211217', borderColor: '#ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={26} color="#fca5a5" />
          </div>
          <div>
            <div className="pixel-badge" style={{ color: '#ef4444', borderColor: '#ef4444', marginBottom: '4px' }}>
              SEBI FRAUD & SOCIAL MEDIA DETECTOR
            </div>
            <h2 className="font-pixel" style={{ fontSize: '15px', color: '#fef2f2' }}>
              SCAM SHIELD: UNMASK FRAUDULENT STOCK TIPS
            </h2>
            <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '2px' }}>
              Paste any forwarded message, Telegram invitation, or "guaranteed return" claim. We scan for illegal pump-and-dump patterns and highlight red-flag phrases.
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="pixel-box" style={{ padding: '24px' }}>
        <h3 className="font-pixel" style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '12px' }}>
          PASTE SUSPICIOUS FINANCIAL MESSAGE OR TIP
        </h3>

        <textarea
          rows={4}
          value={inputTip}
          onChange={(e) => setInputTip(e.target.value)}
          placeholder="e.g. 'Brother, guaranteed 30% monthly return! Transfer ₹5,000 to our secret VIP Telegram bot before slots fill up tonight!'"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#141d2c',
            border: '2px solid #334155',
            color: '#fff',
            fontSize: '13px',
            lineHeight: '1.5',
            borderRadius: '2px',
            marginBottom: '14px'
          }}
        />

        {/* 7 Sample Chips: 5 Scam & 2 Neutral */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            Test with 7 curated real-world examples (5 Scams vs 2 Legitimate):
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {samples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setInputTip(sample.text); handleAnalyze(sample.text); }}
                className="pixel-btn"
                style={{
                  fontSize: '8px',
                  padding: '5px 8px',
                  backgroundColor: sample.is_scam ? '#2e1215' : '#11221b',
                  borderColor: sample.is_scam ? '#7f1d1d' : '#047857'
                }}
              >
                {sample.is_scam ? "⚠️" : "🛡️"} {sample.title}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleAnalyze()}
          disabled={analyzing || !inputTip.trim()}
          className="pixel-btn pixel-btn-danger"
          style={{ width: '100%', fontSize: '11px', padding: '12px' }}
        >
          {analyzing ? "SCANNING FOR FRAUD PATTERNS..." : "RUN SCAM SHIELD SCANNER"}
        </button>
      </div>

      {/* SCAN RESULTS PANEL */}
      {result && (
        <div className="pixel-box" style={{ padding: '28px', backgroundColor: '#131b28', borderTop: `4px solid ${getMeterColor(result.risk_score)}` }}>
          {/* Top verdict & Risk Meter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>DETECTION VERDICT</div>
              <h3 className="font-pixel" style={{ fontSize: '16px', color: getMeterColor(result.risk_score), marginTop: '4px' }}>
                {result.verdict}
              </h3>
            </div>

            {/* Risk Gauge */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>RISK SCORE</div>
              <div className="font-pixel" style={{ fontSize: '24px', color: getMeterColor(result.risk_score) }}>
                {result.risk_score} / 100
              </div>
            </div>
          </div>

          {/* Animated Meter progress bar */}
          <div style={{ height: '14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              height: '100%',
              width: `${result.risk_score}%`,
              backgroundColor: getMeterColor(result.risk_score),
              transition: 'width 0.8s ease-in-out'
            }}></div>
          </div>

          {/* Highlighted text inspection with character spans */}
          {result.spans && result.spans.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>
                🔍 RED-FLAG PHRASES HIGHLIGHTED:
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#1a1f2e',
                border: '1px solid #374151',
                borderRadius: '4px',
                color: '#f8fafc',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                {renderHighlightedText()}
              </div>
            </div>
          )}

          {/* Flagged Red Flags */}
          {result.flagged_keywords && result.flagged_keywords.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>
                🚨 DETECTED SCAM PATTERNS:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {result.flagged_keywords.map((flag, i) => (
                  <span key={i} className="pixel-badge" style={{ color: '#ef4444', borderColor: '#ef4444', backgroundColor: '#7f1d1d22' }}>
                    ⚠️ {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div style={{ padding: '16px', backgroundColor: '#1b2436', borderRadius: '4px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600, marginBottom: '6px' }}>
              🧐 PLAIN-LANGUAGE ANALYSIS:
            </div>
            <p style={{ fontSize: '13px', color: '#f1f5f9', lineHeight: '1.6' }}>
              {result.explanation}
            </p>
          </div>

          {/* Safer Alternatives */}
          <div style={{ padding: '16px', backgroundColor: '#0c261e', border: '1px solid #10b981', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> SAFER REGULATED ALTERNATIVE:
            </div>
            <p style={{ fontSize: '13px', color: '#ecfdf5', lineHeight: '1.5' }}>
              {result.safer_alternative}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
