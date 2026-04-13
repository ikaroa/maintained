"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TabBar from "@/components/ui/tab-bar";
import TopBar from "@/components/ui/top-bar";
import VoiceOverlay from "@/components/voice-overlay";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Booking {
  id: string;
  serviceName: string;
  propertyName: string;
  date: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed";
  cost: string;
  engineer: string;
}

const services = [
  { id: "plumbing", name: "Plumbing", desc: "Repairs, installations & maintenance", icon: "M11.42 15.17l-5.84-3.38a1 1 0 01-.08-1.69l9.82-5.72a1 1 0 011.34.47l3.54 7.08a1 1 0 01-.47 1.34l-9.82 5.72a1 1 0 01-1.34-.47z", price: "AED 150 – 500", duration: "1–3 hours" },
  { id: "electrical", name: "Electrical", desc: "Wiring, sockets & lighting", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", price: "AED 200 – 600", duration: "1–4 hours" },
  { id: "ac", name: "AC Service", desc: "Cleaning, gas top-up & repair", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", price: "AED 150 – 350", duration: "1–2 hours" },
  { id: "cleaning", name: "Cleaning", desc: "Deep clean, regular & move-in/out", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", price: "AED 200 – 800", duration: "2–5 hours" },
  { id: "painting", name: "Painting", desc: "Interior & exterior painting", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", price: "AED 500 – 3,000", duration: "1–3 days" },
  { id: "handyman", name: "Handyman", desc: "General fixes & odd jobs", icon: "M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z", price: "AED 100 – 400", duration: "1–2 hours" },
];

const properties = [
  { id: "1", name: "Marina Residence Tower 1 — Unit 1204" },
  { id: "2", name: "Downtown Views — Unit 503" },
];

function generateSlots(): { date: string; dayLabel: string; slots: TimeSlot[] }[] {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const dateStr = d.toISOString().split("T")[0];
    const slots: TimeSlot[] = [
      { time: "09:00", available: Math.random() > 0.3 },
      { time: "10:00", available: Math.random() > 0.3 },
      { time: "11:00", available: Math.random() > 0.2 },
      { time: "13:00", available: Math.random() > 0.3 },
      { time: "14:00", available: Math.random() > 0.2 },
      { time: "15:00", available: Math.random() > 0.4 },
      { time: "16:00", available: Math.random() > 0.3 },
    ];
    days.push({ date: dateStr, dayLabel, slots });
  }
  return days;
}

const mockBookings: Booking[] = [
  { id: "b1", serviceName: "AC Service", propertyName: "Marina Residence Tower 1", date: "22 Apr 2026", time: "10:00", status: "Scheduled", cost: "AED 350", engineer: "Ahmed K." },
  { id: "b2", serviceName: "Deep Cleaning", propertyName: "Downtown Views", date: "10 Apr 2026", time: "09:00", status: "Completed", cost: "AED 600", engineer: "Maria L." },
];

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [tab, setTab] = useState<"browse" | "bookings">("browse");
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [didAutoOpen, setDidAutoOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<"detail" | "schedule" | "confirm" | "success">("detail");
  const [selectedProperty, setSelectedProperty] = useState(properties[0].id);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [scheduleData] = useState(generateSlots);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  // Auto-open service from query param (e.g. /services?book=plumbing)
  useEffect(() => {
    if (!didAutoOpen && searchParams) {
      const bookId = searchParams.get("book");
      if (bookId) {
        const service = services.find(s => s.id === bookId);
        if (service) {
          setSelectedService(service);
          setDidAutoOpen(true);
        }
      }
    }
  }, [searchParams, didAutoOpen]);
  if (status === "loading" || !session) return null;

  function handleBook() {
    if (!selectedService) return;
    const prop = properties.find(p => p.id === selectedProperty);
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      serviceName: selectedService.name,
      propertyName: prop?.name.split(" — ")[0] || "",
      date: new Date(selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      time: selectedTime,
      status: "Scheduled",
      cost: selectedService.price.split(" – ")[0],
      engineer: "TBC",
    };
    setBookings(prev => [newBooking, ...prev]);
    setBookingStep("success");
  }

  function resetBooking() {
    setSelectedService(null);
    setBookingStep("detail");
    setSelectedDate("");
    setSelectedTime("");
  }

  // Booking flow overlay
  if (selectedService) {
    return (
      <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col">
        {/* Header */}
        <div className="px-5 pt-12 pb-3 flex items-center gap-3">
          <button onClick={resetBooking} className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <svg className="w-5 h-5 text-brand-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-[17px] font-semibold">{selectedService.name}</h2>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {["detail", "schedule", "confirm", "success"].map((step, i) => (
            <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${
              step === bookingStep ? "w-6 bg-brand-blue" :
              ["detail", "schedule", "confirm", "success"].indexOf(bookingStep) > i ? "w-1.5 bg-brand-blue/40" : "w-1.5 bg-brand-black/10"
            }`} />
          ))}
        </div>

        <div className="flex-1 px-5 pb-8">
          {/* Step 1: Detail */}
          {bookingStep === "detail" && (
            <div className="space-y-5 animate-fade-slide-up">
              <div className="card">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/[0.06] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-brand-blue/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={selectedService.icon} />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold mb-1">{selectedService.name}</p>
                <p className="text-[13px] text-brand-black/45 leading-relaxed">{selectedService.desc}</p>
                <div className="flex gap-4 mt-4 pt-4 border-t border-brand-black/[0.04]">
                  <div>
                    <p className="text-[11px] text-brand-black/35 uppercase tracking-wider">Price Range</p>
                    <p className="text-[14px] font-semibold mt-0.5">{selectedService.price}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-brand-black/35 uppercase tracking-wider">Duration</p>
                    <p className="text-[14px] font-semibold mt-0.5">{selectedService.duration}</p>
                  </div>
                </div>
              </div>

              {/* Property selector */}
              <div className="card">
                <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3">Select Property</p>
                <div className="space-y-2">
                  {properties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProperty(p.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[13px] transition-all ${
                        selectedProperty === p.id
                          ? "bg-brand-blue/[0.06] text-brand-blue font-semibold ring-1 ring-brand-blue/20"
                          : "bg-brand-black/[0.02] text-brand-black/60"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setBookingStep("schedule")}
                className="w-full py-3.5 rounded-2xl bg-brand-blue text-white text-[13px] font-semibold tracking-wide active:scale-[0.98] transition-transform"
              >
                Choose Date & Time
              </button>
            </div>
          )}

          {/* Step 2: Schedule */}
          {bookingStep === "schedule" && (
            <div className="space-y-5 animate-fade-slide-up">
              <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest px-1">Select a Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {scheduleData.map(day => (
                  <button
                    key={day.date}
                    onClick={() => { setSelectedDate(day.date); setSelectedTime(""); }}
                    className={`shrink-0 px-4 py-3 rounded-xl text-center transition-all ${
                      selectedDate === day.date
                        ? "bg-brand-blue text-white"
                        : "bg-white text-brand-black/60 shadow-sm"
                    }`}
                  >
                    <p className="text-[12px] font-semibold">{day.dayLabel}</p>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest px-1 pt-2">Available Times</p>
                  <div className="grid grid-cols-3 gap-2">
                    {scheduleData.find(d => d.date === selectedDate)?.slots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-3 rounded-xl text-[13px] font-medium transition-all ${
                          selectedTime === slot.time
                            ? "bg-brand-blue text-white"
                            : slot.available
                            ? "bg-white text-brand-black/60 shadow-sm active:scale-95"
                            : "bg-brand-black/[0.03] text-brand-black/15 line-through"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setBookingStep("confirm")}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-3.5 rounded-2xl text-[13px] font-semibold tracking-wide active:scale-[0.98] transition-all ${
                  selectedDate && selectedTime
                    ? "bg-brand-blue text-white"
                    : "bg-brand-black/10 text-brand-black/25"
                }`}
              >
                Review Booking
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {bookingStep === "confirm" && (
            <div className="space-y-5 animate-fade-slide-up">
              <div className="card">
                <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-4">Booking Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-brand-black/40">Service</span>
                    <span className="text-[13px] font-medium">{selectedService.name}</span>
                  </div>
                  <div className="border-t border-brand-black/[0.04]" />
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-brand-black/40">Property</span>
                    <span className="text-[13px] font-medium text-right max-w-[200px]">{properties.find(p => p.id === selectedProperty)?.name.split(" — ")[0]}</span>
                  </div>
                  <div className="border-t border-brand-black/[0.04]" />
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-brand-black/40">Date</span>
                    <span className="text-[13px] font-medium">{new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="border-t border-brand-black/[0.04]" />
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-brand-black/40">Time</span>
                    <span className="text-[13px] font-medium">{selectedTime}</span>
                  </div>
                  <div className="border-t border-brand-black/[0.04]" />
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-brand-black/40">Est. Cost</span>
                    <span className="text-[13px] font-semibold text-brand-blue">{selectedService.price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full py-3.5 rounded-2xl bg-brand-gold text-brand-black text-[13px] font-semibold tracking-wide active:scale-[0.98] transition-transform"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setBookingStep("schedule")}
                className="w-full py-3 text-[13px] text-brand-black/40 font-medium"
              >
                Change Date & Time
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {bookingStep === "success" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pt-16 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold mb-2">Booking Confirmed</h3>
              <p className="text-[13px] text-brand-black/40 max-w-xs">
                Your {selectedService.name.toLowerCase()} service has been scheduled. We&apos;ll send you a confirmation shortly.
              </p>
              <div className="flex gap-3 mt-8 w-full">
                <button
                  onClick={() => { resetBooking(); setTab("bookings"); }}
                  className="flex-1 py-3 rounded-2xl bg-brand-blue text-white text-[13px] font-semibold active:scale-[0.98] transition-transform"
                >
                  View Bookings
                </button>
                <button
                  onClick={resetBooking}
                  className="flex-1 py-3 rounded-2xl bg-brand-black/[0.04] text-brand-black/60 text-[13px] font-semibold active:scale-[0.98] transition-transform"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main services view
  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <TopBar />
      <header className="px-6 pt-2 pb-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Services</h1>
      </header>

      {/* Tab switcher */}
      <div className="px-5 pb-4">
        <div className="flex bg-brand-black/[0.04] rounded-xl p-1">
          <button
            onClick={() => setTab("browse")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              tab === "browse" ? "bg-white text-brand-black shadow-sm" : "text-brand-black/35"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              tab === "bookings" ? "bg-white text-brand-black shadow-sm" : "text-brand-black/35"
            }`}
          >
            My Bookings ({bookings.length})
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 space-y-3 stagger">
        {tab === "browse" ? (
          services.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s)}
              className="card card-pressed w-full flex items-center gap-4 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-blue/[0.06] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-blue/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-brand-black/80">{s.name}</p>
                <p className="text-[12px] text-brand-black/35 mt-0.5">{s.desc}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] font-semibold text-brand-blue">{s.price.split(" – ")[0]}+</p>
                <svg className="w-4 h-4 text-brand-black/15 ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))
        ) : (
          bookings.length === 0 ? (
            <div className="text-center pt-16">
              <p className="text-brand-black/30 text-[14px]">No bookings yet</p>
              <button onClick={() => setTab("browse")} className="mt-3 text-brand-blue text-[13px] font-semibold">
                Browse Services
              </button>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-semibold text-brand-black/80">{b.serviceName}</p>
                    <p className="text-[12px] text-brand-black/35 mt-0.5">{b.propertyName}</p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                    b.status === "Completed" ? "bg-brand-blue/[0.06] text-brand-blue" :
                    b.status === "Scheduled" ? "bg-brand-gold/10 text-brand-gold" :
                    "bg-brand-aqua/15 text-brand-blue/70"
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-brand-black/35 pt-2 border-t border-brand-black/[0.04]">
                  <span>{b.date} at {b.time}</span>
                  <span>{b.cost}</span>
                  {b.engineer !== "TBC" && <span>Engineer: {b.engineer}</span>}
                </div>
              </div>
            ))
          )
        )}
      </div>

      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
