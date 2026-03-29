import { Link } from 'react-router-dom';
import { Search, Zap, Shield, Mail, Globe, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Deep Search',
      description: 'Find any business on Google Maps by keyword, location, or radius with exhaustive pagination.',
    },
    {
      icon: Mail,
      title: 'Email Discovery',
      description: 'Automatic website crawling to extract verified emails for direct outreach campaigns.',
    },
    {
      icon: Zap,
      title: 'Scoring Engine',
      description: 'Leads are automatically scored and categorized so you focus on the highest potential prospects.',
    },
    {
      icon: Shield,
      title: 'Anti-Block',
      description: 'Sophisticated human-like behavior, proxy rotation, and CAPTCHA solving for uninterrupted scraping.',
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-[60]">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-stitchbyte.png" alt="Stitchbyte Logo" className="h-10 w-auto" />
            {/* <h1 className="text-xl font-bold text-black tracking-tight">Stitchbyte</h1> */}
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors">Pricing</a>
            </div>
            {!loading && (
              <div className="flex items-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="btn-primary !px-6 !py-2.5 flex items-center gap-2">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-bold text-black hover:text-zinc-600 transition-colors">Sign In</Link>
                    <Link to="/register" className="btn-primary !px-6 !py-2.5">Get Started</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-black text-xs font-bold mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            AI-Powered Lead Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight max-w-4xl mx-auto leading-[1.05]">
            Extract premium leads from <span className="underline decoration-4 underline-offset-8">Google Maps</span> in seconds.
          </h1>
          <p className="mt-10 text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
            Search, enrich, score, and export. The most powerful automated lead generation engine built for agencies and sales teams.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="btn-primary !px-10 !py-4 !text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              {user ? 'Go to Dashboard' : 'Start Building Lists'} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary !px-10 !py-4 !text-lg w-full sm:w-auto justify-center">
              See How It Works
            </a>
          </div>
        </div>
      </header>

      {/* Social Proof Placeholder */}
      <section className="py-20 border-y border-zinc-100 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-10">Trusted by modern growth teams</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">METRIC</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">CLOUDCORE</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">FLOWSTATE</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">ZEPHYR</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight mb-6">Built for scale.</h2>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">Every tool you need to find and qualify business leads without the manual grunt work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-zinc-100 bg-white hover:border-black transition-all duration-300">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">{f.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-black text-white rounded-[3rem] mx-4 my-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 opacity-20 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-800 opacity-20 translate-y-1/2 -translate-x-1/2 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Simple, honest pricing.</h2>
            <p className="text-xl text-zinc-400 font-medium">Everything you need to grow, nothing you don't.</p>
          </div>

          <div className="max-w-sm mx-auto p-12 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro Access</h3>
              <p className="text-zinc-500 font-medium">Best for individuals and small agencies.</p>
            </div>
            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-5xl font-black">$49</span>
              <span className="text-zinc-500 font-bold">/ Month</span>
            </div>
            <ul className="space-y-4 mb-10">
              {['Unlimited Leads Search', 'Email Enrichment', 'Lead Scoring Engine', 'Export to CSV/Excel', 'Proxy Rotation'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-black stroke-[4px]" />
                  </div>
                  <span className="text-zinc-300 font-bold text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-stitchbyte.png" alt="Stitchbyte Logo" className="h-8 w-auto" />
              <h1 className="text-lg font-bold text-black tracking-tight">Stitchbyte</h1>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Modern Lead Generation System.</p>
          </div>
          <div className="flex items-center gap-10">
            <a href="#" className="text-sm font-bold text-zinc-500 hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-sm font-bold text-zinc-500 hover:text-black transition-colors">Terms</a>
            <a href="#" className="text-sm font-bold text-zinc-500 hover:text-black transition-colors">Contact</a>
          </div>
          <div className="text-zinc-400 text-sm font-bold">
            © 2026 Stitchbyte. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
