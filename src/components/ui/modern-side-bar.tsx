"use client";

import React, { useState, useEffect } from "react";
import {
  CircuitBoard,
  TerminalSquare,
  Archive,
  Route,
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
  soundOn: boolean;
  onNavigate: (itemId: string) => void;
  onSoundToggle: () => void;
  onBackHome: () => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { id: "room", name: "Stanza 01", icon: CircuitBoard },
  { id: "terminal", name: "Terminale", icon: TerminalSquare },
  { id: "archive", name: "Archivio", icon: Archive },
  { id: "roadmap", name: "Percorso", icon: Route },
];

export function Sidebar({
  activeItem,
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

  const handleItemClick = (itemId: string) => {
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
        className="fixed left-6 top-6 z-50 rounded-lg border border-white/10 bg-slate-950 p-3 shadow-md transition-all duration-200 hover:bg-slate-900 md:hidden"
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
          fixed left-0 top-0 z-40 flex h-full flex-col border-r border-white/10 bg-slate-950/88 text-slate-100 backdrop-blur-xl transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-28" : "w-80"}
          md:translate-x-0
          ${className}
        `}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-5">
          {!isCollapsed && (
            <div className="flex min-w-0 items-center space-x-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 shadow-sm">
                <span className="text-base font-bold text-white">Y</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-semibold text-white">
                  Logic Quest
                </span>
                <span className="truncate text-xs text-slate-400">
                  Forma canonica
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 shadow-sm">
              <span className="text-base font-bold text-white">Y</span>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden rounded-md p-1.5 transition-all duration-200 hover:bg-white/10 md:flex"
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
                className="w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      group relative flex w-full items-center rounded-md px-3 py-2.5 text-left transition-all duration-200
                      ${
                        isActive
                          ? "bg-white/[0.12] text-white shadow-inner shadow-white/5"
                          : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                      }
                      ${isCollapsed ? "justify-center px-2" : "space-x-2.5"}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex min-w-[24px] items-center justify-center">
                      <Icon
                        className={`
                          h-[18px] w-[18px] shrink-0
                          ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-slate-200"
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

        <div className="border-t border-white/10">
          {!isCollapsed && (
            <div className="space-y-2 border-b border-white/10 bg-white/[0.03] p-3">
              <button
                onClick={onSoundToggle}
                className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                <span>Audio</span>
                <span className={soundOn ? "text-white" : "text-slate-500"}>
                  {soundOn ? "on" : "off"}
                </span>
              </button>
            </div>
          )}

          <div className="p-3">
            <button
              onClick={onBackHome}
              className={`
                group flex w-full items-center rounded-md text-left text-slate-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-white
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Torna all'intro" : undefined}
            >
              <div className="flex min-w-[24px] items-center justify-center">
                <LogOut className="h-[18px] w-[18px] shrink-0 text-slate-500 group-hover:text-white" />
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
