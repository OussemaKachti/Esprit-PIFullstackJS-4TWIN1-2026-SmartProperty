import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchMatches, fetchCreditScore } from '../api/matching';
import { getCurrentUser } from '../api/user';
import '../styles/rentalMatch.css';

const PROPERTY_TYPES = [
  'apartments',
  'housesVillas',
  'holidayRentals',
];

const EMPLOYMENT_OPTIONS = [
  { value: 'CDI', labelKey: 'cdi' },
  { value: 'CDD', labelKey: 'cdd' },
  { value: 'freelance', labelKey: 'freelance' },
  { value: 'retired', labelKey: 'retired' },
  { value: 'unemployed', labelKey: 'unemployed' },
];

const DOCUMENT_LABELS = {
  national_id: 'nationalId',
  payslips_3months: 'payslips3months',
  bank_statement: 'bankStatement',
  employment_contract: 'employmentContract',
  tax_notice: 'taxNotice',
};

const initialCandidate = {
  name: 'Ahmed Ben Ali',
  budget_max: 800,
  city: 'Tunis',
  min_rooms: 2,
  preferred_categories: ['apartments'],
  min_size: 70,
};

const initialCredit = {
  monthly_income: 2500,
  rent_asked: initialCandidate.budget_max,
  total_monthly_debts: 300,
  employment_type: 'CDI',
  months_employed: 24,
  has_guarantor: false,
  documents: {
    national_id: true,
    payslips_3months: true,
    bank_statement: true,
    employment_contract: true,
    tax_notice: false,
  },
};

const formatTnd = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 'N/A';
  return `${numberValue.toLocaleString('en-US').replace(/,/g, ' ')} TND`;
};

const clampScore = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numberValue)));
};

const getMatchScore = (match) => clampScore(match?.score_pct ?? (Number(match?.score || 0) * 100));

const getRecommendationMeta = (recommendation, t) => {
  switch (recommendation) {
    case 'ACCEPT':
      return {
        label: t('rentalMatch.credit.meta.accept.label'),
        tone: 'accept',
        icon: 'verified',
        note: t('rentalMatch.credit.meta.accept.note'),
      };
    case 'GUARANTEE':
      return {
        label: t('rentalMatch.credit.meta.guarantee.label'),
        tone: 'warn',
        icon: 'handshake',
        note: t('rentalMatch.credit.meta.guarantee.note'),
      };
    default:
      return {
        label: t('rentalMatch.credit.meta.reject.label'),
        tone: 'danger',
        icon: 'gpp_bad',
        note: t('rentalMatch.credit.meta.reject.note'),
      };
  }
};

function buildHint(candidate, t) {
  if (!candidate.city) return t('rentalMatch.insights.hints.noCity');
  const budget = candidate.budget_max || 0;
  if (budget < 500) return t('rentalMatch.insights.hints.lowBudget', { city: candidate.city });
  if (budget > 1500) return t('rentalMatch.insights.hints.highBudget', { city: candidate.city });
  return t('rentalMatch.insights.hints.midBudget', { city: candidate.city, budget: Math.round(budget) });
}

function buildMatchSummary(matches, t) {
  if (!matches || matches.length === 0) return t('rentalMatch.results.emptySummary');
  const best = matches[0];
  const avg = matches.reduce((sum, match) => sum + getMatchScore(match), 0) / matches.length;
  return t('rentalMatch.results.summary', {
    category: best.category,
    city: best.city,
    score: getMatchScore(best),
    avg: avg.toFixed(1),
  });
}

function buildCreditSummary(result, t) {
  if (!result) return t('rentalMatch.credit.emptySummary');
  const { recommendation, score } = result;
  if (recommendation === 'ACCEPT') return t('rentalMatch.credit.summary.accept', { score });
  if (recommendation === 'GUARANTEE') return t('rentalMatch.credit.summary.guarantee', { score });
  return t('rentalMatch.credit.summary.reject', { score });
}

export default function RentalMatch() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [candidate, setCandidate] = useState(initialCandidate);
  const [credit, setCredit] = useState(initialCredit);
  const [matches, setMatches] = useState([]);
  const [creditResult, setCreditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const city = searchParams.get('city');
    const budget = searchParams.get('budget_max') || searchParams.get('budget');
    if (city || budget) {
      setCandidate((prev) => ({
        ...prev,
        city: city || prev.city,
        budget_max: budget ? Number(budget) || prev.budget_max : prev.budget_max,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const enableScrolling = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
      document.documentElement.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
    };

    const initializePlugins = () => {
      enableScrolling();
      if (window.AOS) {
        window.AOS.refresh();
        window.AOS.init({ duration: 1200, once: true });
      }
    };

    enableScrolling();
    const timer = setTimeout(initializePlugins, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCredit((prev) => ({ ...prev, rent_asked: candidate.budget_max ?? 0 }));
  }, [candidate.budget_max]);

  useEffect(() => {
    const handleMessage = async (event) => {
      const payload = event?.data;
      if (!payload || payload.type !== 'AUTH_FROM_BACKOFFICE') return;

      if (payload.token) {
        window.localStorage.setItem('token', payload.token);
      }
      if (payload.user) {
        window.localStorage.setItem('user', JSON.stringify(payload.user));
        const fullName = [payload.user.firstName, payload.user.lastName].filter(Boolean).join(' ')
          || payload.user.login
          || payload.user.email;
        setCandidate((prev) => ({ ...prev, name: fullName }));
      }

      try {
        const user = await getCurrentUser();
        if (user?.role === 'TENANT') {
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
            || user.login
            || user.email;
          setCandidate((prev) => ({ ...prev, name: fullName }));
        }
      } catch (err) {
        console.warn('Auth sync failed:', err.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.role === 'TENANT') {
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
            || user.login
            || user.email;
          setCandidate((prev) => ({
            ...prev,
            name: fullName,
          }));
        }
      } catch (err) {
        console.warn('Unable to prefill user profile:', err.message);
      }
    };
    loadUser();
  }, []);

  const hint = useMemo(() => buildHint(candidate, t), [candidate, t]);
  const matchSummary = useMemo(() => buildMatchSummary(matches, t), [matches, t]);
  const creditSummary = useMemo(() => buildCreditSummary(creditResult, t), [creditResult, t]);
  const documentEntries = useMemo(
    () => Object.keys(credit.documents || {}).map((key) => ({
      key,
      label: t(`rentalMatch.documents.${DOCUMENT_LABELS[key] || key}`, { defaultValue: key.replace(/_/g, ' ') }),
    })),
    [credit.documents, t]
  );

  const bestMatch = matches[0] || null;
  const bestMatchScore = bestMatch ? getMatchScore(bestMatch) : 0;
  const creditMeta = useMemo(
    () => getRecommendationMeta(creditResult?.recommendation, t),
    [creditResult?.recommendation, t]
  );
  const documentCount = Object.values(credit.documents || {}).filter(Boolean).length;

  const handleCandidateChange = (field, value) => {
    setCandidate((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentToggle = (doc) => {
    setCredit((prev) => ({
      ...prev,
      documents: { ...prev.documents, [doc]: !prev.documents[doc] },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const matchPayload = {
        ...candidate,
        budget_max: Number(candidate.budget_max) || 0,
        min_rooms: Number(candidate.min_rooms) || 0,
        min_size: Number(candidate.min_size) || 0,
        top_n: 3,
      };
      const creditPayload = {
        ...credit,
        rent_asked: Number(candidate.budget_max) || Number(credit.rent_asked) || 0,
      };

      const [matchRes, creditRes] = await Promise.all([
        fetchMatches(matchPayload),
        fetchCreditScore(creditPayload),
      ]);

      setMatches(matchRes.matches || matchRes.data || []);
      setCreditResult(creditRes);
    } catch (err) {
      setError(err.message || t('rentalMatch.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper rental-match-page">
      <div className="page-wrapper">
        <div className="breadcrumb-bar">
          <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
          <div className="row align-items-center text-center position-relative z-1">
            <div className="col-md-12 col-12 breadcrumb-arrow">
              <h1 className="breadcrumb-title">{t('rentalMatch.pageTitle')}</h1>
              <nav aria-label="breadcrumb" className="page-breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <span><i className="material-icons-outlined me-1">home</i></span>
                      {t('common.home')}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">{t('rentalMatch.pageTitle')}</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="content rental-match-content">
          <div className="container">

            <div className="rental-match-overview p-4 p-lg-5 mb-4">
              <div className="row align-items-center g-4">
                <div className="col-lg-7">
                  <h2 className="mb-2" style={{ fontWeight: 800 }}>
                    {t('rentalMatch.hero.title', { defaultValue: 'Find your best rental match' })}
                  </h2>
                  <p className="text-muted mb-0" style={{ lineHeight: 1.7 }}>
                    {t('rentalMatch.hero.subtitle', {
                      defaultValue:
                        'Tell us your needs and documents. We will recommend the most suitable listings and provide a clear credit decision.',
                    })}
                  </p>
                </div>
                <div className="col-lg-5">
                  <div className="rental-match-hero__stats">
                    <div className="match-stat">
                      <span className="match-stat__label">{t('rentalMatch.hero.stats.city', { defaultValue: 'City' })}</span>
                      <span className="match-stat__value">{candidate.city || t('rentalMatch.insights.anyCity')}</span>
                      <span className="match-stat__note">{t('rentalMatch.hero.stats.cityNote', { defaultValue: 'Used to prioritize nearby listings' })}</span>
                    </div>
                    <div className="match-stat">
                      <span className="match-stat__label">{t('rentalMatch.hero.stats.budget', { defaultValue: 'Budget' })}</span>
                      <span className="match-stat__value">{formatTnd(candidate.budget_max)}</span>
                      <span className="match-stat__note">{t('rentalMatch.hero.stats.budgetNote', { defaultValue: 'Maximum monthly rent' })}</span>
                    </div>
                    <div className="match-stat">
                      <span className="match-stat__label">{t('rentalMatch.hero.stats.top', { defaultValue: 'Top matches' })}</span>
                      <span className="match-stat__value">3</span>
                      <span className="match-stat__note">{t('rentalMatch.hero.stats.topNote', { defaultValue: 'Ranked by fit score' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rental-match-grid">
              <section className="rental-panel rental-panel--candidate">
                <div className="rental-panel__header">
                  <p className="rental-panel__eyebrow">{t('rentalMatch.candidate.step')}</p>
                  <h2 className="rental-panel__title">{t('rentalMatch.candidate.title')}</h2>
                  <p className="rental-panel__description">{t('rentalMatch.candidate.description')}</p>
                </div>
                <div className="rental-panel__body">
                  <div className="match-field">
                    <label className="form-label">{t('rentalMatch.candidate.fields.fullName')}</label>
                    <input
                      type="text"
                      className="form-control rental-input"
                      value={candidate.name ?? ''}
                      onChange={(e) => handleCandidateChange('name', e.target.value)}
                      placeholder={t('rentalMatch.candidate.placeholders.fullName')}
                    />
                  </div>

                  <div className="match-field-grid">
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.candidate.fields.maxBudget')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={candidate.budget_max ?? ''}
                        onChange={(e) => handleCandidateChange('budget_max', Number(e.target.value))}
                      />
                    </div>
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.candidate.fields.city')}</label>
                      <input
                        type="text"
                        className="form-control rental-input"
                        value={candidate.city ?? ''}
                        onChange={(e) => handleCandidateChange('city', e.target.value)}
                        placeholder={t('rentalMatch.candidate.placeholders.city')}
                      />
                    </div>
                  </div>

                  <div className="match-field-grid">
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.candidate.fields.minRooms')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={candidate.min_rooms ?? ''}
                        onChange={(e) => handleCandidateChange('min_rooms', Number(e.target.value))}
                      />
                    </div>
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.candidate.fields.minSize')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={candidate.min_size ?? ''}
                        onChange={(e) => handleCandidateChange('min_size', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="match-section">
                    <div className="match-section__heading">
                      <p className="match-section__label">{t('rentalMatch.candidate.preferredTypes')}</p>
                      <span className="match-section__count">{t('rentalMatch.candidate.selectedCount', { count: candidate.preferred_categories?.length || 0 })}</span>
                    </div>
                    <div className="rental-chip-group">
                      {PROPERTY_TYPES.map((type) => {
                        const active = candidate.preferred_categories?.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            className={`rental-chip ${active ? 'active' : ''}`}
                            onClick={() => {
                              const current = candidate.preferred_categories || [];
                              const updated = current.includes(type)
                                ? current.filter((item) => item !== type)
                                : [...current, type];
                              handleCandidateChange('preferred_categories', updated);
                            }}
                            aria-pressed={active}
                          >
                            {t(`rentalMatch.propertyTypes.${type}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rental-panel rental-panel--credit">
                <div className="rental-panel__header">
                  <p className="rental-panel__eyebrow">{t('rentalMatch.credit.step')}</p>
                  <h2 className="rental-panel__title">{t('rentalMatch.credit.title')}</h2>
                  <p className="rental-panel__description">{t('rentalMatch.credit.description')}</p>
                </div>
                <div className="rental-panel__body">
                  <div className="match-field-grid">
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.monthlyIncome')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={credit.monthly_income ?? ''}
                        onChange={(e) => setCredit((prev) => ({ ...prev, monthly_income: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.rentAsked')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={credit.rent_asked ?? ''}
                        onChange={(e) => setCredit((prev) => ({ ...prev, rent_asked: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="match-field-grid">
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.monthlyDebts')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={credit.total_monthly_debts ?? ''}
                        onChange={(e) => setCredit((prev) => ({ ...prev, total_monthly_debts: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.employmentType')}</label>
                      <select
                        className="form-select rental-input"
                        value={credit.employment_type}
                        onChange={(e) => setCredit((prev) => ({ ...prev, employment_type: e.target.value }))}
                      >
                        {EMPLOYMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{t(`rentalMatch.credit.employmentOptions.${option.labelKey}`)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="match-field-grid">
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.monthsEmployed')}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rental-input"
                        value={credit.months_employed ?? ''}
                        onChange={(e) => setCredit((prev) => ({ ...prev, months_employed: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="match-field">
                      <label className="form-label">{t('rentalMatch.credit.fields.guarantor')}</label>
                      <button
                        type="button"
                        className={`rental-chip rental-chip--toggle w-100 ${credit.has_guarantor ? 'active' : ''}`}
                        onClick={() => setCredit((prev) => ({ ...prev, has_guarantor: !prev.has_guarantor }))}
                        aria-pressed={credit.has_guarantor}
                      >
                        <span className="rental-chip__indicator">{credit.has_guarantor ? '✓' : ''}</span>
                        <span className="rental-chip__label">{t('rentalMatch.credit.guarantorAvailable')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="match-section">
                    <div className="match-section__heading">
                      <p className="match-section__label">{t('rentalMatch.documents.title')}</p>
                      <span className="match-section__count">{t('rentalMatch.documents.confirmedCount', { count: documentCount })}</span>
                    </div>
                    <div className="match-doc-grid">
                      {documentEntries.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          className={`credit-doc-chip rental-doc-chip ${credit.documents[key] ? 'active' : ''}`}
                          onClick={() => handleDocumentToggle(key)}
                          aria-pressed={credit.documents[key]}
                        >
                          <span className="credit-doc-chip__indicator">{credit.documents[key] ? '✓' : ''}</span>
                          <span className="credit-doc-chip__label">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rental-panel rental-panel--insights">
                <div className="rental-panel__header">
                  <p className="rental-panel__eyebrow">{t('rentalMatch.insights.step')}</p>
                  <h2 className="rental-panel__title">{t('rentalMatch.insights.title')}</h2>
                  <p className="rental-panel__description">{t('rentalMatch.insights.description')}</p>
                </div>
                <div className="rental-panel__body">
                  <div className="match-summary-stack">
                    <div className="match-summary-tile">
                      <span>{t('rentalMatch.insights.tiles.budgetCeiling')}</span>
                      <strong>{formatTnd(candidate.budget_max)}</strong>
                    </div>
                    <div className="match-summary-tile">
                      <span>{t('rentalMatch.insights.tiles.preferredCity')}</span>
                      <strong>{candidate.city || t('rentalMatch.insights.anyCity')}</strong>
                    </div>
                    <div className="match-summary-tile">
                      <span>{t('rentalMatch.insights.tiles.roomTarget')}</span>
                      <strong>{candidate.min_rooms ?? 0}+</strong>
                    </div>
                    <div className="match-summary-tile">
                      <span>{t('rentalMatch.insights.tiles.selectedDocs')}</span>
                      <strong>{documentCount}</strong>
                    </div>
                  </div>

                  <div className="rental-tip-card rental-tip-card--primary">
                    <p className="rental-tip-card__label">{t('rentalMatch.insights.searchHint')}</p>
                    <p className="rental-tip-card__text">{hint}</p>
                  </div>

                  <div className="rental-tip-card rental-tip-card--secondary">
                    <p className="rental-tip-card__label">{t('rentalMatch.insights.creditInsight')}</p>
                    <p className="rental-tip-card__text">{creditSummary}</p>
                  </div>

                  <div className="rental-cta-stack">
                    <button type="submit" className="btn btn-primary btn-lg rental-cta-button" disabled={loading}>
                      {loading ? t('rentalMatch.actions.loading') : t('rentalMatch.actions.submit')}
                    </button>
                    <p className="rental-cta-note">{matchSummary}</p>
                    {error && <div className="alert alert-danger mb-0">{error}</div>}
                  </div>
                </div>
              </aside>
            </form>

            <section className="rental-results-section">
              <div className="section-heading rental-results-header">
                <div>
                  <p className="section-heading__eyebrow">{t('rentalMatch.results.eyebrow')}</p>
                  <h2 className="section-heading__title">{t('rentalMatch.results.title')}</h2>
                  <p className="section-heading__copy">{t('rentalMatch.results.copy')}</p>
                </div>
                <span className="results-badge">{t('rentalMatch.results.badge')}</span>
              </div>

              {loading ? (
                <div className="rental-state-card">
                  <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                  <h3>{t('rentalMatch.actions.loadingTitle')}</h3>
                  <p>{t('rentalMatch.actions.loadingCopy')}</p>
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="match-grid">
                  {matches.slice(0, 3).map((match, index) => {
                    const score = getMatchScore(match);
                    const scoreTone = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'fair';
                    const breakdownEntries = Object.entries(match.breakdown || {});

                    return (
                      <article className={`match-card match-card--${scoreTone}`} key={`${match.rank}-${match.city}-${match.price}-${index}`}>
                        <div className="match-card__top">
                          <div>
                            <p className="match-card__eyebrow">#{match.rank || index + 1}</p>
                            <h3 className="match-card__city">{match.city}{match.region ? ` — ${match.region}` : ''}</h3>
                            <p className="match-card__category">{match.category}</p>
                          </div>

                          <div className="match-score-ring" style={{ background: `conic-gradient(#2563eb ${score}%, rgba(148, 163, 184, 0.18) 0)` }}>
                            <div className="match-score-ring__inner">
                              <strong className="match-score-ring__value">{score}</strong>
                              <span className="match-score-ring__suffix">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="match-card__body">
                          <div className="match-card__price">{match.price?.toFixed ? `${match.price.toFixed(0)} TND / ${t('rentalMatch.common.month')}` : `${match.price} TND / ${t('rentalMatch.common.month')}`}</div>
                          <div className="match-card__facts">
                            <span className="match-fact">🛏 {match.room_count}</span>
                            <span className="match-fact">🛁 {match.bathroom_count ?? '-'}</span>
                            <span className="match-fact">📐 {match.size} m²</span>
                          </div>

                          <p className="match-card__explanation">{match.explanation}</p>

                          {breakdownEntries.length > 0 && (
                            <div className="match-breakdown">
                              {breakdownEntries.map(([key, value]) => (
                                <span key={key} className="match-breakdown__pill">
                                  {t(`rentalMatch.breakdownLabels.${key}`, { defaultValue: key.replace(/_/g, ' ') })}: {value}%
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="match-card__footer">
                            <Link
                              to={`/rent-property-grid?city=${encodeURIComponent(match.city || '')}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              {t('rentalMatch.results.exploreCityListings')}
                            </Link>
                            {index === 0 && <span className="match-card__badge">{t('rentalMatch.results.bestMatch')}</span>}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rental-state-card">
                  <i className="material-icons-outlined rental-state-card__icon">search_off</i>
                  <h3>{t('rentalMatch.results.noMatchesTitle')}</h3>
                  <p>{t('rentalMatch.results.noMatchesCopy')}</p>
                </div>
              )}
            </section>

            <section className="credit-verdict-section">
              <div className="section-heading rental-results-header">
                <div>
                  <p className="section-heading__eyebrow">{t('rentalMatch.credit.verdictEyebrow')}</p>
                  <h2 className="section-heading__title">{t('rentalMatch.credit.verdictTitle')}</h2>
                  <p className="section-heading__copy">{t('rentalMatch.credit.verdictCopy')}</p>
                </div>
              </div>

              {creditResult ? (
                <div className={`credit-verdict-card credit-verdict-card--${creditMeta.tone}`}>
                  <div className="credit-verdict-card__header">
                    <div>
                      <p className="credit-verdict-card__eyebrow">{t('rentalMatch.credit.decision')}</p>
                      <h3 className="credit-verdict-card__title">{creditMeta.label}</h3>
                      <p className="credit-verdict-card__copy">{creditResult.explanation}</p>
                    </div>
                    <div className="credit-score-badge">
                      <strong>{creditResult.score}</strong>
                      <span>/100</span>
                    </div>
                  </div>

                  <div className="credit-verdict-card__note">
                    <i className="material-icons-outlined">{creditMeta.icon}</i>
                    <span>{creditMeta.note}</span>
                  </div>

                  <div className="credit-breakdown-grid">
                    {creditResult.breakdown && Object.entries(creditResult.breakdown).map(([key, value]) => (
                      <div key={key} className="credit-breakdown-item">
                        <span className="credit-breakdown-item__label">{t(`rentalMatch.breakdownLabels.${key}`, { defaultValue: key.replace(/_/g, ' ') })}</span>
                        <strong className="credit-breakdown-item__value">{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rental-state-card rental-state-card--soft">
                  <i className="material-icons-outlined rental-state-card__icon">fact_check</i>
                  <h3>{t('rentalMatch.credit.pendingTitle')}</h3>
                  <p>{t('rentalMatch.credit.pendingCopy')}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}