"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "@/components/ui/top-bar";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || !session) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setMessage("");
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <TopBar />

      <header className="px-6 pt-2 pb-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Contact</h1>
      </header>

      <div className="flex-1 px-5 space-y-5 stagger">
        {/* Quick actions */}
        <div className="card">
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-4">Get In Touch</p>
          <div className="space-y-3">
            <a href="tel:+97144567890" className="flex items-center gap-4 p-3 rounded-xl bg-brand-blue/[0.03] active:bg-brand-blue/[0.06] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/[0.07] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-brand-black/80">Call Us</p>
                <p className="text-[12px] text-brand-black/35 mt-0.5">+971 4 456 7890</p>
              </div>
              <svg className="w-4 h-4 text-brand-black/15 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>

            <a href="mailto:support@maintained.ae" className="flex items-center gap-4 p-3 rounded-xl bg-brand-blue/[0.03] active:bg-brand-blue/[0.06] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/[0.07] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-brand-black/80">Email</p>
                <p className="text-[12px] text-brand-black/35 mt-0.5">support@maintained.ae</p>
              </div>
              <svg className="w-4 h-4 text-brand-black/15 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>

            <a href="https://wa.me/97144567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-xl bg-brand-blue/[0.03] active:bg-brand-blue/[0.06] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-500/[0.07] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-brand-black/80">WhatsApp</p>
                <p className="text-[12px] text-brand-black/35 mt-0.5">Chat with our team</p>
              </div>
              <svg className="w-4 h-4 text-brand-black/15 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Locations */}
        <div className="card">
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-4">Our Locations</p>
          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-semibold text-brand-black/80">Maintained JBR</p>
              <p className="text-[12px] text-brand-black/35 mt-0.5">Jumeirah Beach Residence, Bahar 1</p>
              <p className="text-[12px] text-brand-black/35">Dubai, UAE</p>
              <p className="text-[12px] text-brand-blue/60 mt-1">Sun – Thu: 8:00 AM – 6:00 PM</p>
            </div>
            <div className="border-t border-brand-black/[0.04]" />
            <div>
              <p className="text-[14px] font-semibold text-brand-black/80">Maintained JGE</p>
              <p className="text-[12px] text-brand-black/35 mt-0.5">Jumeirah Garden Estates, Al Badia</p>
              <p className="text-[12px] text-brand-black/35">Dubai, UAE</p>
              <p className="text-[12px] text-brand-blue/60 mt-1">Sun – Thu: 8:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="card">
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-4">Send a Message</p>
          {sent ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold">Message Sent</p>
              <p className="text-[12px] text-brand-black/40 mt-1">We&apos;ll get back to you within 24 hours</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] text-brand-black/40 font-medium block mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-brand-black/[0.03] text-[13px] placeholder-brand-black/25 outline-none focus:ring-1 focus:ring-brand-blue/20 transition-shadow"
                />
              </div>
              <div>
                <label className="text-[12px] text-brand-black/40 font-medium block mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-brand-black/[0.03] text-[13px] placeholder-brand-black/25 outline-none focus:ring-1 focus:ring-brand-blue/20 transition-shadow resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-brand-blue text-white text-[13px] font-semibold tracking-wide active:scale-[0.98] transition-transform"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Emergency */}
        <div className="card !bg-red-50/50 border border-red-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-red-700">Emergency?</p>
              <p className="text-[12px] text-red-600/60 mt-0.5">For urgent issues like water leaks or electrical hazards</p>
            </div>
          </div>
          <a href="tel:+971800MAINTAINED" className="mt-4 block w-full py-3 rounded-xl bg-red-500 text-white text-[13px] font-semibold text-center active:scale-[0.98] transition-transform">
            Call Emergency Line
          </a>
        </div>
      </div>

      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
