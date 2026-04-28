import type { Evidence } from '../types';

interface EvidenceCardProps {
  evidence: Evidence;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

export function EvidenceCard({ evidence, selected, locked, onClick }: EvidenceCardProps) {
  return (
    <button className={`evidence-card ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`} onClick={onClick} disabled={locked}>
      <span className="evidence-icon">{locked ? '🔒' : evidence.icon}</span>
      <span className="evidence-main">
        <strong>{locked ? '未收集证据' : evidence.name}</strong>
        <small>{locked ? '继续调查以解锁' : evidence.description}</small>
        {!locked && (
          <span className="evidence-meta">来源：{evidence.source}｜可信度 {evidence.credibility}</span>
        )}
      </span>
    </button>
  );
}
