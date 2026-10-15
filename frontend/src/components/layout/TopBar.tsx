import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-40 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface transition-all duration-200 hover:shadow-sm"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover text-background flex items-center justify-center text-sm font-semibold shadow-md">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-text">{user.full_name}</span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={cn('text-text-muted transition-transform duration-200', isMenuOpen && 'rotate-180')}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-xl py-2 animate-slide-down">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover text-background flex items-center justify-center text-base font-semibold shadow-md">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text truncate">{user.full_name}</div>
                    <div className="text-xs text-text-muted truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 text-xs bg-primary-light text-primary rounded-md font-medium"
                    >
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-text hover:bg-surface transition-colors flex items-center gap-3 font-medium"
              >
                <LogOut size={18} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
