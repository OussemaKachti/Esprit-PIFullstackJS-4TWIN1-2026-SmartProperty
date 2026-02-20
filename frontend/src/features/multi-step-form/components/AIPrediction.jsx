const fmtPrice = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
  </svg>
);

const AIPrediction = ({ useAI, onToggle, aiLoading, aiResult, onUsePrice }) => (
  <>
    <div className="ts-toggle-section">
      <div className="ts-toggle-left">
        <div className="ts-ai-icon"><SparkIcon /></div>
        <div className="ts-toggle-label-wrap">
          <div className="ts-toggle-label">AI Price Prediction</div>
          <div className="ts-toggle-sub">Get a smart estimate based on your property data</div>
        </div>
      </div>
      <label className="ts-switch">
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="ts-slider" />
      </label>
    </div>

    {/* Skeleton loader */}
    {aiLoading && (
      <div className="ts-ai-loading">
        <div className="ts-skeleton" style={{ width: "40%" }} />
        <div className="ts-skeleton" style={{ width: "65%", height: "28px" }} />
        <div className="ts-skeleton" style={{ width: "80%" }} />
        <div className="ts-skeleton" style={{ width: "55%" }} />
      </div>
    )}

    {aiResult && !aiLoading && (
      <div className="ts-ai-result">
        <div className="ts-ai-result-header">
          <div className="ts-ai-result-title">AI Estimated Price</div>
          <div className="ts-ai-badge">AI</div>
        </div>

        <div className="ts-ai-price-row">
          <div className="ts-ai-price">{fmtPrice(aiResult.suggested)}</div>
          <div className="ts-ai-range">
            {fmtPrice(aiResult.low)} – {fmtPrice(aiResult.high)}
          </div>
        </div>

        <div className="ts-ai-confidence">
          <div className="ts-ai-confidence-track">
            <div
              className="ts-ai-confidence-fill"
              style={{ width: `${aiResult.confidence}%` }}
            />
          </div>
          <div className="ts-ai-confidence-label">{aiResult.confidence}% confidence</div>
        </div>

        <button className="ts-use-ai-btn" onClick={() => onUsePrice(aiResult.suggested)}>
          Use this price
        </button>
      </div>
    )}
  </>
);

export default AIPrediction;