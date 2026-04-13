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
    ? { c1: "oklch(80% 0.10 200)", c2: "oklch(78% 0.12 195)", c3: "oklch(85% 0.08 190)" }
    : isProcessing
    ? { c1: "oklch(75% 0.14 85)", c2: "oklch(40% 0.06 220)", c3: "oklch(70% 0.12 75)" }
    : { c1: "oklch(72% 0.12 85)", c2: "oklch(35% 0.05 220)", c3: "oklch(78% 0.08 200)" };

  const orbSpeed = isListening ? 4 : isProcessing ? 8 : 20;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-brand-black/[0.04]" />

      <div className="relative flex items-end justify-around px-2 pb-7 pt-2">
        {tabs.map((tab, i) => {
          if (tab.href === "__orb__") {
            return (
              <button
                key="orb"
                onClick={onOrbPress}
                className={`relative -mt-7 active:scale-95 transition-transform duration-200`}
              >
                <div className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 ${
                  isListening ? "bg-brand-aqua/20 opacity-100" : "bg-brand-gold/10 opacity-60"
                }`} />
                <div className="relative rounded-full shadow-lg shadow-brand-black/10">
                  <SiriOrb
                    size="52px"
                    colors={orbColors}
                    animationDuration={orbSpeed}
                  />
                </div>
              </button>
            );
          }

          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 min-w-[52px] py-1.5 transition-colors active:scale-95 ${
                isActive ? "text-brand-blue" : "text-brand-black/30"
              }`}
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium ${isActive ? "text-brand-blue" : "text-brand-black/30"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
