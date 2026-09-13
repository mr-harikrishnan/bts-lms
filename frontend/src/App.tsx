import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoadingFallback } from "@/components/common/PageLoadingFallback";

// Lazy-loaded routes for code-splitting & production performance
const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const CoursesPage = lazy(() => import("@/pages/CoursesPage").then((m) => ({ default: m.CoursesPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const RefundPolicyPage = lazy(() => import("@/pages/RefundPolicyPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("@/pages/SignupPage").then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const MyCoursesPage = lazy(() => import("@/pages/MyCoursesPage").then((m) => ({ default: m.MyCoursesPage })));
const CourseLearningPage = lazy(() => import("@/pages/CourseLearningPage").then((m) => ({ default: m.CourseLearningPage })));
const FinalTestPage = lazy(() => import("@/pages/FinalTestPage").then((m) => ({ default: m.FinalTestPage })));
const TestResultPage = lazy(() => import("@/pages/TestResultPage").then((m) => ({ default: m.TestResultPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const CertificatesPage = lazy(() => import("@/pages/CertificatesPage").then((m) => ({ default: m.CertificatesPage })));
const CertificateDetailPage = lazy(() => import("@/pages/CertificateDetailPage").then((m) => ({ default: m.CertificateDetailPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const SettingsProfilePage = lazy(() => import("@/pages/SettingsProfilePage"));

// Admin Management Console Pages
const AdminOverviewPage = lazy(() => import("@/pages/admin/AdminOverviewPage").then((m) => ({ default: m.AdminOverviewPage })));
const AdminCoursesPage = lazy(() => import("@/pages/admin/AdminCoursesPage").then((m) => ({ default: m.AdminCoursesPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
const AdminEnrollmentsPage = lazy(() => import("@/pages/admin/AdminEnrollmentsPage").then((m) => ({ default: m.AdminEnrollmentsPage })));
const AdminPaymentsPage = lazy(() => import("@/pages/admin/AdminPaymentsPage").then((m) => ({ default: m.AdminPaymentsPage })));

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Marketing & Informational Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />

          {/* Guest Authentication Routes */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestGuard>
                <SignupPage />
              </GuestGuard>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestGuard>
                <ForgotPasswordPage />
              </GuestGuard>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestGuard>
                <ResetPasswordPage />
              </GuestGuard>
            }
          />

          {/* Protected Student LMS Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/my-courses"
            element={
              <AuthGuard>
                <MyCoursesPage />
              </AuthGuard>
            }
          />
          <Route
            path="/courses/:courseId/learn"
            element={
              <AuthGuard>
                <CourseLearningPage />
              </AuthGuard>
            }
          />
          <Route
            path="/courses/:courseId/final-test"
            element={
              <AuthGuard>
                <FinalTestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/courses/:courseId/test-result"
            element={
              <AuthGuard>
                <TestResultPage />
              </AuthGuard>
            }
          />
          <Route
            path="/test/:courseId"
            element={
              <AuthGuard>
                <FinalTestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/test/:courseId/result"
            element={
              <AuthGuard>
                <TestResultPage />
              </AuthGuard>
            }
          />
          <Route
            path="/checkout/:courseId"
            element={
              <AuthGuard>
                <CheckoutPage />
              </AuthGuard>
            }
          />
          <Route
            path="/certificates"
            element={
              <AuthGuard>
                <CertificatesPage />
              </AuthGuard>
            }
          />
          <Route
            path="/certificates/:certificateId"
            element={
              <AuthGuard>
                <CertificateDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <AuthGuard>
                <SettingsProfilePage />
              </AuthGuard>
            }
          />

          {/* Secure Administrative Console Routes */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminOverviewPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminGuard>
                <AdminCoursesPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminUsersPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/enrollments"
            element={
              <AdminGuard>
                <AdminEnrollmentsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminGuard>
                <AdminPaymentsPage />
              </AdminGuard>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
