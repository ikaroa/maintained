"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  mockUser,
  mockProperties,
  mockServices,
  mockRewards,
  mockNotifications,
  mockBookings,
} from "@/data/mock-data";
import type {
  User,
  Property,
  Service,
  Reward,
  Notification,
  Booking,
} from "@/data/mock-data";

// ---------- Settings ----------
interface AppSettings {
  voiceSpeed: number;
  autoListen: boolean;
  greeting: string;
}

const defaultSettings: AppSettings = {
  voiceSpeed: 1.0,
  autoListen: false,
  greeting: "Hello! How can I help you with your property today?",
};

// ---------- Tier helpers ----------
type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";

interface TierThreshold {
  tier: Tier;
  min: number;
  max: number;
}

const TIER_THRESHOLDS: TierThreshold[] = [
  { tier: "Bronze", min: 0, max: 499 },
  { tier: "Silver", min: 500, max: 999 },
  { tier: "Gold", min: 1000, max: 1499 },
  { tier: "Platinum", min: 1500, max: 1999 },
  { tier: "Elite", min: 2000, max: Infinity },
];

function getTierInfo(points: number) {
  const idx = TIER_THRESHOLDS.findIndex(
    (t) => points >= t.min && points <= t.max,
  );
  const current = TIER_THRESHOLDS[idx];
  const next = TIER_THRESHOLDS[idx + 1];
  return {
    currentTier: current.tier,
    nextTierName: next?.tier ?? null,
    nextTierPoints: next ? next.min - points : 0,
  };
}

// ---------- Context value ----------
interface AppContextValue {
  // State
  user: User;
  properties: Property[];
  services: Service[];
  bookings: Booking[];
  rewards: Reward[];
  redeemedRewards: Reward[];
  notifications: Notification[];
  settings: AppSettings;
  voiceOpen: boolean;
  isListening: boolean;
  isProcessing: boolean;

  // Derived
  averageScore: number;
  unreadNotificationCount: number;
  currentTier: Tier;
  nextTierName: string | null;
  nextTierPoints: number;

  // Mutations — properties
  addProperty: (property: Property) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  removeProperty: (id: string) => void;

  // Mutations — bookings
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;

  // Mutations — rewards / points
  redeemReward: (rewardId: string) => void;
  addPoints: (amount: number) => void;

  // Mutations — notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Mutations — settings
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Mutations — voice
  setVoiceOpen: (open: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ---------- Provider ----------
export function AppProvider({ children }: { children: React.ReactNode }) {
  // --- Core state ---
  const [user, setUser] = useState<User>(mockUser);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [redeemedRewards, setRedeemedRewards] = useState<Reward[]>([]);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // --- Voice state ---
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Load settings from localStorage on mount ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem("maintained-settings");
      if (stored) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // localStorage unavailable — use defaults
    }
  }, []);

  // ---------- Derived ----------
  const averageScore = useMemo(() => {
    if (properties.length === 0) return 0;
    return Math.round(
      properties.reduce((sum, p) => sum + p.score, 0) / properties.length,
    );
  }, [properties]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const tierInfo = useMemo(() => getTierInfo(user.points), [user.points]);

  // ---------- Mutations: properties ----------
  const addProperty = useCallback((property: Property) => {
    setProperties((prev) => [...prev, property]);
  }, []);

  const updateProperty = useCallback(
    (id: string, data: Partial<Property>) => {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
    },
    [],
  );

  const removeProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---------- Mutations: bookings ----------
  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  const updateBooking = useCallback(
    (id: string, data: Partial<Booking>) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
      );
    },
    [],
  );

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ---------- Mutations: rewards / points ----------
  const redeemReward = useCallback(
    (rewardId: string) => {
      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward || !reward.available) return;
      if (user.points < reward.points) return;

      setUser((prev) => ({
        ...prev,
        points: prev.points - reward.points,
        tier: getTierInfo(prev.points - reward.points).currentTier,
      }));
      setRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId ? { ...r, available: false } : r,
        ),
      );
      setRedeemedRewards((prev) => [
        ...prev,
        { ...reward, available: false },
      ]);
    },
    [rewards, user.points],
  );

  const addPoints = useCallback((amount: number) => {
    setUser((prev) => {
      const newPoints = prev.points + amount;
      return {
        ...prev,
        points: newPoints,
        tier: getTierInfo(newPoints).currentTier,
      };
    });
  }, []);

  // ---------- Mutations: notifications ----------
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ---------- Mutations: settings ----------
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem("maintained-settings", JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  // ---------- Context value ----------
  const value = useMemo<AppContextValue>(
    () => ({
      user,
      properties,
      services: mockServices,
      bookings,
      rewards,
      redeemedRewards,
      notifications,
      settings,
      voiceOpen,
      isListening,
      isProcessing,

      averageScore,
      unreadNotificationCount,
      currentTier: tierInfo.currentTier,
      nextTierName: tierInfo.nextTierName,
      nextTierPoints: tierInfo.nextTierPoints,

      addProperty,
      updateProperty,
      removeProperty,
      addBooking,
      updateBooking,
      cancelBooking,
      redeemReward,
      addPoints,
      markNotificationRead,
      clearNotifications,
      updateSettings,
      setVoiceOpen,
      setIsListening,
      setIsProcessing,
    }),
    [
      user,
      properties,
      bookings,
      rewards,
      redeemedRewards,
      notifications,
      settings,
      voiceOpen,
      isListening,
      isProcessing,
      averageScore,
      unreadNotificationCount,
      tierInfo,
      addProperty,
      updateProperty,
      removeProperty,
      addBooking,
      updateBooking,
      cancelBooking,
      redeemReward,
      addPoints,
      markNotificationRead,
      clearNotifications,
      updateSettings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ---------- Hook ----------
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
