"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SiriOrb } from "./siri-orb";

interface TabBarProps {
  onOrbPress: () => void;
  isListening: boolean;
  isProcessing: boolean;
}

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} viewBox="0 0 24 24" strokeWidth={1.5}>
        {active ? (
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.94a.75.75 0 01-.75.75h-3.75a.75.75 0 01-.75-.75V17.5a1.5 1.5 0 00-3 0v4.25a.75.75 0 01-.75.75H6.5a.75.75 0 01-.75-.75v-7.94H4.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        )}
      </svg>
    ),
  },
  {
    href: "/services",
    label: "Services",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  { href: "__orb__", label: "", icon: () => null },
  {
    href: "/rewards",
    label: "Rewards",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} viewBox="0 0 24 24" strokeWidth={1.5}>
        {active ? (
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        )}
      </svg>
    ),
  },
  {
    href: "/properties",
    label: "Properties",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} viewBox="0 0 24 24" strokeWidth={1.5}>
        {active ? (
          <path d="M3 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5H15v-18a.75.75 0 000-1.5H3zM6.75 19.5v-2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v2.25h-4.5zM6 6.75A.75.75 0 016.75 6h.75a.75.75 0 010 1.5h-.75A.75.75 0 016 6.75zM6.75 9a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM6 12.75a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM10.5 6a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zm-.75 3.75A.75.75 0 0110.5 9h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM10.5 12a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM16.5 6.75v15h5.25a.75.75 0 000-1.5H21v-12a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        )}
      </svg>
    ),
  },
];

export default function TabBar({ onOrbPress, isListening, isProcessing }: TabBarProps) {
  const pathname = usePathname();

  const orbColors = isListening
    ? { c1: "oklch(30% 0.045 230)", c2: "oklch(82% 0.12 85)", c3: "oklch(27% 0.04 230)" }   // #1A323F + brighter #D0B675
    : isProcessing
    ? { c1: "oklch(27% 0.04 230)", c2: "oklch(80% 0.13 85)", c3: "oklch(25% 0.035 230)" }   // blue + gold pulse
    : { c1: "oklch(27% 0.04 230)", c2: "oklch(78% 0.10 85)", c3: "oklch(24% 0.035 230)" };  // #1A323F + #D0B675

  const orbSpeed = isListening ? 4 : isProcessing ? 8 : 20;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom" style={{ height: "90px" }}>
      {/* Background with curved notch — using clip-path for clean rendering */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
          <defs>
            <filter id="tabShadow">
              <feDropShadow dx="0" dy="-1" stdDeviation="3" floodColor="#201F1A" floodOpacity="0.06" />
            </filter>
          </defs>
          <path
            d="M0,24 L156,24 Q168,24 175,30 Q184,38 200,38 Q216,38 225,30 Q232,24 244,24 L400,24 L400,90 L0,90 Z"
            fill="white"
            fillOpacity="0.95"
            filter="url(#tabShadow)"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-[66px] bg-white/95 backdrop-blur-2xl" />
      </div>

      {/* Center orb — nestled into the curve */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[6px] z-10">
        <button
          onClick={onOrbPress}
          className="relative active:scale-90 transition-transform duration-200"
        >
          <div className={`absolute -inset-2 rounded-full transition-all duration-500 blur-xl ${
            isListening ? "bg-brand-aqua/20 opacity-100" : "bg-brand-blue/10 opacity-60"
          }`} />
          <div className="absolute -inset-[3px] rounded-full bg-gradient-to-b from-white/80 to-white/40 shadow-[0_2px_8px_rgba(26,50,63,0.15),0_1px_2px_rgba(26,50,63,0.1)]" />
          <div className="absolute -inset-[1px] rounded-full bg-gradient-to-b from-white/30 to-transparent" />
          <div className="relative rounded-full overflow-hidden shadow-inner">
            <SiriOrb
              size="55px"
              colors={orbColors}
              animationDuration={orbSpeed}
            />
          </div>
        </button>
      </div>

      {/* Tab items — evenly spaced with proper gap for orb */}
      <div className="absolute bottom-0 left-0 right-0 h-[66px] flex items-center justify-around px-4">
        {tabs.map((tab) => {
          if (tab.href === "__orb__") {
            return <div key="orb-spacer" className="w-[60px]" />;
          }

          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 min-w-[56px] active:scale-90 transition-all duration-200 ${
                isActive ? "text-brand-blue" : "text-brand-black/25"
              }`}
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-brand-blue" : "text-brand-black/25"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
