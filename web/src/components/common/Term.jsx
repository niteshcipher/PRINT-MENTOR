import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useGameStore } from '../../store/useGameStore';

let cachedGlossary = null;

export default function Term({ name, children }) {
  const { user } = useGameStore();
  const [termData, setTermData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const termName = name || (typeof children === 'string' ? children : '');

  useEffect(() => {
    if (cachedGlossary) {
      matchTerm(cachedGlossary);
    } else {
      apiRequest('/glossary')
        .then(data => {
          cachedGlossary = data || [];
          matchTerm(cachedGlossary);
        })
        .catch(() => {});
    }
  }, [termName]);

  const matchTerm = (list) => {
    const clean = termName.toLowerCase().trim();
    const found = list.find(t => 
      t.term.toLowerCase().includes(clean) || clean.includes(t.term.toLowerCase().split(' ')[0])
    );
    if (found) setTermData(found);
  };

  const isIntermediate = user?.level === 'intermediate';
  const definition = termData ? (isIntermediate ? (termData.intermediate || termData.intermediate_def) : (termData.simple || termData.simple_def)) : null;

  if (!termData) {
    return <span>{children || name}</span>;
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span style={{
        borderBottom: '2px dotted #38bdf8',
        color: '#7dd3fc',
        fontWeight: 600
      }}>
        {children || termData.term}
      </span>

      {showTooltip && (
        <span style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          backgroundColor: '#0f172a',
          border: '2px solid #38bdf8',
          boxShadow: '3px 3px 0px 0px #000',
          padding: '10px 12px',
          zIndex: 100,
          color: '#f8fafc',
          fontSize: '11px',
          lineHeight: '1.4',
          textAlign: 'left',
          borderRadius: '2px',
          pointerEvents: 'none'
        }}>
          <span style={{ display: 'block', color: '#38bdf8', fontFamily: "'Press Start 2P', monospace", fontSize: '9px', marginBottom: '4px' }}>
            {termData.term}
          </span>
          <span style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px' }}>
            {definition}
          </span>
          {termData.analogy && (
            <span style={{ display: 'block', color: '#fbbf24', fontSize: '10px', fontStyle: 'italic', borderTop: '1px solid #334155', paddingTop: '4px' }}>
              💡 "{termData.analogy}"
            </span>
          )}
        </span>
      )}
    </span>
  );
}

