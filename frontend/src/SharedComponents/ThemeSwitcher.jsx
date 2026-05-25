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
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl z-50 origin-top-right dark:bg-slate-800 dark:border-slate-700 animate-fade-in">
          
          {/* Header Title */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-gray-850 dark:text-white uppercase tracking-widest leading-none flex items-center gap-1.5">
              <Palette className="text-farm-green animate-pulse" size={11} /> 
              Interface Theme
            </span>
            <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">SYSTEM</span>
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
                  className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                    isSelected ? 'bg-gray-50/80 dark:bg-slate-700/30 border border-gray-200/50 dark:border-slate-600/30' : 'border border-transparent'
                  }`}
                >
                  <div className="flex gap-2.5 min-w-0 flex-1">
                    {/* Circle Icon Badge */}
                    <div 
                      className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border transition-colors ${
                        isSelected 
                          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600' 
                          : 'bg-gray-50 dark:bg-slate-900/85 border-gray-100 dark:border-slate-700'
                      }`}
                    >
                      {getThemeIcon(themeOption.id, 14)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none mb-0.5 uppercase tracking-tight">
                        {themeOption.name}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-slate-400 font-bold leading-none mb-2 tracking-wide uppercase opacity-80 truncate">
                        {themeOption.desc}
                      </span>

                      {/* Mini Color Palette Selector / Dots */}
                      <div className="flex gap-1.5 items-center">
                        {themeOption.colors.map((color, colorIdx) => (
                          <span 
                            key={colorIdx}
                            className="w-2.5 h-2.5 rounded-full border border-gray-250/20 shadow-sm transition-transform duration-300 hover:scale-125" 
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
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                      <Check size={8} className="stroke-[3.5px]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
