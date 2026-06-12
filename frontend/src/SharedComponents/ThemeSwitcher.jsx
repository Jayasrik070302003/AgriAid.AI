import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../Context/ThemeContext';
import { Sun, Moon, Leaf, Zap, Palette, Check } from 'lucide-react';

// Map theme IDs to representative icons
const getThemeIcon = (id, size = 14) => {
  switch (id) {
    case 'dark-ai':
      return <Moon size={size} className="text-emerald-400" />;
    case 'light':
      return <Sun size={size} className="text-[#eab308]" />;
    case 'green-agri':
      return <Leaf size={size} className="text-[#059669]" />;
    case 'cyber-neon':
      return <Zap size={size} className="text-[#ff007f] animate-pulse" />;
    default:
      return <Palette size={size} />;
  }
};

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-gray-100/80 border border-transparent text-gray-500 hover:text-farm-green hover:border-farm-green/20 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-emerald-400 shadow-sm relative overflow-hidden group cursor-pointer"
        title="Change UI Theme"
      >
        <span className="group-hover:rotate-12 transition-transform duration-300 relative z-10">
          {getThemeIcon(theme, 15)}
        </span>
        
        {/* Glow accent matching the current theme on hover */}
        <span 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" 
          style={{ backgroundColor: activeThemeObj.colors[2] }} 
        />
      </button>

      {/* Premium Dropdown Selector */}
      {isOpen && (
        <>
          {/* Mobile Overlay to capture outside clicks */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          <div className="fixed left-1/2 -translate-x-1/2 top-20 sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-auto sm:mt-4 w-[85vw] max-w-[280px] sm:w-[260px] rounded-2xl border border-gray-200/60 bg-white/95 backdrop-blur-2xl p-3 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 z-50 origin-top sm:origin-top-right dark:bg-slate-900/95 dark:border-slate-700/60 animate-fade-in">
            
            {/* Header Title */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                <Palette className="text-emerald-500 animate-pulse" size={12} /> 
                Interface Theme
              </span>
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">System</span>
            </div>

            {/* Theme Options */}
            <div className="space-y-1">
              {themes.map((themeOption) => {
                const isSelected = themeOption.id === theme;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => {
                      setTheme(themeOption.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm' 
                        : 'bg-transparent border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-gray-200/50 dark:hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Circle Icon Badge */}
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white dark:bg-slate-800 shadow-sm border border-emerald-100 dark:border-emerald-500/30' 
                            : 'bg-gray-100 dark:bg-slate-800 border border-transparent group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm'
                        }`}
                      >
                        {getThemeIcon(themeOption.id, 14)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase tracking-tight leading-tight mb-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {themeOption.name}
                        </span>
                        
                        {/* Mini Color Palette Selector / Dots */}
                        <div className="flex gap-1.5 items-center">
                          {themeOption.colors.map((color, colorIdx) => (
                            <span 
                              key={colorIdx}
                              className="w-3 h-3 rounded-full border border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:border-slate-700" 
                              style={{ backgroundColor: color }}
                              title={
                                colorIdx === 0 ? 'Background' :
                                colorIdx === 1 ? 'Surface Card' :
                                colorIdx === 2 ? 'Accent Color' : 'Text Primary'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Indicator Checkmark */}
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check size={12} className="stroke-[3px]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
