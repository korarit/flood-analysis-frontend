import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useLanguage } from '../../hooks/useLanguage';
import { LayoutDashboard, Map, ListFilter, Navigation, Bell } from 'lucide-react';

interface MobileBottomNavProps {
  basinSlug: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ basinSlug }) => {
  const { isThai } = useLanguage();
  const router = useRouterState();
  const pathname = router.location.pathname;

  const navItems = [
    {
      to: '/basin/$basinSlug',
      params: { basinSlug },
      label: isThai ? 'ภาพรวม' : 'Overview',
      icon: LayoutDashboard,
      isActive: pathname === `/basin/${basinSlug}` || pathname === `/basin/${basinSlug}/`,
    },
    {
      to: '/basin/$basinSlug/nearby',
      params: { basinSlug },
      label: isThai ? 'ใกล้ฉัน' : 'Nearby',
      icon: Navigation,
      isActive: pathname.includes(`/basin/${basinSlug}/nearby`),
      highlight: true,
    },
    {
      to: '/basin/$basinSlug/station',
      params: { basinSlug },
      label: isThai ? 'สถานี' : 'Stations',
      icon: ListFilter,
      isActive: pathname.includes(`/basin/${basinSlug}/station`),
    },
    {
      to: '/basin/$basinSlug/map',
      params: { basinSlug },
      label: isThai ? 'แผนที่' : 'Map',
      icon: Map,
      isActive: pathname.includes(`/basin/${basinSlug}/map`),
    },
    {
      to: '/basin/$basinSlug/event',
      params: { basinSlug },
      label: isThai ? 'แจ้งเตือน' : 'Alerts',
      icon: Bell,
      isActive: pathname.includes(`/basin/${basinSlug}/event`),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-xl md:hidden pb-safe shadow-lg dark:shadow-2xl transition-colors">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              params={item.params}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                item.isActive
                  ? 'text-cyan-700 dark:text-cyan-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center ${
                  item.highlight && item.isActive
                    ? 'w-10 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.isActive && !item.highlight && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
