// app/auth/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left — branding panel desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-96 flex-shrink-0 relative overflow-hidden p-10"
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }}>
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.08) 0%, transparent 70%)" }} />
        <div className="relative">
          <img src="/logo.png" alt="Asclepius" className="h-10 w-auto rounded-xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)", color: "var(--brand-400)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-brand"
              style={{ background: "var(--brand-400)" }} />
            AWPL Network Platform
          </div>
          <h1 className="font-display font-bold text-4xl leading-tight mb-4">
            <span className="text-gradient">Track.</span><br />
            <span style={{ color: "var(--text-1)" }}>Grow.</span><br />
            <span style={{ color: "var(--text-2)" }}>Lead.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
            A complete platform for AWPL network leaders to manage teams, track daily performance, and grow together.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Daily Reports", "Team Management", "Sales Tracking", "Role-Based Access"].map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: "var(--surface-3)", color: "var(--text-3)", border: "1px solid var(--border-1)" }}>
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs" style={{ color: "var(--text-4)" }}>
          Built for AWPL network professionals
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-1)" }}>
          <Link href="/">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-xl" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
