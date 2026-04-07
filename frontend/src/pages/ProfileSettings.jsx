import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, updateCurrentUserProfile, requestPasswordReset } from '../api/user';
import {
  getUserData,
  clearUserData,
  shouldAccessBackoffice,
  getRedirectUrl,
  redirectToBackofficeWithToken,
} from '../utils/auth';
import { localizeRoute } from '../routes/routeConfig';
import LocalizedLink from '../components/LocalizedLink';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [form, setForm] = useState({
    login: '',
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    createdAt: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const localUser = getUserData();
    if (!localUser) {
      navigate(localizeRoute('/login', i18n.language));
      return;
    }

    const savedAvatar = localStorage.getItem('profileAvatarPreview');
    if (savedAvatar) setAvatarPreview(savedAvatar);

    const fetchProfile = async () => {
      setLoading(true);
      setAlert({ type: '', message: '' });
      try {
        const user = await getCurrentUser();
        setForm({
          login: user?.login || '',
          email: user?.email || '',
          role: user?.role || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
          createdAt: user?.createdAt || '',
        });
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        setAlert({ type: 'danger', message: err.message || 'Unable to load profile.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, i18n.language]);

  const initials = useMemo(() => {
    const first = form.firstName?.[0] || '';
    const last = form.lastName?.[0] || '';
    return (first + last).toUpperCase() || form.email?.[0]?.toUpperCase() || '?';
  }, [form.firstName, form.lastName, form.email]);

  const joinedAt = useMemo(() => {
    if (!form.createdAt) return '—';
    const d = new Date(form.createdAt);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }, [form.createdAt]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      setAvatarPreview(value);
      localStorage.setItem('profileAvatarPreview', value);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      };
      const updated = await updateCurrentUserProfile(payload);
      setForm((prev) => ({ ...prev, ...updated }));
      localStorage.setItem('user', JSON.stringify(updated));
      setAlert({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!form.email) return;
    setSendingReset(true);
    setAlert({ type: '', message: '' });
    try {
      await requestPasswordReset(form.email);
      setAlert({ type: 'success', message: 'Password reset link sent to your email.' });
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Unable to send password reset email.' });
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = () => {
    clearUserData();
    navigate(localizeRoute('/login', i18n.language));
  };

  const openBackoffice = () => {
    const token = localStorage.getItem('token');
    if (!token || !shouldAccessBackoffice(form.role)) return;
    redirectToBackofficeWithToken(getRedirectUrl(form.role), token);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="breadcrumb-bar">
          <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
          <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
          <div className="row align-items-center text-center position-relative z-1">
            <div className="col-md-12 col-12 breadcrumb-arrow">
              <h1 className="breadcrumb-title">Profile Settings</h1>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="breadcrumb-bar">
        <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
        <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
        <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
        <div className="row align-items-center text-center position-relative z-1">
          <div className="col-md-12 col-12 breadcrumb-arrow">
            <h1 className="breadcrumb-title">Profile Settings</h1>
            <nav aria-label="breadcrumb" className="page-breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <LocalizedLink to="/">
                    <span><i className="material-icons-outlined me-1">home</i></span>
                    Home
                  </LocalizedLink>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Profile Settings</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container">
          <div className="mb-4">
            <p className="text-muted mb-0">Manage your account, security, and session preferences.</p>
          </div>

          {alert.message && (
            <div className={`alert alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="rounded-circle mb-3"
                      style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-white"
                      style={{ width: '96px', height: '96px', background: '#0d6efd', fontSize: '30px', fontWeight: 700 }}
                    >
                      {initials}
                    </div>
                  )}
                  <h5 className="mb-1">{`${form.firstName || ''} ${form.lastName || ''}`.trim() || form.login || 'Member'}</h5>
                  <p className="text-muted mb-1 text-uppercase">{form.role || '—'}</p>
                  <p className="text-muted small mb-3">Member since: {joinedAt}</p>
                  <label className="btn btn-outline-primary btn-sm mb-0">
                    Upload Photo
                    <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pt-4 px-4">
                  <h5 className="mb-0">Account Information</h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSaveProfile}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input className="form-control" value={form.firstName} onChange={handleChange('firstName')} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input className="form-control" value={form.lastName} onChange={handleChange('lastName')} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={form.phone} onChange={handleChange('phone')} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Username</label>
                        <input className="form-control" value={form.login} disabled />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={form.email} disabled />
                      </div>
                    </div>
                    <div className="mt-4 d-flex flex-wrap gap-2">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      {shouldAccessBackoffice(form.role) && (
                        <button type="button" className="btn btn-dark" onClick={openBackoffice}>
                          Open Backoffice
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              <div className="card border-0 shadow-sm mt-4">
                <div className="card-header bg-white border-0 pt-4 px-4">
                  <h5 className="mb-0">Security & Session</h5>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline-primary" onClick={handleSendResetLink} disabled={sendingReset}>
                      {sendingReset ? 'Sending...' : 'Send Password Reset Link'}
                    </button>
                    <button type="button" className="btn btn-outline-dark" onClick={() => navigate('/setup-2fa')}>
                      Configure 2FA
                    </button>
                    <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
