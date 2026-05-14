"use client";

import React, { useState, useEffect } from "react";
import {
  CircuitBoard,
  Table2,
  Map,
  Zap,
  Cpu,
  SlidersHorizontal,
  Music,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
} from "lucide-react";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  activeItem: string;
  unlocked: number;
  xp: number;
  soundOn: boolean;
  onNavigate: (itemId: string) => void;
  onSoundToggle: () => void;
  onBackHome: () => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { id: "canon", name: "Forma Canonica", icon: CircuitBoard },
  { id: "truth", name: "Tabella", icon: Table2 },
  { id: "kmap", name: "Mappa K", icon: Map },
  { id: "simplify", name: "Semplifica", icon: Zap },
  { id: "circuit", name: "Circuiti", icon: Cpu },
  { id: "sim", name: "Simulatore", icon: SlidersHorizontal },
  { id: "media", name: "Multimedialita", icon: Music },
];

export function Sidebar({
  activeItem,
  unlocked,
  xp,
  soundOn,
  onNavigate,
  onSoundToggle,
  onBackHome,
  className = "",
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleItemClick = (itemId: string, index: number) => {
    if (index >= unlocked) return;
    onNavigate(itemId);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const visibleItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-6 top-6 z-50 rounded-lg border border-slate-100 bg-white p-3 shadow-md transition-all duration-200 hover:bg-slate-50 md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-slate-600" />
        ) : (
          <Menu className="h-5 w-5 text-slate-600" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-28" : "w-80"}
          md:translate-x-0
          ${className}
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 p-5">
          {!isCollapsed && (
            <div className="flex min-w-0 items-center space-x-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <span className="text-base font-bold text-white">Y</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-semibold text-slate-800">
                  Logic Quest
                </span>
                <span className="truncate text-xs text-slate-500">
                  Forma canonica
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <span className="text-base font-bold text-white">Y</span>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden rounded-md p-1.5 transition-all duration-200 hover:bg-slate-100 md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const originalIndex = navigationItems.findIndex(
                (entry) => entry.id === item.id,
              );
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isLocked = originalIndex >= unlocked;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id, originalIndex)}
                    disabled={isLocked}
                    className={`
                      group relative flex w-full items-center rounded-md px-3 py-2.5 text-left transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                      ${isCollapsed ? "justify-center px-2" : "space-x-2.5"}
                      ${isLocked ? "cursor-not-allowed opacity-40" : ""}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex min-w-[24px] items-center justify-center">
                      <Icon
                        className={`
                          h-[18px] w-[18px] shrink-0
                          ${
                            isActive
                              ? "text-blue-600"
                              : "text-slate-500 group-hover:text-slate-700"
                          }
                        `}
                      />
                    </div>

                    {!isCollapsed && (
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`text-sm ${
                            isActive ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                            isLocked
                              ? "bg-slate-100 text-slate-500"
                              : isActive
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isLocked ? "lock" : originalIndex + 1}
                        </span>
                      </div>
                    )}

                    {isCollapsed && (
                      <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                        {item.name}
                        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1 -translate-y-1/2 rotate-45 bg-slate-800" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200">
          {!isCollapsed && (
            <div className="space-y-2 border-b border-slate-200 bg-slate-50/30 p-3">
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                <span>XP</span>
                <span className="text-emerald-600">{xp}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                <span>Livello</span>
                <span className="text-blue-600">{unlocked}/7</span>
              </div>
              <button
                onClick={onSoundToggle}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>Audio</span>
                <span className={soundOn ? "text-emerald-600" : "text-slate-500"}>
                  {soundOn ? "on" : "off"}
                </span>
              </button>
            </div>
          )}

          <div
            className={`border-b border-slate-200 bg-slate-50/30 ${
              isCollapsed ? "px-2 py-3" : "p-3"
            }`}
          >
            {!isCollapsed ? (
              <div className="flex items-center rounded-md bg-white px-3 py-2 transition-colors duration-200 hover:bg-slate-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                  <span className="text-sm font-medium text-slate-700">LC</span>
                </div>
                <div className="ml-2.5 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    Laboratorio
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Reti logiche
                  </p>
                </div>
                <div className="ml-2 h-2 w-2 rounded-full bg-green-500" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                    <span className="text-sm font-medium text-slate-700">LC</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3">
            <button
              onClick={onBackHome}
              className={`
                group flex w-full items-center rounded-md text-left text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Torna all'intro" : undefined}
            >
              <div className="flex min-w-[24px] items-center justify-center">
                <LogOut className="h-[18px] w-[18px] shrink-0 text-red-500 group-hover:text-red-600" />
              </div>
              {!isCollapsed && <span className="text-sm">Torna all&apos;intro</span>}
            </button>
          </div>
        </div>
      </aside>

    </>
  );
}

export { HelpCircle };
