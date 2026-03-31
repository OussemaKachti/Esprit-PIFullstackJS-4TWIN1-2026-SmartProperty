import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMatches, fetchCreditScore } from '../api/matching';
import { getCurrentUser } from '../api/user';
import '../styles/rentalMatch.css';

const PROPERTY_TYPES = [
  'Appartements',
  'Maisons et Villas',
  'Locations de vacances',
];

const EMPLOYMENT_TYPES = ['CDI', 'CDD', 'freelance', 'retired', 'unemployed'];

const initialCandidate = {
  name: 'Ahmed Ben Ali',
  budget_max: 800,
  city: 'Tunis',
  min_rooms: 2,
  preferred_categories: ['Appartements'],
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

function buildHint(candidate) {
  if (!candidate.city) return 'Conseil: indiquez votre ville pour de meilleures correspondances.';
  const budget = candidate.budget_max || 0;
  if (budget < 500) return `Budget serré pour ${candidate.city}. Élargissez aux 1-2 pièces ou zones périphériques.`;
  if (budget > 1500) return `Budget confortable pour ${candidate.city}. Regardez les quartiers centraux et récents.`;
  return `Budget équilibré pour ${candidate.city}. Les appartements 2-3 pièces tournent autour de ${Math.round(budget)} TND.`;
}

function buildMatchSummary(matches) {
  if (!matches || matches.length === 0) return 'Les correspondances apparaîtront ici après recherche.';
  const best = matches[0];
  const avg = matches.reduce((s, m) => s + (m.score_pct || 0), 0) / matches.length;
  return `Top choix: ${best.category} à ${best.city} (score ${best.score_pct}%). Score moyen ${avg.toFixed(1)}%.`;
}

function buildCreditSummary(result) {
  if (!result) return 'Le résumé de crédit apparaîtra après l évaluation.';
  const { recommendation, score } = result;
  if (recommendation === 'ACCEPT') return `✅ Solide: score ${score}. Le dossier semble prêt sans réserve majeure.`;
  if (recommendation === 'GUARANTEE') return `⚠️ Mitigé: score ${score}. Un garant ou des pièces supplémentaires peuvent aider.`;
  return `❌ Fragile: score ${score}. Réduire le loyer ou ajouter un garant améliorerait vos chances.`;
}

export default function RentalMatch() {
  const [candidate, setCandidate] = useState(initialCandidate);
  const [credit, setCredit] = useState(initialCredit);
  const [matches, setMatches] = useState([]);
  const [creditResult, setCreditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure scrolling is enabled (some pages toggle body overflow)
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
    setCredit((prev) => ({ ...prev, rent_asked: candidate.budget_max || 0 }));
  }, [candidate.budget_max]);

  // Accept auth payloads from backoffice window to persist JWT/user
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

      // Refresh profile to ensure downstream fetches succeed with the new token
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

  // Prefill candidate from backend profile when logged in as TENANT
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
        // Silent fallback to defaults when not authenticated
        console.warn('Unable to prefill user profile:', err.message);
      }
    };
    loadUser();
  }, []);

  const hint = useMemo(() => buildHint(candidate), [candidate]);
  const matchSummary = useMemo(() => buildMatchSummary(matches), [matches]);
  const creditSummary = useMemo(() => buildCreditSummary(creditResult), [creditResult]);

  const handleCandidateChange = (field, value) => {
    setCandidate((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category) => {
    setCandidate((prev) => {
      const current = prev.preferred_categories || [];
      const exists = current.includes(category);
      const updated = exists ? current.filter((c) => c !== category) : [...current, category];
      return { ...prev, preferred_categories: updated };
    });
  };

  const handleDocumentToggle = (doc) => {
    setCredit((prev) => ({
      ...prev,
      documents: { ...prev.documents, [doc]: !prev.documents[doc] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const matchPayload = { ...candidate, top_n: 3 };
      const creditPayload = { ...credit, rent_asked: candidate.budget_max || credit.rent_asked };
      const [matchRes, creditRes] = await Promise.all([
        fetchMatches(matchPayload),
        fetchCreditScore(creditPayload),
      ]);
      setMatches(matchRes.matches || matchRes.data || []);
      setCreditResult(creditRes);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="page-wrapper">
        <div className="breadcrumb-bar">
          <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
          <div className="row align-items-center text-center position-relative z-1">
            <div className="col-md-12 col-12 breadcrumb-arrow">
              <h1 className="breadcrumb-title">Rental Match</h1>
              <nav aria-label="breadcrumb" className="page-breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Rental Match</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="content overflow-hidden">
          <div className="container">

            <form onSubmit={handleSubmit} className="row g-4">
              <div className="col-xl-5">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-white d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Profil candidat</p>
                      <h5 className="mb-0">Vos critères</h5>
                    </div>
                    <span className="badge bg-primary-subtle text-primary">Step 1</span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label className="form-label">Nom complet</label>
                        <input
                          type="text"
                          className="form-control"
                          value={candidate.name || ''}
                          onChange={(e) => handleCandidateChange('name', e.target.value)}
                          placeholder="Ahmed Ben Ali"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Budget max (TND / mois)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={candidate.budget_max || ''}
                          onChange={(e) => handleCandidateChange('budget_max', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Ville</label>
                        <input
                          type="text"
                          className="form-control"
                          value={candidate.city || ''}
                          onChange={(e) => handleCandidateChange('city', e.target.value)}
                          placeholder="Tunis"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Chambres min</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={candidate.min_rooms || ''}
                          onChange={(e) => handleCandidateChange('min_rooms', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Taille min (m²)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={candidate.min_size || ''}
                          onChange={(e) => handleCandidateChange('min_size', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-muted mb-2">Types de biens préférés</p>
                      <div className="d-flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map((type) => {
                          const active = candidate.preferred_categories?.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              className={`btn btn-sm rounded-pill ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => toggleCategory(type)}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-white d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Évaluation crédit</p>
                      <h5 className="mb-0">Stabilité financière</h5>
                    </div>
                    <span className="badge bg-success-subtle text-success">Step 2</span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Revenu mensuel net (TND)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={credit.monthly_income}
                          onChange={(e) => setCredit((p) => ({ ...p, monthly_income: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Loyer envisagé (TND)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={credit.rent_asked}
                          onChange={(e) => setCredit((p) => ({ ...p, rent_asked: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Dettes mensuelles (TND)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={credit.total_monthly_debts}
                          onChange={(e) => setCredit((p) => ({ ...p, total_monthly_debts: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Type d'emploi</label>
                        <select
                          className="form-select"
                          value={credit.employment_type}
                          onChange={(e) => setCredit((p) => ({ ...p, employment_type: e.target.value }))}
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Ancienneté (mois)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={credit.months_employed}
                          onChange={(e) => setCredit((p) => ({ ...p, months_employed: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="row g-2 mt-3">
                      {Object.keys(credit.documents).map((docKey) => (
                        <div className="col-md-6" key={docKey}>
                          <div className="form-check form-switch bg-light p-2 rounded-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={credit.documents[docKey]}
                              onChange={() => handleDocumentToggle(docKey)}
                              id={`doc-${docKey}`}
                            />
                            <label className="form-check-label ms-1" htmlFor={`doc-${docKey}`}>
                              {docKey.replace(/_/g, ' ')}
                            </label>
                          </div>
                        </div>
                      ))}
                      <div className="col-md-12">
                        <div className="form-check form-switch bg-light p-2 rounded-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={credit.has_guarantor}
                            onChange={() => setCredit((p) => ({ ...p, has_guarantor: !p.has_guarantor }))}
                            id="doc-guarantor"
                          />
                          <label className="form-check-label ms-1" htmlFor="doc-guarantor">Garant disponible</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="card h-100 shadow-sm ai-helper-card">
                  <div className="card-header bg-white">
                    <p className="text-muted mb-1 small">AI helper</p>
                    <h5 className="mb-0">Conseils instantanés</h5>
                  </div>
                  <div className="card-body d-flex flex-column gap-3">
                    <div className="alert alert-primary-soft mb-0">
                      <p className="fw-semibold mb-1">Conseil de saisie</p>
                      <p className="mb-0 text-muted">{hint}</p>
                    </div>
                    <div className="alert alert-info-soft mb-0">
                      <p className="fw-semibold mb-1">Résumé matching</p>
                      <p className="mb-0 text-muted">{matchSummary}</p>
                    </div>
                    <div className="alert alert-success-soft mb-0">
                      <p className="fw-semibold mb-1">Résumé crédit</p>
                      <p className="mb-0 text-muted">{creditSummary}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 d-flex align-items-center gap-3 mt-2">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Calcul en cours...' : 'Obtenir mes 3 meilleures offres'}
                </button>
                {error && <span className="text-danger fw-semibold">{error}</span>}
                <span className="text-muted small">Les résumés AI sont générés localement (sans LLM externe).</span>
              </div>
            </form>

            <div className="section pt-0">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-muted mb-1 small">Résultats</p>
                  <h4 className="mb-0">Top 3 correspondances</h4>
                </div>
                <span className="badge bg-soft-primary text-primary fw-semibold">Compatibilité</span>
              </div>

              <div className="row g-3">
                {matches && matches.length > 0 ? (
                  matches.slice(0, 3).map((m) => (
                    <div className="col-lg-4" key={`${m.rank}-${m.city}-${m.price}`}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between">
                            <div>
                              <p className="text-muted small mb-1">#{m.rank || '-'} • {m.category}</p>
                              <h6 className="mb-1">{m.city}{m.region ? ` — ${m.region}` : ''}</h6>
                              <p className="mb-2 fw-semibold text-primary">{m.price?.toFixed ? `${m.price.toFixed(0)} TND / mois` : `${m.price} TND / mois`}</p>
                            </div>
                            <div className="score-pill">
                              <span>{m.score_pct ?? Math.round((m.score || 0) * 100)}</span>
                              <small>%</small>
                            </div>
                          </div>
                          <p className="text-muted mb-2">🛏 {m.room_count} • 🛁 {m.bathroom_count ?? '-'} • 📐 {m.size} m²</p>
                          <p className="mb-2">{m.explanation}</p>
                          {m.breakdown && (
                            <div className="d-flex flex-wrap gap-2">
                              {Object.entries(m.breakdown).map(([k, v]) => (
                                <span key={k} className="badge bg-light text-dark border">{k.replace('_', ' ')}: {v}%</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-secondary mb-0">Lancez une recherche pour voir les résultats.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="section pt-0 pb-5">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-muted mb-1 small">Crédit</p>
                  <h4 className="mb-0">Votre décision</h4>
                </div>
              </div>

              {creditResult ? (
                <div className="card credit-card shadow">
                  <div className="card-body row g-3 align-items-center">
                    <div className="col-md-3 text-center">
                      <div className={`pill pill-${(creditResult.recommendation || '').toLowerCase()}`}>
                        {creditResult.recommendation || '—'}
                      </div>
                      <p className="display-6 fw-bold mb-0 text-dark">{creditResult.score}</p>
                      <p className="text-muted mb-0">Score / 100</p>
                    </div>
                    <div className="col-md-9">
                      <p className="mb-3">{creditResult.explanation}</p>
                      <div className="row g-2">
                        {creditResult.breakdown && Object.entries(creditResult.breakdown).map(([k, v]) => (
                          <div key={k} className="col-md-4">
                            <div className="bg-light rounded-3 p-3 h-100 border">
                              <p className="text-muted mb-1 text-capitalize">{k.replace('_', ' ')}</p>
                              <p className="fw-semibold mb-0">{v}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-secondary">Remplissez le formulaire pour obtenir le verdict crédit.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
