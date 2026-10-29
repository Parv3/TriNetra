import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrinetraLogo } from '@/components/common/TrinetraLogo';
import { Button } from '@/components/common/Button';
import {
  ShieldCheck,
  Eye,
  KeyRound,
  Lock,
  AlertTriangle,
  Clock,
  WifiOff,
  Layout,
  ArrowRight,
  Download,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Terminal,
  Activity,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();
  const [activeTabDemo, setActiveTabDemo] = useState(0);

  const demoTimeline = [
    { time: '14:31:58', event: 'Opened chatgpt.com', tag: 'AI TOOL', tagColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { time: '14:32:11', event: 'Query: "Transformer attention complexity L"', tag: 'SEARCH', tagColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { time: '14:33:05', event: 'Closed chatgpt.com (67s duration)', tag: 'TAB CLOSE', tagColor: 'bg-muted text-muted-foreground border-border' },
    { time: '14:34:20', event: 'Opened en.wikipedia.org (Reference)', tag: 'ALLOWED', tagColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTabDemo((prev) => (prev + 1) % demoTimeline.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [demoTimeline.length]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/20">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 glass-nav border-b border-border/70 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <TrinetraLogo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#activity-tracker" className="hover:text-foreground transition-colors">Smart Tabs</a>
            <a href="#download" className="hover:text-foreground transition-colors">Downloads</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/system-check')}
              className="gap-2 bg-gradient-trinetra border-0 hover:opacity-95 text-white font-semibold shadow-md shadow-[#5B4BFF]/20"
            >
              Launch Assessment App
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B4BFF]/10 border border-[#5B4BFF]/20 text-xs font-semibold text-[#5B4BFF]">
            <span className="w-2 h-2 rounded-full bg-[#5B4BFF] animate-ping" />
            Chromium AI-Proctored Browser Shell
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-heading">
            Fair tests.{' '}
            <span className="text-gradient-trinetra">Zero shortcuts.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl font-normal leading-relaxed">
            Locked-down student exam browser where tabs are permitted, but all LLMs and external aids are detected and logged in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/system-check')}
              className="gap-2.5 bg-gradient-trinetra text-white font-semibold shadow-lg shadow-[#5B4BFF]/25 border-0 hover:scale-[1.01]"
            >
              <Terminal className="w-4 h-4" />
              Enter Examination Mode
            </Button>

            <a href="#download">
              <Button variant="outline" size="lg" className="gap-2 border-border/80">
                <Download className="w-4 h-4" />
                Desktop Package (.exe / .dmg)
              </Button>
            </a>
          </div>

          {/* Quick Stats */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 max-w-md">
            <div>
              <div className="text-xl font-bold font-heading text-foreground">100%</div>
              <div className="text-xs text-muted-foreground">On-device privacy</div>
            </div>
            <div>
              <div className="text-xl font-bold font-heading text-[#5B4BFF]">3 Alerts</div>
              <div className="text-xs text-muted-foreground">Violation quota</div>
            </div>
            <div>
              <div className="text-xl font-bold font-heading text-cyan-500">Live Tabs</div>
              <div className="text-xs text-muted-foreground">Audited in-app</div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Mockup on Right */}
        <div className="lg:col-span-5 relative">
          {/* Glowing gradient back-blur */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#5B4BFF]/30 to-[#19D3F3]/25 rounded-3xl blur-2xl -z-10" />

          {/* Mockup Frame */}
          <div className="relative rounded-2xl border-2 border-border/80 bg-card p-4 shadow-2xl">
            {/* Mock Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#5B4BFF]/15 text-[#5B4BFF] font-semibold text-[11px]">
                  Test Mode Active
                </span>
                <span className="text-muted-foreground font-mono">29:45 remaining</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Risk Ring */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  RISK: OK
                </div>
              </div>
            </div>

            {/* Mock Question Preview */}
            <div className="py-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Question 3 of 10</div>
              <p className="text-sm font-medium text-foreground">
                In Deep Learning, what issue does the AdamW optimizer specifically fix over standard Adam?
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg border border-[#5B4BFF] bg-[#5B4BFF]/5 font-medium flex items-center justify-between">
                  <span>A. Decouples weight decay directly from gradient moments</span>
                  <CheckCircle2 className="w-4 h-4 text-[#5B4BFF]" />
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground">
                  B. Calculates exact second-order Hessian approximations
                </div>
              </div>
            </div>

            {/* Floating Webcam Bubble with Risk Ring */}
            <div className="absolute -bottom-6 -right-6 w-32 h-24 rounded-xl border-2 border-border bg-black shadow-xl overflow-hidden flex flex-col items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                alt="Webcam proctor preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full text-[9px] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-16 px-6 bg-muted/30 border-y border-border/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">How Trinetra Works</h2>
            <p className="text-sm text-muted-foreground">Three transparent stages ensuring zero academic fraud.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B4BFF]/10 text-[#5B4BFF] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-semibold">Verify Workstation & Identity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Biometric face match against registry, single physical monitor enforcement, and OTP access.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-semibold">Take Test with Smart Tabs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open reference materials freely. In-app audit log transparently displays all searched queries and visits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-semibold">Instant Fair Certification</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated score computation with verifiable on-device integrity rating for examiners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (8 small cards, 4-6 words each) */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">Complete Proctoring Guard</h2>
          <p className="text-sm text-muted-foreground">Engineered for absolute assessment fairness.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Eye className="w-5 h-5 text-[#5B4BFF]" />, title: 'AI Proctoring', desc: 'On-device face & gaze analysis' },
            { icon: <Activity className="w-5 h-5 text-cyan-500]" />, title: 'Smart Tab Tracking', desc: 'Queries & URLs recorded openly' },
            { icon: <KeyRound className="w-5 h-5 text-magenta-brand" />, title: 'Face + OTP Login', desc: 'Instant biometric identity match' },
            { icon: <Lock className="w-5 h-5 text-[#5B4BFF]" />, title: 'Anti-Cheat Lockdown', desc: 'Single screen & shortcut guard' },
            { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, title: 'Auto Warnings', desc: 'Escalation with 3-chance quota' },
            { icon: <Clock className="w-5 h-5 text-emerald-500" />, title: 'Live Timer', desc: 'Instant auto-submit on expiry' },
            { icon: <WifiOff className="w-5 h-5 text-[#5B4BFF]" />, title: 'Offline Mode', desc: 'IndexedDB sync prevents loss' },
            { icon: <Layout className="w-5 h-5 text-cyan-500" />, title: 'Clean Test UI', desc: 'Zero distractions, focused layout' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all space-y-2"
            >
              <div className="p-2 rounded-lg bg-muted/50 w-fit">{item.icon}</div>
              <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* "Tabs Allowed, Nothing Hidden" Animated Demo */}
      <section id="activity-tracker" className="py-16 px-6 bg-muted/20 border-t border-border/60">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4">
            <span className="text-xs font-semibold text-[#5B4BFF] uppercase tracking-wider">
              Objective 6 Feature
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Tabs allowed, <br />
              <span className="text-gradient-trinetra">nothing hidden.</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Students do not need to be blocked from searching documentation. Every domain, duration, and search query is logged transparently to eliminate LLM cheating.
            </p>
            <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>On-device AI. You always see what is recorded.</span>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  Live Activity Tracker Panel
                </span>
                <span className="text-[11px] text-muted-foreground">Streaming Telemetry</span>
              </div>

              <div className="space-y-2">
                {demoTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all duration-300 ${
                      activeTabDemo === idx
                        ? 'border-primary bg-primary/5 shadow-xs scale-[1.01]'
                        : 'border-border/60 bg-muted/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-muted-foreground text-[11px]">{item.time}</span>
                      <span className="font-medium text-foreground">{item.event}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section with 3 OS cards */}
      <section id="download" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">Install Trinetra Desktop App</h2>
          <p className="text-sm text-muted-foreground">Built on Electron with hardware sandboxing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-center space-y-4">
            <Laptop className="w-8 h-8 text-[#5B4BFF] mx-auto" />
            <h3 className="text-lg font-bold font-heading">Windows</h3>
            <p className="text-xs text-muted-foreground">Windows 10 / 11 (64-bit installer & portable)</p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate('/system-check')}
            >
              <Download className="w-4 h-4" />
              Download .exe
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-center space-y-4">
            <Laptop className="w-8 h-8 text-cyan-500 mx-auto" />
            <h3 className="text-lg font-bold font-heading">macOS</h3>
            <p className="text-xs text-muted-foreground">Apple Silicon & Intel DMG package</p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate('/system-check')}
            >
              <Download className="w-4 h-4" />
              Download .dmg
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-center space-y-4">
            <Laptop className="w-8 h-8 text-magenta-brand mx-auto" />
            <h3 className="text-lg font-bold font-heading">Linux</h3>
            <p className="text-xs text-muted-foreground">Debian .deb & AppImage standalone</p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate('/system-check')}
            >
              <Download className="w-4 h-4" />
              Download .AppImage
            </Button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto py-8 border-t border-border/60 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <TrinetraLogo size="sm" />
          <p>© 2026 Trinetra Smart Proctoring System. Built for Secure Remote Evaluations.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/system-check')} className="hover:text-foreground">App Diagnostics</button>
            <button onClick={() => navigate('/login')} className="hover:text-foreground">Candidate Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
