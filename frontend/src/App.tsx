import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssetsListPage } from '@/pages/assets/AssetsListPage';
import { AssetDetailPage } from '@/pages/assets/AssetDetailPage';
import { AssetFormPage } from '@/pages/assets/AssetFormPage';
import { MyLoansPage } from '@/pages/issues/MyLoansPage';
import { RequestIssuePage } from '@/pages/issues/RequestIssuePage';
import { IssueQueuePage } from '@/pages/issues/IssueQueuePage';
import { ActiveIssuesPage } from '@/pages/issues/ActiveIssuesPage';
import { OverduePage } from '@/pages/issues/OverduePage';
import { DroppedPage } from '@/pages/issues/DroppedPage';
import { OrgUnitsPage } from '@/pages/admin/OrgUnitsPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { LocationsPage } from '@/pages/admin/LocationsPage';
import { VendorsPage } from '@/pages/admin/VendorsPage';
import { PurchasesPage } from '@/pages/admin/PurchasesPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { BorrowerBlocksPage } from '@/pages/admin/BorrowerBlocksPage';
import { DropBoxesPage } from '@/pages/admin/DropBoxesPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { AuditLogPage } from '@/pages/audit/AuditLogPage';

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AssetsListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/assets/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AssetDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/assets/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AssetFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Borrower routes */}
      <Route
        path="/my-loans"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyLoansPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/request-issue"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RequestIssuePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Staff routes */}
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <AppLayout>
              <IssueQueuePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/issues/active"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ActiveIssuesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/issues/overdue"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OverduePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/issues/dropped"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DroppedPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Admin routes */}
      <Route
        path="/org-units"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrgUnitsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CategoriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LocationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/vendors"
        element={
          <ProtectedRoute>
            <AppLayout>
              <VendorsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PurchasesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/borrower-blocks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BorrowerBlocksPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/drop-boxes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DropBoxesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Reports & Audit */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AuditLogPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-text">Page not found</div>} />
    </Routes>
  );
}

export default App;
