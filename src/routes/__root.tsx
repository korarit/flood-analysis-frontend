import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { LanguageProvider } from '../hooks/useLanguage';
import { ThemeProvider } from '../hooks/useTheme';

export const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200">
          <Outlet />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  ),
});
