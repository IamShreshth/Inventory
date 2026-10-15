import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import {
  Package,
  FileText,
  Building2,
  FolderTree,
  MapPin,
  Store,
  ShoppingCart,
  Users,
  Ban,
  Archive,
  Bell,
  BarChart3,
  FileSpreadsheet,
  Eye,
  QrCode,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <BarChart3 size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Assets',
    path: '/assets',
    icon: <Package size={16} strokeWidth={1.5} />,
  },
  {
    label: 'My Loans',
    path: '/my-loans',
    icon: <FileText size={16} strokeWidth={1.5} />,
    roles: ['borrower'],
  },
  {
    label: 'Issue Requests',
    path: '/issues',
    icon: <FileText size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Active Issues',
    path: '/issues/active',
    icon: <Package size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Overdue',
    path: '/issues/overdue',
    icon: <Bell size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Dropped Items',
    path: '/issues/dropped',
    icon: <Archive size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Org Units',
    path: '/org-units',
    icon: <Building2 size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: <FolderTree size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Locations',
    path: '/locations',
    icon: <MapPin size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Vendors',
    path: '/vendors',
    icon: <Store size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Purchases',
    path: '/purchases',
    icon: <ShoppingCart size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: <Users size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin'],
  },
  {
    label: 'Borrower Blocks',
    path: '/borrower-blocks',
    icon: <Ban size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Drop Boxes',
    path: '/drop-boxes',
    icon: <Archive size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge'],
  },
  {
    label: 'Alerts',
    path: '/alerts',
    icon: <Bell size={16} strokeWidth={1.5} />,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: <FileSpreadsheet size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'org_admin', 'berm_incharge', 'auditor'],
  },
  {
    label: 'Audit Log',
    path: '/audit-log',
    icon: <Eye size={16} strokeWidth={1.5} />,
    roles: ['super_admin', 'auditor'],
  },
  {
    label: 'Scan QR',
    path: '/scan',
    icon: <QrCode size={16} strokeWidth={1.5} />,
  },
];

export const Sidebar = () => {
  const { user, hasAnyRole } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasAnyRole(item.roles);
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-background rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <BarChart3 size={20} strokeWidth={2} />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-text/50 z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 bg-background border-r border-border h-screen flex flex-col shadow-sm transition-transform duration-300',
          'fixed lg:sticky top-0 z-50',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-text-muted hover:text-text"
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-background"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text">BERM</h1>
              <p className="text-xs text-text-muted">Equipment Mgmt</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary text-background font-medium shadow-md'
                        : 'text-text hover:bg-surface-hover hover:translate-x-1'
                    )
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t border-border bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover text-background flex items-center justify-center text-sm font-semibold shadow-md">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text font-medium truncate">{user.full_name}</div>
                <div className="text-xs text-text-muted truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
