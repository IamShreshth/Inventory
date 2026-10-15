import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
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
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/assets" element={<AssetsListPage />} />
                <Route path="/assets/:id" element={<AssetDetailPage />} />
                <Route path="/assets/:id/edit" element={<AssetFormPage />} />
                
                {/* Borrower routes */}
                <Route path="/my-loans" element={<MyLoansPage />} />
                <Route path="/request-issue" element={<RequestIssuePage />} />
                
                {/* Staff routes */}
                <Route path="/issues" element={<IssueQueuePage />} />
                <Route path="/issues/active" element={<ActiveIssuesPage />} />
                <Route path="/issues/overdue" element={<OverduePage />} />
                <Route path="/issues/dropped" element={<DroppedPage />} />
                
                {/* Admin routes */}
                <Route path="/org-units" element={<OrgUnitsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/borrower-blocks" element={<BorrowerBlocksPage />} />
                <Route path="/drop-boxes" element={<DropBoxesPage />} />
                
                {/* Reports & Audit */}
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/audit-log" element={<AuditLogPage />} />
                
                <Route path="*" element={<div className="text-text">Page not found</div>} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
