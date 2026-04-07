import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import './i18n';

// Import global components
import Header from './components/Header';
import Footer from './components/Footer';

// Import route configuration
import { 
  generateLocalizedRoutes, 
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageFromPath, 
  localizeRoute,
  isAuthRoute
} from './routes/routeConfig';

// Import components
import Login from "./features/auth/login";
import Signup from "./features/auth/signup";
import Dashboard from "./features/dashboard/Dashboard";
import Home from "./features/home/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import AboutUs from "./features/AboutUs.jsx/AboutUs";
import ContactUs from "./pages/ContactUs";
import BuyPropertyGrid from "./pages/BuyPropertyGrid";
import BuyPropertyGridSidebar from "./pages/BuyPropertyGridSidebar";
import BuyPropertyList from "./pages/BuyPropertyList";
import BuyPropertyListSidebar from "./pages/BuyPropertyListSidebar";
import BuyGridMap from "./pages/BuyGridMap";
import BuyListMap from "./pages/BuyListMap";
import BuyDetails from "./pages/BuyDetails";
import RentPropertyGrid from "./pages/RentPropertyGrid";
import RentPropertyGridSidebar from "./pages/RentPropertyGridSidebar";
import RentPropertyList from "./pages/RentPropertyList";
import RentPropertyListSidebar from "./pages/RentPropertyListSidebar";
import RentGridMap from "./pages/RentGridMap";
import RentListMap from "./pages/RentListMap";
import RentDetails from "./pages/RentDetails";
import AgentGrid from "./pages/AgentGrid";
import AgentGridSidebar from "./pages/AgentGridSidebar";
import AgentList from "./pages/AgentList";
import AgentListSidebar from "./pages/AgentListSidebar";
import AgentDetails from "./pages/AgentDetails";
import AgencyGrid from "./pages/AgencyGrid";
import AgencyGridSidebar from "./pages/AgencyGridSidebar";
import AgencyList from "./pages/AgencyList";
import AgencyListSidebar from "./pages/AgencyListSidebar";
import AgencyDetails from "./pages/AgencyDetails";
import BlogGrid from "./pages/BlogGrid";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import Pricing from "./pages/Pricing";
import Faq from "./pages/Faq";
import Gallery from "./pages/Gallery";
import OurTeam from "./pages/OurTeam";
import Testimonial from "./pages/Testimonial";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsCondition from "./pages/TermsCondition";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AddPropertyBuy from "./pages/AddPropertyBuy";
import AddPropertyRent from "./pages/AddPropertyRent";
import Index2 from "./pages/Index2";
import Index3 from "./features/Index3/Index3";
import InvoiceDetails from "./pages/InvoiceDetails";
import Notifications from "./pages/Notifications";
import Maintenance from "./pages/Maintenance";
import ComingSoon from "./pages/ComingSoon";
import RentalBooking from "./pages/RentalBooking";
import RentalOrderConfirmation from "./pages/RentalOrderConfirmation";
import RentalOrderDetails from "./pages/RentalOrderDetails";
import RentalPayment from "./pages/RentalPayment";
import Signin from "./pages/Signin";
import FirstStepForm from "./features/multi-step-form/FirstStepForm";
import FormContainer from "./features/multi-step-form/FormContainer";
import AgencyDoc from "./features/auth/AgencyDocsForm";
import CINForm from "./features/auth/CINForm";
import TwoFactorSetup from "./features/auth/TwoFactorSetup";
import RentalMatch from "./pages/RentalMatch.jsx";

// Component mapping
const COMPONENT_MAP = {
  Login, Signup, Dashboard, Home, AboutUs, ContactUs,
  BuyPropertyGrid, BuyPropertyGridSidebar, BuyPropertyList, BuyPropertyListSidebar,
  BuyGridMap, BuyListMap, BuyDetails, AddPropertyBuy,
  RentPropertyGrid, RentPropertyGridSidebar, RentPropertyList, RentPropertyListSidebar,
  RentGridMap, RentListMap, RentDetails, AddPropertyRent,
  RentalBooking, RentalOrderConfirmation, RentalOrderDetails, RentalPayment,
  AgentGrid, AgentGridSidebar, AgentList, AgentListSidebar, AgentDetails,
  AgencyGrid, AgencyGridSidebar, AgencyList, AgencyListSidebar, AgencyDetails,
  BlogGrid, BlogList, BlogDetails,
  Pricing, Faq, Gallery, OurTeam, Testimonial,
  PrivacyPolicy, TermsCondition,
  Error404, Error500,
  ForgotPassword, ResetPassword,
  Wishlist, Cart, Checkout, InvoiceDetails,
  Notifications, Maintenance, ComingSoon,
  Signin, Index2, Index3, FirstStepForm, FormContainer, AgencyDoc, CINForm,
  RentalMatch,
}

const LanguageDetector = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname || '/');

  useEffect(() => {
    const pathname = location.pathname || '/';
    const detectedLang = getLanguageFromPath(location.pathname);

    const hasLanguagePrefix = /^\/([a-z]{2})(\/|$)/.test(pathname);

    if (hasLanguagePrefix) {
      if (i18n.language !== detectedLang) {
        i18n.changeLanguage(detectedLang);
      }
      prevPathRef.current = pathname;
      return;
    }

    const prevPath = prevPathRef.current || '/';
    const prevHadLanguagePrefix = /^\/([a-z]{2})(\/|$)/.test(prevPath);
    const prevStripped = prevPath.replace(/^\/([a-z]{2})(\/|$)/, '/');

    // When user switches from a localized URL to the same unprefixed URL,
    // that means they intentionally selected the default language (en).
    if (prevHadLanguagePrefix && prevStripped === pathname && i18n.language !== DEFAULT_LANGUAGE) {
      i18n.changeLanguage(DEFAULT_LANGUAGE);
    }

    prevPathRef.current = pathname;
  }, [location.pathname, i18n]);

  return null;
};

const LocalePathPreserver = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef(location.pathname || '/');

  useEffect(() => {
    const pathname = location.pathname || '/';
    const hasLanguagePrefix = /^\/([a-z]{2})(\/|$)/.test(pathname);
    if (hasLanguagePrefix) {
      prevPathRef.current = pathname;
      return;
    }

    // Keep dedicated non-localized token route working as-is.
    if (/^\/reset-password\/[^/]+/.test(pathname)) {
      prevPathRef.current = pathname;
      return;
    }

    const prevPath = prevPathRef.current || '/';
    const prevHadLanguagePrefix = /^\/([a-z]{2})(\/|$)/.test(prevPath);
    const prevStripped = prevPath.replace(/^\/([a-z]{2})(\/|$)/, '/');

    // If user just switched back to default language, we get /fr/foo -> /foo.
    // Do not re-apply the old language prefix in that case.
    if (prevHadLanguagePrefix && prevStripped === pathname) {
      prevPathRef.current = pathname;
      return;
    }

    const activeLanguage = (i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE).slice(0, 2);
    if (!SUPPORTED_LANGUAGES.includes(activeLanguage) || activeLanguage === DEFAULT_LANGUAGE) {
      prevPathRef.current = pathname;
      return;
    }

    const localizedPath = localizeRoute(pathname, activeLanguage);
    navigate(`${localizedPath}${location.search || ''}${location.hash || ''}`, { replace: true });
    prevPathRef.current = pathname;
  }, [location.pathname, location.search, location.hash, i18n.language, i18n.resolvedLanguage, navigate]);

  return null;
};

const AUTH_ROUTES = [
  '/login', '/fr/login',
  '/signup', '/fr/signup',
  '/signin', '/fr/signin',
  '/forgot-password', '/fr/forgot-password',
  '/reset-password', '/fr/reset-password',
  '/form',
  '/agencydoc', '/fr/agencydoc',
  '/cinform', '/fr/cinform',
  '/setup-2fa',
];

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  if (isAuthRoute(location.pathname)) {
    return (
      <div className="auth-wrapper">
        {children}
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const toastOptions = {
  duration: 4000,
  style: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '12px',
    padding: '14px 18px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    border: '1px solid rgba(0,0,0,0.06)',
    background: '#fff',
  },
  success: {
    duration: 4000,
    iconTheme: { primary: '#059669', secondary: '#fff' },
    style: {
      background: '#f0fdf4',
      border: '1px solid #a7f3d0',
      color: '#065f46',
      boxShadow: '0 10px 40px rgba(5,150,105,0.15)',
    },
  },
  error: {
    duration: 5000,
    iconTheme: { primary: '#dc2626', secondary: '#fff' },
    style: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#991b1b',
      boxShadow: '0 10px 40px rgba(220,38,38,0.12)',
    },
  },
};

function ToastContainer() {
  const location = useLocation();
  const isAuth = isAuthRoute(location.pathname);
  return (
    <div
      className="toast-wrapper"
      style={
        isAuth
          ? {
              position: 'fixed',
              left: '70%',
              top: '24px',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: '100%',
              maxWidth: 'min(90vw, 400px)',
              pointerEvents: 'none',
            }
          : { position: 'fixed', top: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }
      }
    >
      <Toaster
        position={isAuth ? 'top-center' : 'top-right'}
        toastOptions={toastOptions}
      />
    </div>
  );
}

function App() {
  const localizedRoutes = generateLocalizedRoutes();

  return (
    <Router>
      <ToastContainer />
      <LanguageDetector />
      <LocalePathPreserver />
      <AppLayout>
        <Routes>
          {localizedRoutes.map((route, index) => {
            const Component = COMPONENT_MAP[route.component];
            
            if (!Component) {
              console.warn(`Component ${route.component} not found for route ${route.path}`);
              return null;
            }

            // Handle protected routes
            if (route.protected) {
              return (
                <Route
                  key={`${route.path}-${index}`}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <Component />
                    </ProtectedRoute>
                  }
                />
              );
            }

            // Regular routes
            return (
              <Route
                key={`${route.path}-${index}`}
                path={route.path}
                element={<Component />}
              />
            );
          })}

          {/* 2FA setup — route dédiée, hors du système localisé */}
          <Route path="/setup-2fa" element={<TwoFactorSetup />} />

          {/* Reset password avec token — route dédiée */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Fallback 404 route */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
