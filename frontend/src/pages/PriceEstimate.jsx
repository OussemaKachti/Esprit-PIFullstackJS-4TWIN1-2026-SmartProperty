import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { estimateRentalPrice, fetchPriceEstimateOptions } from "../api/priceEstimate";

const initialForm = {
  category: "Appartements",
  room_count: 2,
  bathroom_count: 1,
  size: 80,
  city: "Tunis",
  region: "Tunis",
  budget_hint: 800,
};

const formatTnd = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("en-US").replace(/,/g, " ")} TND`;
};

export default function PriceEstimate() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({ category: [], city: [], region: [] });
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    // Match your other pages behavior (AOS / scrolling)
    const enableScrolling = () => {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
      document.body.style.position = "static";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.height = "auto";
      document.body.classList.remove("no-scroll", "modal-open", "overflow-hidden");
      document.documentElement.classList.remove("no-scroll", "modal-open", "overflow-hidden");
    };
    const timer = setTimeout(() => {
      enableScrolling();
      if (window.AOS) {
        window.AOS.refresh();
        window.AOS.init({ duration: 1200, once: true });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await fetchPriceEstimateOptions();
        setOptions({
          category: Array.isArray(res?.category) ? res.category : [],
          city: Array.isArray(res?.city) ? res.city : [],
          region: Array.isArray(res?.region) ? res.region : [],
        });

        // If initial values aren't in allowed lists, snap to first option
        setForm((prev) => {
          const next = { ...prev };
          if (res?.category?.length && !res.category.includes(next.category)) next.category = res.category[0];
          if (res?.city?.length && !res.city.includes(next.city)) next.city = res.city[0];
          if (res?.region?.length && !res.region.includes(next.region)) next.region = res.region[0];
          return next;
        });
      } catch (e) {
        // Keep page usable, but warn user why dropdowns may be empty
        toast.error("Unable to load dropdown options (model may not be ready).");
        setOptions({ category: [], city: [], region: [] });
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  const accuracyTone = useMemo(() => {
    const acc = Number(result?.accuracy_pct);
    if (!Number.isFinite(acc)) return "neutral";
    if (acc >= 85) return "good";
    if (acc >= 70) return "mid";
    return "low";
  }, [result]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        ...form,
        room_count: Number(form.room_count) || 0,
        bathroom_count: Number(form.bathroom_count) || 0,
        size: Number(form.size) || 0,
        budget_hint: form.budget_hint === "" || form.budget_hint == null ? null : Number(form.budget_hint),
      };
      const res = await estimateRentalPrice(payload);
      setResult(res);
      toast.success("Price estimated successfully");
    } catch (err) {
      const msg = err?.message || "Failed to estimate price";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="page-wrapper">
        <div className="breadcrumb-bar">
          <img
            src="/assets/img/bg/breadcrumb-bg-01.png"
            alt=""
            className="breadcrumb-bg-01 d-none d-lg-block"
          />
          <img
            src="/assets/img/bg/breadcrumb-bg-02.png"
            alt=""
            className="breadcrumb-bg-02 d-none d-lg-block"
          />
          <img
            src="/assets/img/bg/breadcrumb-bg-03.png"
            alt=""
            className="breadcrumb-bg-03"
          />
          <div className="row align-items-center text-center position-relative z-1">
            <div className="col-md-12 col-12 breadcrumb-arrow">
              <h1 className="breadcrumb-title">Price Estimation</h1>
              <nav aria-label="breadcrumb" className="page-breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <span>
                        <i className="material-icons-outlined me-1">home</i>
                      </span>
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Price Estimation
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="section-heading text-center mb-4">
                  <h2>Estimate your monthly rent in seconds</h2>
                  <p className="text-muted mb-0">
                    Enter your property details and get a model-based rental price estimate with a real accuracy metric.
                  </p>
                </div>

                <div className="row g-4">
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="mb-3">Property criteria</h5>

                        <form onSubmit={submit}>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Category</label>
                              <select
                                className="form-select"
                                value={form.category}
                                onChange={(e) => onChange("category", e.target.value)}
                                disabled={optionsLoading || options.category.length === 0}
                              >
                                {options.category.length === 0 ? (
                                  <option value="">
                                    {optionsLoading ? "Loading..." : "No categories available"}
                                  </option>
                                ) : null}
                                {options.category.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">City</label>
                              <select
                                className="form-select"
                                value={form.city}
                                onChange={(e) => onChange("city", e.target.value)}
                                disabled={optionsLoading || options.city.length === 0}
                              >
                                {options.city.length === 0 ? (
                                  <option value="">
                                    {optionsLoading ? "Loading..." : "No cities available"}
                                  </option>
                                ) : null}
                                {options.city.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">Region</label>
                              <select
                                className="form-select"
                                value={form.region}
                                onChange={(e) => onChange("region", e.target.value)}
                                disabled={optionsLoading || options.region.length === 0}
                              >
                                {options.region.length === 0 ? (
                                  <option value="">
                                    {optionsLoading ? "Loading..." : "No regions available"}
                                  </option>
                                ) : null}
                                {options.region.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Rooms</label>
                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                value={form.room_count}
                                onChange={(e) => onChange("room_count", e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Bathrooms</label>
                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                value={form.bathroom_count}
                                onChange={(e) => onChange("bathroom_count", e.target.value)}
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">Size (m²)</label>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={form.size}
                                onChange={(e) => onChange("size", e.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Budget hint (TND/month) (optional)</label>
                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                value={form.budget_hint}
                                onChange={(e) => onChange("budget_hint", e.target.value)}
                              />
                              <div className="form-text">
                                Helps the model infer your budget tier like training.
                              </div>
                            </div>
                          </div>

                          {error ? (
                            <div className="alert alert-danger mt-3 mb-0">{error}</div>
                          ) : null}

                          <div className="d-flex gap-2 align-items-center mt-4">
                            <button
                              className="btn btn-primary btn-lg"
                              type="submit"
                              disabled={
                                loading ||
                                optionsLoading ||
                                !form.category ||
                                !form.city ||
                                !form.region
                              }
                            >
                              {loading ? "Estimating..." : "Estimate price"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-lg"
                              onClick={() => {
                                setForm(initialForm);
                                setResult(null);
                                setError("");
                              }}
                              disabled={loading}
                            >
                              Reset
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="mb-3">Estimation</h5>

                        {!result ? (
                          <div className="text-center py-4">
                            <i className="material-icons-outlined text-muted" style={{ fontSize: 44 }}>
                              query_stats
                            </i>
                            <p className="text-muted mb-0 mt-2">
                              Submit your criteria to get an estimate.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 rounded-3 bg-light mb-3">
                              <div className="text-muted">Estimated price</div>
                              <div className="d-flex align-items-baseline gap-2">
                                <h3 className="mb-0">{formatTnd(result.estimated_price_tnd)}</h3>
                                <span className="text-muted">/ month</span>
                              </div>
                            </div>

                          </>
                        )}
                      </div>
                    </div>

                    
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

