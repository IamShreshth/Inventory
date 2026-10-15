import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Package, ArrowRight, Clock, Shield } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={24} strokeWidth={1.5} className="text-primary" />
            <span className="text-lg font-medium text-text">BERM</span>
          </div>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-content mx-auto px-6">
        <div className="py-20 text-center">
          <h1 className="text-3xl font-medium text-text mb-4">
            Borrowing Equipment and Resources Management
          </h1>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            A complete institutional inventory system for managing equipment lending,
            tracking assets, and streamlining the borrowing process for your organization.
          </p>
          <Button onClick={() => navigate('/login')} size="lg">
            Get Started
            <ArrowRight size={20} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-surface rounded mb-4">
              <Package size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium text-text mb-2">Asset Management</h3>
            <p className="text-sm text-text-muted">
              Track all your equipment with QR codes, categories, and real-time availability.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-surface rounded mb-4">
              <Clock size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium text-text mb-2">Borrowing Workflow</h3>
            <p className="text-sm text-text-muted">
              Streamlined request, approval, and return process with automated tracking.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-surface rounded mb-4">
              <Shield size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium text-text mb-2">Role-Based Access</h3>
            <p className="text-sm text-text-muted">
              Secure access control for admins, staff, borrowers, and auditors.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-12 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-medium text-text mb-1">Complete</div>
            <div className="text-sm text-text-muted">Asset Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-text mb-1">QR Code</div>
            <div className="text-sm text-text-muted">Generation & Scanning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-text mb-1">Drop Boxes</div>
            <div className="text-sm text-text-muted">Flexible Returns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-text mb-1">Reports</div>
            <div className="text-sm text-text-muted">& Audit Logs</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-content mx-auto px-6 py-8 text-center text-sm text-text-muted">
          <p>© 2026 BERM - Borrowing Equipment and Resources Management System</p>
        </div>
      </footer>
    </div>
  );
};
