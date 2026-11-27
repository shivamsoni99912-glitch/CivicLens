import type { AiAnalysis } from '../lib/types';
import { PriorityBadge } from './Badges';
import { IconSparkle } from './icons';

interface Props {
  analysis: AiAnalysis;
  onApplyCategory?: () => void;
}

export default function AiResultCard({ analysis, onApplyCategory }: { analysis: AiAnalysis; onApplyCategory?: () => void }) {
  return (
    <div className="ai-card">
      <div className="ai-card__head">
        <span className="ai-card__spark" aria-hidden="true">
          <IconSparkle width={18} height={18} />
        </span>
        <div>
          <h3>AI analysis</h3>
          <p>On-device triage · {analysis.confidence}% confidence</p>
        </div>
      </div>

      <div className="ai-card__facts">
        <div className="ai-card__fact">
          <span className="meta-label">Predicted category</span>
          <strong>{analysis.category}</strong>
        </div>
        <div className="ai-card__fact">
          <span className="meta-label">Suggested priority</span>
          <PriorityBadge priority={analysis.priority} />
        </div>
      </div>

      <div className="meter" aria-hidden="true">
        <span style={{ width: `${analysis.confidence}%` }} />
      </div>

      <p className="ai-card__explain">{analysis.explanation}</p>

      {analysis.signals.length > 0 && (
        <div className="chips" aria-label="Detected keywords">
          {analysis.signals.map((signal) => (
            <span key={signal} className="chip">
              {signal}
            </span>
          ))}
        </div>
      )}

      <div className="ai-card__foot">
        <span>Typical response: {analysis.responseWindow}</span>
        {onApplyCategory && (
          <button type="button" className="link-btn" onClick={onApplyCategory}>
            Use this category
          </button>
        )}
      </div>
    </div>
  );
}
