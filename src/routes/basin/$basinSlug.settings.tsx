import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useNearbyStation } from '../../hooks/useNearbyStation';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { Settings, Navigation, Trash2, Check, RefreshCcw, Globe2, Gauge, Sun, Moon } from 'lucide-react';

export function SettingsPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { t, language, setLanguage, isThai } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { savedStationId, nearbyStation, removeNearbyStation } = useNearbyStation(currentSlug);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleClearCache = () => {
    removeNearbyStation();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-2 transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-400 text-xs font-bold">
          <Settings className="w-3.5 h-3.5" />
          <span>{isThai ? 'การตั้งค่าและข้อมูลในเครื่อง' : 'Preferences & Local Storage'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {isThai ? 'การตั้งค่าระบบ' : 'System Settings'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {isThai
            ? 'จัดการธีมการแสดงผล สถานีใกล้ฉันที่บันทึกไว้ ภาษา และข้อมูล Local Storage ในเบราว์เซอร์'
            : 'Manage display theme, saved reference station, language, and browser storage.'}
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-5 h-5" />
          <span>{isThai ? 'ล้างข้อมูลและรีเซ็ตสถานีใกล้ฉันสำเร็จ' : 'Storage cleared and nearby station reset successfully.'}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* 1. Theme Mode (Dark / Light) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-xl shadow-md dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{isThai ? '1. ธีมการแสดงผล (Display Theme)' : '1. Display Theme'}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {isThai
              ? 'เลือกระหว่างโหมดมืด (Dark Mode) สำหรับการมองเห็นที่สบายตาในที่มืด หรือโหมดสว่าง (Light Mode) สำหรับการใช้งานในที่แจ้ง'
              : 'Choose between Dark Mode for reduced eye strain or Light Mode for bright environments.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                theme === 'dark'
                  ? 'border-cyan-400 bg-slate-900 text-cyan-200 font-bold shadow-md ring-2 ring-cyan-500/30'
                  : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{isThai ? 'ธีมมืด (Dark Theme)' : 'Dark Theme'}</div>
                <div className="text-[11px] text-slate-400 font-normal">{isThai ? 'โทน Cyber Hydrology มืด' : 'Default Cyber Hydro'}</div>
              </div>
              {theme === 'dark' && <Check className="w-5 h-5 text-cyan-400" />}
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                theme === 'light'
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold shadow-md ring-2 ring-cyan-500/30'
                  : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{isThai ? 'ธีมสว่าง (Light Theme)' : 'Light Theme'}</div>
                <div className="text-[11px] text-slate-500 font-normal">{isThai ? 'โทนสว่าง อ่านง่าย สบายตา' : 'Clean & Bright UI'}</div>
              </div>
              {theme === 'light' && <Check className="w-5 h-5 text-cyan-600" />}
            </div>
          </div>
        </div>

        {/* 2. Saved Nearby Station (§12) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-xl shadow-md dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Navigation className="w-4 h-4" />
            <span>{isThai ? '2. สถานีใกล้ฉันที่บันทึกไว้ (LocalStorage)' : '2. Saved Nearby Reference Station'}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {isThai
              ? 'ระบบบันทึกรหัสสถานีเพียง 1 สถานีใน LocalStorage บนอุปกรณ์ของคุณ โดยไม่มีการจัดเก็บพิกัดส่วนตัวบนเซิร์ฟเวอร์'
              : 'The system strictly persists 1 station code in local storage with zero server-side location tracking.'}
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              {nearbyStation ? (
                <>
                  <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">{nearbyStation.code}</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{t(nearbyStation.name)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {t(nearbyStation.geocode.amphoe)}, จ.{t(nearbyStation.geocode.province)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 italic font-medium">
                  {isThai ? 'ยังไม่มีการบันทึกสถานีใกล้ฉัน' : 'No nearby station saved yet'}
                </div>
              )}
            </div>

            {nearbyStation && (
              <button
                onClick={removeNearbyStation}
                className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isThai ? 'ยกเลิกการบันทึก' : 'Unset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Language Preference (§44) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-xl shadow-md dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Globe2 className="w-4 h-4" />
            <span>{isThai ? '3. ภาษาการแสดงผล (Language)' : '3. Display Language'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              onClick={() => setLanguage('th')}
              className={`p-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                language === 'th'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ภาษาไทย (TH)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* 4. Measurement Standard Units (§45) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-xl shadow-md dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>{isThai ? '4. หน่วยวัดมาตรฐานทางอุทกวิทยา' : '4. Hydrological Measurement Units'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">{isThai ? 'ระดับน้ำ:' : 'Water Level:'}</span>
              <span className="text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300">ม.รทก. (m MSL)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">{isThai ? 'ปริมาณการไหล:' : 'Discharge:'}</span>
              <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">m³/s (cms)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">{isThai ? 'ปริมาณฝน:' : 'Rainfall:'}</span>
              <span className="text-sm font-mono font-bold text-blue-700 dark:text-blue-300">มม. (mm)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">{isThai ? 'ระยะทาง:' : 'Distance:'}</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">กม. (km)</span>
            </div>
          </div>
        </div>

        {/* 5. Cache & Reset Utility */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-xl shadow-md dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isThai ? 'ล้างแคชและการตั้งค่าในเบราว์เซอร์' : 'Clear Cache & Browser Preferences'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {isThai ? 'รีเซ็ตสถานีใกล้ฉันและการตั้งค่าทั้งหมดกลับสู่ค่าเริ่มต้น' : 'Reset all cached nearby stations to initial defaults.'}
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 shadow-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>{isThai ? 'รีเซ็ตข้อมูล' : 'Reset Storage'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
