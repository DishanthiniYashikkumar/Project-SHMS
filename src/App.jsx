import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ToastProvider from "./context/ToastProvider";
import DashboardLayout from "./components/layout/DashboardLayout";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import BookingDetails from "./pages/guest/BookingDetails";
import Feedback from "./pages/guest/Feedback";
import GuestDashboard from "./pages/guest/GuestDashboard";
import MyBookings from "./pages/guest/MyBookings";
import Notifications from "./pages/guest/Notifications";
import Payments from "./pages/guest/Payments";
import Profile from "./pages/guest/Profile";
import ServiceRequests from "./pages/guest/ServiceRequests";
import BookingFlow from "./pages/booking/BookingFlow";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Activities from "./pages/public/Activities";
import Contact from "./pages/public/Contact";
import Facilities from "./pages/public/Facilities";
import Gallery from "./pages/public/Gallery";
import Home from "./pages/public/Home";
import RoomDetails from "./pages/public/RoomDetails";
import Rooms from "./pages/public/Rooms";
import Testimonials from "./pages/public/Testimonials";
import { ROLES } from "./services/authService";

/**
 * Route table.
 *
 * Public pages sit under PublicLayout (navbar + footer) and need no session —
 * guests browse rooms, facilities and the gallery before ever signing in.
 *
 * The five dashboards share ONE login page: the role returned by the backend
 * decides the destination (ROLE_ROUTES in authService.js) and ProtectedRoute
 * keeps each dashboard restricted to its role.
 */

/**
 * Staff roles still on the shared placeholder. The guest portal has its own
 * nested routes below; phases 7–10 replace these one role at a time.
 */
const ROLE_DASHBOARDS = [
  { path: "/reception/dashboard", role: ROLES.RECEPTIONIST },
  { path: "/housekeeping/dashboard", role: ROLES.HOUSEKEEPING },
  { path: "/service/dashboard", role: ROLES.SERVICE_STAFF },
  { path: "/admin/dashboard", role: ROLES.ADMIN },
];

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider sits inside the router so its consumers can navigate;
          ToastProvider inside it so any signed-in action can report an outcome. */}
      <AuthProvider>
        <ToastProvider>
        <Routes>
        {/* ------------------------------------------------ Public website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<RoomDetails />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />

          {/* Browsing stays open to everyone; authentication is only asked for
              once a guest actually starts booking. ProtectedRoute preserves the
              full URL, so the stay dates survive the login round trip. */}
          <Route
            path="/booking/:slug"
            element={
              <ProtectedRoute>
                <BookingFlow />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* --------------------------------------------------------- Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ------------------------------------------------- Guest portal */}
        <Route
          path="/guest"
          element={
            <ProtectedRoute allow={[ROLES.GUEST]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/guest/dashboard" replace />} />
          <Route path="dashboard" element={<GuestDashboard />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:bookingId" element={<BookingDetails />} />
          <Route path="requests" element={<ServiceRequests />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --------------------------------------------- Role dashboards */}
        {ROLE_DASHBOARDS.map(({ path, role }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allow={[role]}>
                <Dashboard role={role} />
              </ProtectedRoute>
            }
          />
        ))}

        {/* ------------------------------------------------------ Fallbacks */}
        <Route
          path="/unauthorized"
          element={
            <ComingSoon
              icon="bi-shield-exclamation"
              tone="danger"
              title="Access denied"
              message="Your role doesn't have permission to view that page."
            />
          }
        />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route
          path="*"
          element={
            <ComingSoon
              icon="bi-compass"
              title="Page not found"
              message="That page doesn't exist at Ocean Stays."
            />
          }
        />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
