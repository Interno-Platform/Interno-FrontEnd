import { Route, Routes } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LandingPage from "@/pages/public/LandingPage";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import SuperAdminDashboardPage from "@/pages/superadmin/DashboardPage";
import CompaniesPage from "@/pages/superadmin/CompaniesPage";
import SuperadminTraineesPage from "@/pages/superadmin/TraineesPage";
import SuperadminInternshipsPage from "@/pages/superadmin/InternshipsPage";
import SuperadminInternshipDetailsPage from "@/pages/superadmin/InternshipDetailsPage";
import SuperadminAssessmentsPage from "@/pages/superadmin/AssessmentsPage";
import SuperadminReportsPage from "@/pages/superadmin/ReportsPage";
import SuperadminSettingsPage from "@/pages/superadmin/SettingsPage";
import SuperadminRequestsPage from "@/pages/superadmin/RequestsPage";
import ContactMessagesPage from "@/pages/superadmin/ContactMessagesPage";
import ContactMessageDetailsPage from "@/pages/superadmin/ContactMessageDetailsPage";

import CompanyDashboardPage from "@/pages/company/DashboardPage";
import CompanyInternshipsPage from "@/pages/company/InternshipsPage";
import CompanyInternshipDetailsPage from "@/pages/company/InternshipDetailsPage";
import CompanyApplicantsPage from "@/pages/company/ApplicantsPage";
import CompanyTraineesPage from "@/pages/company/TraineesPage";
import CompanyAssessmentsPage from "@/pages/company/AssessmentsPage";
import CompanySettingsPage from "@/pages/company/SettingsPage";
import CompanyMessagesPage from "@/pages/company/MessagesPage";
import CompanyInterviewsPage from "@/pages/company/InterviewsPage";

import TraineeDashboardPage from "@/pages/trainee/DashboardPage";
import BrowseInternshipsPage from "@/pages/trainee/BrowseInternshipsPage";
import ApplicationsPage from "@/pages/trainee/ApplicationsPage";
import TraineeAssessmentsPage from "@/pages/trainee/AssessmentsPage";
import ProgressPage from "@/pages/trainee/ProgressPage";
import TraineeProfilePage from "@/pages/trainee/ProfilePage";
import ExamInstructionsPage from "@/pages/trainee/ExamInstructionsPage";
import TraineeExamPage from "@/pages/trainee/ExamPage";
import CodeExamPage from "@/pages/trainee/CodeExamPage";
import ExamResultPage from "@/pages/trainee/ExamResultPage";
import NotificationsPage from "@/pages/trainee/NotificationsPage";
import InternshipDetailsPage from "@/pages/trainee/InternshipDetailsPage";
import ApplicationSuccessPage from "@/pages/trainee/ApplicationSuccessPage";

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route
      path="/superadmin"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<SuperAdminDashboardPage />} />
      <Route path="requests" element={<SuperadminRequestsPage />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="trainees" element={<SuperadminTraineesPage />} />
      <Route path="internships" element={<SuperadminInternshipsPage />} />
      <Route
        path="internships/:companyId/:internshipId"
        element={<SuperadminInternshipDetailsPage />}
      />
      <Route path="assessments" element={<SuperadminAssessmentsPage />} />
      <Route path="reports" element={<SuperadminReportsPage />} />
      <Route path="contact-messages" element={<ContactMessagesPage />} />
      <Route
        path="contact-messages/:messageId"
        element={<ContactMessageDetailsPage />}
      />
      <Route path="settings" element={<SuperadminSettingsPage />} />
    </Route>

    <Route
      path="/company"
      element={
        <ProtectedRoute allowedRoles={["company"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<CompanyDashboardPage />} />
      <Route path="internships" element={<CompanyInternshipsPage />} />
      <Route
        path="internships/:internshipId"
        element={<CompanyInternshipDetailsPage />}
      />
      <Route path="applicants" element={<CompanyApplicantsPage />} />
      <Route path="trainees" element={<CompanyTraineesPage />} />
      <Route path="assessments" element={<CompanyAssessmentsPage />} />
      <Route path="messages" element={<CompanyMessagesPage />} />
      <Route path="interviews" element={<CompanyInterviewsPage />} />
      <Route path="settings" element={<CompanySettingsPage />} />
    </Route>

    <Route
      path="/trainee"
      element={
        <ProtectedRoute allowedRoles={["trainee"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<TraineeDashboardPage />} />
      <Route path="internships" element={<BrowseInternshipsPage />} />
      <Route
        path="internships/:internshipId"
        element={<InternshipDetailsPage />}
      />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="application-success" element={<ApplicationSuccessPage />} />
      <Route path="assessments" element={<TraineeAssessmentsPage />} />
      <Route path="progress" element={<ProgressPage />} />
      <Route path="profile" element={<TraineeProfilePage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route
        path="assessments/:assessmentId/instructions"
        element={<ExamInstructionsPage />}
      />
    </Route>

    <Route
      path="/trainee/exam/:assessmentId"
      element={
        <ProtectedRoute allowedRoles={["trainee"]}>
          <TraineeExamPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/trainee/exam/:assessmentId/code"
      element={
        <ProtectedRoute allowedRoles={["trainee"]}>
          <CodeExamPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/trainee/exam/:assessmentId/result"
      element={
        <ProtectedRoute allowedRoles={["trainee"]}>
          <ExamResultPage />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
