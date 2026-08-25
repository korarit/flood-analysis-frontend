import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { Basin } from '../../types/basin';
import { getAllBasins } from '../../services/basinService';
import { StatusBadge } from '../common/StatusBadge';
import {
  Waves,
  ChevronDown,
  Search,
  Languages,
  Check,
  LayoutGrid,
  Sun,
  Moon,
} from 'lucide-react';

interface AppHeaderProps {
  currentBasin?: Basin;
  onOpenSearch: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentBasin,
  onOpenSearch,
}) => {
  const { t, language, setLanguage, isThai } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isBasinMenuOpen, setIsBasinMenuOpen] = useState(false);
  const allBasins = getAllBasins();

  const handleSelectBasin = (basinId: string) => {
    setIsBasinMenuOpen(false);
    navigate({
      to: '/basin/$basinSlug',
      params: { basinSlug: basinId },
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand & Basin Switcher */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            title={isThai ? 'กลับสู่หน้ารวมลุ่มน้ำ' : 'Back to Basin Selection'}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan flex items-center justify-center text-slate-950 group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 dark:from-cyan-300 dark:via-sky-200 dark:to-blue-400 bg-clip-text text-transparent block leading-tight">
                Water Situation
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-wider uppercase">
                {isThai ? 'แพลตฟอร์มติดตามสถานการณ์น้ำ' : 'Hydrology Platform'}
              </span>
            </div>
          </Link>

          {/* Basin Switcher Dropdown */}
          {currentBasin && (
            <div className="relative">
              <button
                onClick={() => setIsBasinMenuOpen(!isBasinMenuOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-900 dark:text-cyan-200 text-sm font-semibold transition-all hover:border-cyan-500 active:scale-95 shadow-sm cursor-pointer"
              >
                <span>{t(currentBasin.name)}</span>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-600 dark:text-cyan-400 transition-transform ${
                    isBasinMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isBasinMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsBasinMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase">
                        {isThai ? 'เลือกลุ่มน้ำ' : 'Select River Basin'}
                      </span>
                      <Link
                        to="/"
                        onClick={() => setIsBasinMenuOpen(false)}
                        className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <LayoutGrid className="w-3 h-3" />
                        <span>{isThai ? 'ดูทุกลุ่มน้ำ' : 'All Basins'}</span>
                      </Link>
                    </div>
                    <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
                      {allBasins.map((b) => {
                        const isSelected = b.id === currentBasin.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => handleSelectBasin(b.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium">{t(b.name)}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.totalStations} {isThai ? 'สถานี' : 'stations'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={b.overallStatus} size="sm" showIcon={false} />
                              {isSelected && <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Omni Search, Theme, Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Global Search Button (§Ctrl+K) */}
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-sm transition-all cursor-pointer group shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
            <span className="hidden sm:inline text-xs font-medium">{isThai ? 'ค้นหาสถานี...' : 'Search station...'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700 shadow-xs">
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title={isDark ? (isThai ? 'เปลี่ยนเป็นธีมสว่าง (Light Mode)' : 'Switch to Light Mode') : (isThai ? 'เปลี่ยนเป็นธีมมืด (Dark Mode)' : 'Switch to Dark Mode')}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title={isThai ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            <Languages className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
