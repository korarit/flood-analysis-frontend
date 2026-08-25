import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Link } from '@tanstack/react-router';
import { getBasinBySlug } from '../../services/basinService';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useLanguage } from '../../hooks/useLanguage';
import {
  LayoutDashboard,
  Map,
  ListFilter,
  Navigation,
  Bell,
  FileText,
  Settings,
} from 'lucide-react';

export const BasinLayout: React.FC = () => {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const basin = getBasinBySlug(currentSlug);
  const location = useLocation();
  const pathname = location.pathname;
  const { isThai } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navTabs = [
    {
      to: '/basin/$basinSlug',
      params: { basinSlug: currentSlug },
      label: isThai ? 'ภาพรวม' : 'Overview',
      icon: LayoutDashboard,
      isActive: pathname === `/basin/${currentSlug}` || pathname === `/basin/${currentSlug}/`,
    },
    {
      to: '/basin/$basinSlug/nearby',
      params: { basinSlug: currentSlug },
      label: isThai ? 'ค้นหาสถานีใกล้ฉัน' : 'Find Nearby',
      icon: Navigation,
      isActive: pathname.includes(`/basin/${currentSlug}/nearby`),
      badge: isThai ? 'แนะนำ' : 'GPS',
    },
    {
      to: '/basin/$basinSlug/station',
      params: { basinSlug: currentSlug },
      label: isThai ? 'รายการสถานี' : 'Stations Directory',
      icon: ListFilter,
      isActive: pathname.includes(`/basin/${currentSlug}/station`),
    },
    {
      to: '/basin/$basinSlug/map',
      params: { basinSlug: currentSlug },
      label: isThai ? 'แผนที่' : 'Interactive Map',
      icon: Map,
      isActive: pathname.includes(`/basin/${currentSlug}/map`),
    },
    {
      to: '/basin/$basinSlug/report',
      params: { basinSlug: currentSlug },
      label: isThai ? 'รายงานสถานการณ์' : 'Daily Report',
      icon: FileText,
      isActive: pathname.includes(`/basin/${currentSlug}/report`),
    },
    {
      to: '/basin/$basinSlug/event',
      params: { basinSlug: currentSlug },
      label: isThai ? 'เหตุการณ์ & แจ้งเตือน' : 'Events & Alerts',
      icon: Bell,
      isActive: pathname.includes(`/basin/${currentSlug}/event`),
    },
    {
      to: '/basin/$basinSlug/settings',
      params: { basinSlug: currentSlug },
      label: isThai ? 'ตั้งค่า' : 'Settings',
      icon: Settings,
      isActive: pathname.includes(`/basin/${currentSlug}/settings`),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black transition-colors">
      {/* Global Header */}
      <AppHeader currentBasin={basin} onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Desktop Sub-Navigation Bar */}
      <div className="hidden md:block w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/50 backdrop-blur-md sticky top-16 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  params={tab.params}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    tab.isActive
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/40 shadow-xs dark:shadow-glow-cyan/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-extrabold uppercase">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        <Outlet />
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block w-full border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md py-4 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p>© 2026 Korarit Saengthong — Water Situation Platform</p>
          <p className="text-slate-500 dark:text-slate-500">Developed by Korarit Saengthong</p>
        </div>
      </footer>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav basinSlug={currentSlug} />

      {/* Global Omni-Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentBasinSlug={currentSlug}
      />
    </div>
  );
};
