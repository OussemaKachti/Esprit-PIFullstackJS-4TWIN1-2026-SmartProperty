import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import './i18n';

// Import global components
import Header from './components/Header';
import Footer from './components/Footer';

import Login from "./features/auth/login";
import Signup from "./features/auth/signup";
import Dashboard from "./features/dashboard/Dashboard";
import Home from "./features/home/Home";
import ProtectedRoute from "./routes/ProtectedRoute";

// Import pages
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
import FirstStepForm from "./features/multi-step-form/FirstStepForm"

const LanguageDetector = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const langMatch = path.match(/^\/(en|fr)/);
    
    if (langMatch) {
      const detectedLang = langMatch[1];
      if (i18n.language !== detectedLang) {
        i18n.changeLanguage(detectedLang);
      }
    } else {
      // Default to English if no language in URL
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
    }
  }, [location.pathname, i18n]);

  return null;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  const authRoutes = [
    '/login', '/fr/login',
    '/signup', '/fr/signup', 
    '/signin', '/fr/signin',
    '/forgot-password', '/fr/forgot-password',
    '/reset-password', '/fr/reset-password',
    '/form'
  ];
  
  const isAuthRoute = authRoutes.includes(location.pathname);
  
  if (isAuthRoute) {
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

function App() {
  return (
    <Router>
      <LanguageDetector />
      <AppLayout>
        <Routes>
            {/* Home Routes */}
            <Route path="/" element={<Index3 />} />
            <Route path="/fr" element={<Index3 />} />
            <Route path="/home" element={<Home />} />
            <Route path="/fr/home" element={<Home />} />
            <Route path="/index-2" element={<Index2 />} />
            <Route path="/fr/index-2" element={<Index2 />} />
            <Route path="/index-3" element={<Index3 />} />
            <Route path="/fr/index-3" element={<Index3 />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/form" element={<FirstStepForm />} />
        <Route path="/fr/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/fr/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/fr/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/fr/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/fr/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Property Buy Routes */}
        <Route path="/buy-property-grid" element={<BuyPropertyGrid />} />
        <Route path="/fr/buy-property-grid" element={<BuyPropertyGrid />} />
        <Route path="/buy-property-grid-sidebar" element={<BuyPropertyGridSidebar />} />
        <Route path="/fr/buy-property-grid-sidebar" element={<BuyPropertyGridSidebar />} />
        <Route path="/buy-property-list" element={<BuyPropertyList />} />
        <Route path="/fr/buy-property-list" element={<BuyPropertyList />} />
        <Route path="/buy-property-list-sidebar" element={<BuyPropertyListSidebar />} />
        <Route path="/fr/buy-property-list-sidebar" element={<BuyPropertyListSidebar />} />
        <Route path="/buy-grid-map" element={<BuyGridMap />} />
        <Route path="/fr/buy-grid-map" element={<BuyGridMap />} />
        <Route path="/buy-list-map" element={<BuyListMap />} />
        <Route path="/fr/buy-list-map" element={<BuyListMap />} />
        <Route path="/buy-details" element={<BuyDetails />} />
        <Route path="/fr/buy-details" element={<BuyDetails />} />
        <Route path="/add-property-buy" element={<AddPropertyBuy />} />
        <Route path="/fr/add-property-buy" element={<AddPropertyBuy />} />

        {/* Property Rent Routes */}
        <Route path="/rent-property-grid" element={<RentPropertyGrid />} />
        <Route path="/fr/rent-property-grid" element={<RentPropertyGrid />} />
        <Route path="/rent-property-grid-sidebar" element={<RentPropertyGridSidebar />} />
        <Route path="/fr/rent-property-grid-sidebar" element={<RentPropertyGridSidebar />} />
        <Route path="/rent-property-list" element={<RentPropertyList />} />
        <Route path="/fr/rent-property-list" element={<RentPropertyList />} />
        <Route path="/rent-property-list-sidebar" element={<RentPropertyListSidebar />} />
        <Route path="/fr/rent-property-list-sidebar" element={<RentPropertyListSidebar />} />
        <Route path="/rent-grid-map" element={<RentGridMap />} />
        <Route path="/fr/rent-grid-map" element={<RentGridMap />} />
        <Route path="/rent-list-map" element={<RentListMap />} />
        <Route path="/fr/rent-list-map" element={<RentListMap />} />
        <Route path="/rent-details" element={<RentDetails />} />
        <Route path="/fr/rent-details" element={<RentDetails />} />
        <Route path="/add-property-rent" element={<AddPropertyRent />} />
        <Route path="/fr/add-property-rent" element={<AddPropertyRent />} />

        {/* Rental Booking Routes */}
        <Route path="/rental-booking" element={<RentalBooking />} />
        <Route path="/fr/rental-booking" element={<RentalBooking />} />
        <Route path="/rental-order-confirmation" element={<RentalOrderConfirmation />} />
        <Route path="/fr/rental-order-confirmation" element={<RentalOrderConfirmation />} />
        <Route path="/rental-order-details" element={<RentalOrderDetails />} />
        <Route path="/fr/rental-order-details" element={<RentalOrderDetails />} />
        <Route path="/rental-payment" element={<RentalPayment />} />
        <Route path="/fr/rental-payment" element={<RentalPayment />} />

        {/* Agent Routes */}
        <Route path="/agent-grid" element={<AgentGrid />} />
        <Route path="/fr/agent-grid" element={<AgentGrid />} />
        <Route path="/agent-grid-sidebar" element={<AgentGridSidebar />} />
        <Route path="/fr/agent-grid-sidebar" element={<AgentGridSidebar />} />
        <Route path="/agent-list" element={<AgentList />} />
        <Route path="/fr/agent-list" element={<AgentList />} />
        <Route path="/agent-list-sidebar" element={<AgentListSidebar />} />
        <Route path="/fr/agent-list-sidebar" element={<AgentListSidebar />} />
        <Route path="/agent-details" element={<AgentDetails />} />
        <Route path="/fr/agent-details" element={<AgentDetails />} />
        {/* Agency Routes */}
        <Route path="/agency-grid" element={<AgencyGrid />} />
        <Route path="/fr/agency-grid" element={<AgencyGrid />} />
        <Route path="/agency-grid-sidebar" element={<AgencyGridSidebar />} />
        <Route path="/fr/agency-grid-sidebar" element={<AgencyGridSidebar />} />
        <Route path="/agency-list" element={<AgencyList />} />
        <Route path="/fr/agency-list" element={<AgencyList />} />
        <Route path="/agency-list-sidebar" element={<AgencyListSidebar />} />
        <Route path="/fr/agency-list-sidebar" element={<AgencyListSidebar />} />
        <Route path="/agency-details" element={<AgencyDetails />} />
        <Route path="/fr/agency-details" element={<AgencyDetails />} />

        {/* Blog Routes */}
        <Route path="/blog-grid" element={<BlogGrid />} />
        <Route path="/fr/blog-grid" element={<BlogGrid />} />
        <Route path="/blog-list" element={<BlogList />} />
        <Route path="/fr/blog-list" element={<BlogList />} />
        <Route path="/blog-details" element={<BlogDetails />} />
        <Route path="/fr/blog-details" element={<BlogDetails />} />

        {/* Info Pages */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/fr/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/fr/contact-us" element={<ContactUs />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/fr/pricing" element={<Pricing />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/fr/faq" element={<Faq />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/fr/gallery" element={<Gallery />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/fr/our-team" element={<OurTeam />} />
        <Route path="/testimonial" element={<Testimonial />} />
        <Route path="/fr/testimonial" element={<Testimonial />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/fr/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/fr/terms-condition" element={<TermsCondition />} />

        {/* E-commerce Routes */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/fr/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/fr/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/fr/checkout" element={<Checkout />} />
        <Route path="/invoice-details" element={<InvoiceDetails />} />
        <Route path="/fr/invoice-details" element={<InvoiceDetails />} />

        {/* Utility Pages */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/fr/notifications" element={<Notifications />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/fr/maintenance" element={<Maintenance />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/fr/coming-soon" element={<ComingSoon />} />

        {/* Error Pages */}
        <Route path="/error-404" element={<Error404 />} />
        <Route path="/fr/error-404" element={<Error404 />} />
        <Route path="/error-500" element={<Error500 />} />
        <Route path="/fr/error-500" element={<Error500 />} />

        {/* Fallback */}
        <Route path="*" element={<Error404 />} />
      </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
