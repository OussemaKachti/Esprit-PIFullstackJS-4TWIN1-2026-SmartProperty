import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import MyProperties from "./pages/MyProperties";
import PropertyDetailsPage from "./pages/PropertyDetails";
import Performance from "./pages/Performance";
import Documents from "./pages/Documents";
import Enquiries from "./pages/Enquiries";
import Transactions from "./pages/Transactions";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProperties from "./pages/Admin/AdminProperties";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminCandidates from "./pages/Admin/AdminCandidates";
import AdminRentals from "./pages/Admin/AdminRentals";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminVerifications from "./pages/Admin/AdminVerifications";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '300px',
            textAlign: 'center',
            zIndex: 999999,
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10b981',
              zIndex: 999999,
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
              zIndex: 999999,
            },
          },
          loading: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
            style: {
              zIndex: 999999,
            },
          },
        }}
      />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/my-properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Admin Routes - use same layout but sidebar will show different menu */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/candidates" element={<AdminCandidates />} />
            <Route path="/admin/rentals" element={<AdminRentals />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
