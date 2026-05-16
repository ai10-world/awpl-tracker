// app/auth/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }}>

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-30%] w-80 h-80 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(255,115,10,0.6) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, rgba(255,115,10,0.4) 0%, transparent 70%)" }} />
        </div>

        {/* Logo */}
        <div className="relative">
          <img src="/logo.png" alt="Asclepius" className="h-10 w-auto rounded-xl mb-12" />

          {/* Feature list */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-1)" }}>
                AWPL Team Tracker
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                Track performance, manage teams, submit daily reports — all in one platform built for AWPL network leaders.
              </p>
            </div>

            {[
              { emoji: "📋", title: "Daily Reports", desc: "डियर फाइटर format with Plan, Follow Up, Sign Up & SP" },
              { emoji: "👥", title: "Team Management", desc: "Create teams, assign roles, manage your downline" },
              { emoji: "📊", title: "Performance Tracking", desc: "Track sales points, targets and achievements" },
              { emoji: "🔐", title: "Secure Access", desc: "PIN-based daily login with role-based permissions" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{f.emoji}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "var(--surface-3)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{ background: "rgba(255,115,10,0.15)", color: "var(--brand-400)" }}>A</div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>Asclepius Wellness</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Empowering Wellness</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile nav */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5">
          <Link href="/">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-xl" />
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
