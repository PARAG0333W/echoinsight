import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Menu, X, Upload, Play, CheckCircle, TrendingUp, Shield,
  BarChart3, MessageSquare, AlertTriangle, Lightbulb,
  ArrowRight, Users, Zap,
  Phone, Mail, MapPin, Twitter, Linkedin, Github,
  Activity
} from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <Navbar isScrolled={isScrolled} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Hero Section */}
      <HeroSection />

      {/* Trust Section */}
      <TrustSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Product Preview */}
      <ProductPreviewSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Navbar Component
const Navbar = ({ isScrolled, mobileMenuOpen, setMobileMenuOpen }: any) => {
  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-gray-900">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">EchoInsight AI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 text-sm">
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white border-b border-gray-100 shadow-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-8 flex flex-col space-y-6">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-800 hover:text-blue-600">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-800 hover:text-blue-600">How It Works</a>
            <Link to="/login" className="text-lg font-bold text-gray-800 hover:text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-4 rounded-xl text-center font-bold text-lg shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="pt-40 pb-20 px-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl opacity-60 rounded-full" />
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
              Transform Conversations into <span className="text-blue-600 bg-clip-text">Actionable</span> Insights
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              EchoInsight AI leverages advanced NLP to identify communication gaps, score agent performance, and boost customer satisfaction in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/app/upload" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center group active:scale-95">
                <Upload className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Upload Conversation
              </Link>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center active:scale-95">
                <Play className="w-5 h-5 mr-3 text-blue-600" />
                View Demo
              </button>
            </div>
            <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start text-sm font-semibold text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200`} />
                ))}
              </div>
              <span>Trusted by 500+ teams worldwide</span>
            </div>
          </motion.div>

          <motion.div
            className="relative lg:ml-10"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-gray-100 p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performance Snapshot</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time analysis</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3 h-3" />
                  <span>LIVE</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Communication Score</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 italic">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-blue-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '87%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Customer Satisfaction</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 italic">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 group hover:border-red-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Issues Flagged</span>
                    </div>
                    <span className="text-sm font-black text-rose-600 italic">3 Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-bold border border-red-100">Interruption</span>
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold border border-amber-100">Tone Shift</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold border border-blue-100">Low Clarity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-6 -left-6 w-full h-full bg-blue-600/5 rounded-3xl -z-10 translate-x-4 translate-y-4" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Trust Section
const TrustSection = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto border-y border-gray-100 py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Trusted by modern support organizations</p>
          <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-12 grayscale opacity-40 hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos with actual text for realism */}
            <div className="text-2xl font-black text-gray-700 hover:text-blue-600 transition-colors">ZENITH</div>
            <div className="text-2xl font-black text-gray-700 hover:text-indigo-600 transition-colors">LUMINA</div>
            <div className="text-2xl font-black text-gray-700 hover:text-sky-600 transition-colors">CORE</div>
            <div className="text-2xl font-black text-gray-700 hover:text-rose-600 transition-colors">ORBIT</div>
            <div className="text-2xl font-black text-gray-700 hover:text-emerald-600 transition-colors">APEX</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "AI Analysis Scoring",
      description: "Evaluate agent performance with precise metrics for empathy, professionalism, and clarity."
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Mistake Intelligence",
      description: "Detect interruptions, short responses, and poor tone shifts automatically."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Smart Suggestions",
      description: "Get AI-generated alternatives for mistakes to help coach your team effectively."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance & Risk",
      description: "Identify high-risk cases or churn indicators before they escalate."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Unified Dashboard",
      description: "Track performance across all conversations from a single, intuitive interface."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Growth Metrics",
      description: "Monitor improvement trends and agent development over time with deep analytics."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">Enterprise Features</div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Intelligence Designed for Results</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every customer interaction is a data point. Our AI extracts meaningful value so you can focus on scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Audio",
      description: "Drop your call recordings or customer transcripts directly into the platform."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Analysis",
      description: "Advanced NLP processes every turn to detect sentiment, tone, and performance."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Detailed Report",
      description: "Instantly receive a comprehensive breakdown with scoring and coachable insights."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-4">The Workflow</div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Zero Setup, Instant Insights</h2>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Get comprehensive call center analytics without complex integrations or manual coding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative group mb-8 inline-block">
                <div className="w-20 h-20 bg-white border border-gray-100 shadow-xl rounded-3xl flex items-center justify-center text-blue-600 z-10 relative group-hover:rotate-6 transition-transform">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30">
                  {index + 1}
                </div>
                <div className="absolute inset-0 bg-blue-600/5 blur-xl group-hover:bg-blue-600/10 transition-colors rounded-full -z-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed px-4">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Product Preview Section
const ProductPreviewSection = () => {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0a0f1d] rounded-[40px] p-8 md:p-16 shadow-3xl shadow-blue-900/40 relative">
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-6">
                Interactive Analysis
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight italic">
                A UI Designed for <span className="text-indigo-400">Deep Work</span>
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'Agent Tone', val: 'Friendly', color: 'text-emerald-400' },
                  { label: 'Empathy Score', val: 'High', color: 'text-blue-400' },
                  { label: 'Risk Factor', val: 'Minimal', color: 'text-sky-400' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] w-24">{item.label}</span>
                    <span className={`text-sm font-black italic ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <Link to="/register" className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black italic shadow-xl hover:scale-105 transition-transform active:scale-95">
                  START FREE TRIAL
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-400 font-black">A</div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex-1 shadow-sm">
                    <p className="text-[11px] text-white/80 leading-relaxed italic">"I'm sorry to hear that you are having issues with your shipment..."</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-10">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20">Empathy</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black tracking-widest uppercase border border-indigo-500/20">Polite</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-black">C</div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex-1 shadow-sm text-right">
                    <p className="text-[11px] text-white/80 leading-relaxed italic">"Thank you, I just need it by tomorrow."</p>
                  </div>
                </div>
                <div className="flex gap-2 mr-10 flex-row-reverse">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20">Positive</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Conversation Risk</span>
                  <span className="text-[11px] font-black text-emerald-400 italic">LOW</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Coach Better",
      description: "Provide agents with objective, data-driven feedback instead of anecdotal samples."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Save Time",
      description: "Automate hours of manual quality reviews every day with instant AI processing."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Drastically Improve CSAT",
      description: "Directly link communication improvements to higher customer satisfaction scores."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Scalable Quality",
      description: "Maintain high standards across distributed teams and high-volume environments."
    }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter leading-tight uppercase italic">
              Built for <span className="text-blue-600 underline decoration-indigo-200">Growth-Minded</span> Support Leaders
            </h2>
            <p className="text-lg text-gray-500 font-medium mb-12 max-w-xl italic">"EchoInsight changed how we coach our agents. We saw a 22% increase in resolution scores within the first month alone."</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div>
                <h4 className="font-black text-gray-900 text-sm italic uppercase tracking-widest">Sarah Jenkins</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Head of Operations, Zenith Global</p>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{benefit.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-50/50 -z-10" />
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight uppercase italic">
            Analyze Better, <span className="text-blue-300">Coach Smarter.</span>
          </h2>
          <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto font-medium italic">
            Join the elite teams of modern call centers using EchoInsight to redefine quality assurance and agent development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-black italic shadow-2xl hover:scale-105 hover:bg-white/95 transition-all flex items-center justify-center group">
              GET STARTED NOW
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="bg-blue-800/40 text-white border border-white/10 backdrop-blur-md px-10 py-5 rounded-2xl font-black italic hover:bg-blue-800/60 transition-all flex items-center justify-center">
              CONTACT SALES
            </button>
          </div>
          <p className="text-blue-200/50 mt-8 text-xs font-bold uppercase tracking-[0.3em]">No credit card required • Unlimited Trial period</p>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="py-20 px-6 bg-[#0a0f1d] text-gray-400 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-white/5" />
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">EchoInsight</span>
            </div>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-xs">
              Next-generation intelligence for modern call center quality and agent performance tracking.
            </p>
            <div className="flex space-x-5 px-1 pt-2">
              <a href="#" className="text-gray-600 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 italic">Product</h3>
            <ul className="space-y-4 text-[13px] font-medium">
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Analysis</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Smart Scoring</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Risk Detection</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 italic">Company</h3>
            <ul className="space-y-4 text-[13px] font-medium">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 italic">Support</h3>
            <div className="space-y-4 text-[13px] font-medium">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-600" />
                <span>hello@echoinsight.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-600" />
                <span>+1 (555) 902-1234</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span>Palo Alto, CA 94301</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} EchoInsight AI Intelligence. All rights reserved.
          </p>
          <div className="flex gap-10 text-[10px] font-black text-gray-600 uppercase tracking-widest italic">
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
