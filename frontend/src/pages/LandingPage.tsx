import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Package, ArrowRight, Clock, Shield, CheckCircle, BarChart3, Users, QrCode } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-primary/10">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Package size={20} strokeWidth={2} className="text-background" />
            </div>
            <span className="text-xl font-bold text-text">BERM</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="py-20 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-semibold mb-6">
            <CheckCircle size={16} strokeWidth={2} />
            Modern Equipment Management
          </div>
          <h1 className="text-5xl font-bold text-text mb-6 leading-tight">
            Borrowing Equipment and<br />Resources Management
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-3xl mx-auto leading-relaxed">
            A complete institutional inventory system for managing equipment lending,
            tracking assets, and streamlining the borrowing process for your organization.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => navigate('/signup')} size="lg">
              Get Started Free
              <ArrowRight size={20} strokeWidth={2} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/login')} size="lg">
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-lg flex items-center justify-center mb-4">
              <Package size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Asset Tracking</h3>
            <p className="text-sm text-text-muted">
              Track all equipment with QR codes, categories, and real-time availability status.
            </p>
          </div>

          <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-success-light text-success rounded-lg flex items-center justify-center mb-4">
              <Clock size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Borrowing Workflow</h3>
            <p className="text-sm text-text-muted">
              Streamlined request, approval, and return process with automated tracking.
            </p>
          </div>

          <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-warning-light text-warning rounded-lg flex items-center justify-center mb-4">
              <Shield size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Role-Based Access</h3>
            <p className="text-sm text-text-muted">
              Secure access control for admins, staff, borrowers, and auditors.
            </p>
          </div>

          <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 bg-error-light text-error rounded-lg flex items-center justify-center mb-4">
              <BarChart3 size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Reports & Analytics</h3>
            <p className="text-sm text-text-muted">
              Comprehensive reporting and audit logs for complete visibility.
            </p>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="py-16 border-t border-border">
          <h2 className="text-3xl font-bold text-text text-center mb-12">
            Everything You Need to Manage Equipment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <QrCode size={20} strokeWidth={2} className="text-background" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">QR Code Integration</h3>
                <p className="text-text-muted">
                  Generate and scan QR codes for quick asset identification and tracking.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users size={20} strokeWidth={2} className="text-background" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Multi-User Support</h3>
                <p className="text-text-muted">
                  Support for borrowers, staff, admins, and auditors with customized permissions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} strokeWidth={2} className="text-background" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Automated Workflows</h3>
                <p className="text-text-muted">
                  Automatic notifications, overdue tracking, and drop box management.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} strokeWidth={2} className="text-background" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Detailed Analytics</h3>
                <p className="text-text-muted">
                  Track usage patterns, generate reports, and maintain complete audit logs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
              Join organizations already using BERM to streamline their equipment management.
            </p>
            <Button onClick={() => navigate('/signup')} size="lg">
              Create Free Account
              <ArrowRight size={20} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package size={16} strokeWidth={2} className="text-background" />
              </div>
              <span className="font-semibold text-text">BERM</span>
            </div>
            <p className="text-sm text-text-muted">
              © 2026 BERM - Borrowing Equipment and Resources Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
