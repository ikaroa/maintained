"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

function AnimatedMenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-5 h-5 flex flex-col justify-center items-start gap-[5px]">
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-[18px] translate-y-[6.5px] rotate-45" : "w-3"
      }`} />
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] ${
        isOpen ? "w-[18px] opacity-0 translate-x-2" : "w-[18px] opacity-100"
      }`} />
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-[18px] -translate-y-[6.5px] -rotate-45" : "w-[18px]"
      }`} />
    </div>
  );
}

const menuItems = [
  { href: "/", label: "Home", delay: 120 },
  { href: "/services", label: "Services", delay: 170 },
  { href: "/rewards", label: "Rewards", delay: 220 },
  { href: "/properties", label: "Properties", delay: 270 },
  { href: "/reports", label: "Reports", delay: 320 },
  { href: "/contact", label: "Contact", delay: 370 },
  { href: "/settings", label: "Settings", delay: 420 },
];

const notifications = [
  { id: "1", title: "Booking Confirmed", message: "AC Service at Marina Residence — 22 Apr, 10:00", time: "2h ago", read: false },
  { id: "2", title: "Service Completed", message: "Deep Cleaning at Downtown Views has been completed", time: "1d ago", read: false },
  { id: "3", title: "Points Earned", message: "You earned 50 points for your last service", time: "2d ago", read: true },
  { id: "4", title: "Inspection Due", message: "Annual inspection for Marina Residence is due next month", time: "3d ago", read: true },
  { id: "5", title: "Welcome to Maintained", message: "Start by adding your properties and booking your first service", time: "1w ago", read: true },
];

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(notifications.filter(n => n.read).map(n => n.id));

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  function markAllRead() {
    setReadIds(notifications.map(n => n.id));
  }

  return (
    <>
      {/* Fullscreen menu */}
      <div
        className={`fixed inset-0 z-50 flex flex-col transition-all duration-600 ease-[cubic-bezier(0.77,0,0.18,1)] ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className={`absolute inset-0 bg-brand-black transition-transform duration-600 ease-[cubic-bezier(0.77,0,0.18,1)] origin-top ${
          menuOpen ? "scale-y-100" : "scale-y-0"
        }`} />
        <div className="relative z-10 h-[52px]" />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 max-w-sm mx-auto w-full">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-2xl text-[22px] font-light tracking-wide text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? `${item.delay}ms` : "0ms" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={`relative z-10 px-10 pb-12 max-w-sm mx-auto w-full transition-all duration-500 ${
          menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`} style={{ transitionDelay: menuOpen ? "400ms" : "0ms" }}>
          <div className="border-t border-white/[0.06] pt-5">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-white/25 text-sm hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Notifications sheet */}
      {notifOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setNotifOpen(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] flex flex-col animate-fade-slide-up">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-brand-black/[0.04]">
              <h3 className="text-[17px] font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[12px] text-brand-blue font-semibold">
                  Mark all read
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => !isRead && setReadIds(prev => [...prev, n.id])}
                    className={`w-full text-left px-6 py-4 border-b border-brand-black/[0.03] transition-colors ${
                      isRead ? "opacity-50" : "bg-brand-blue/[0.02]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!isRead && <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0" />}
                      <div className={!isRead ? "" : "pl-5"}>
                        <p className="text-[13px] font-semibold text-brand-black/80">{n.title}</p>
                        <p className="text-[12px] text-brand-black/40 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-brand-black/25 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-6 py-4 safe-bottom">
              <button onClick={() => setNotifOpen(false)} className="w-full py-3 rounded-2xl bg-brand-black/[0.04] text-[13px] font-semibold text-brand-black/50 active:scale-[0.98] transition-transform">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="relative z-[60] px-5 pt-3 pb-0 flex items-center justify-between">
        <button
          onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
          className={`w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all duration-500 z-[60] relative ${
            menuOpen ? "text-white" : "text-brand-blue"
          }`}
        >
          <AnimatedMenuIcon isOpen={menuOpen} />
        </button>
        <img
          src={menuOpen ? "/logo-grey.png" : "/logo-blue.png"}
          alt="Maintained"
          className="h-[18px] transition-all duration-500"
        />
        <button
          onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
          className={`relative w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all duration-500 ${
            menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <svg className="w-[18px] h-[18px] text-brand-blue/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
          )}
        </button>
      </header>
    </>
  );
}
