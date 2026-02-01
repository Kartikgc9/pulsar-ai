/**
 * Landing Page
 * Apple iOS style - Pure white background with black text
 * Features: Hero, How It Works, Features, CTA sections
 */

import { useLocation } from "wouter";
import { Music, Upload, Sparkles, Headphones, Brain, MessageCircle, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import BokehBackground from "@/components/BokehBackground";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { TelegramIcon } from "@/components/TelegramButton";
import { MouseTrail, GlassyButton } from "@/components/framer";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const isProfileComplete = localStorage.getItem("pulsar_profile_complete");
    if (isProfileComplete === "true") {
      setLocation("/app");
    } else {
      setLocation("/onboarding");
    }
    return null;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Layer */}
      <BokehBackground interactive={true} />

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">PULSAR</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Features
            </button>
          </div>

          {/* CTA */}
          <Button
            onClick={() => setLocation("/login")}
            className="btn-wing-primary !rounded-full !px-6 !py-2 text-sm"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* ============================================
         * HERO SECTION
         * ============================================ */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 !rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Music Discovery</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl text-wing-display text-white mb-6"
            >
              Music That{" "}
              <span className="text-gradient-wing">Feels</span>
              <br />
              Your Moment
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/80 text-wing-body max-w-2xl mx-auto mb-10"
            >
              Upload any image and discover music that perfectly matches its mood,
              colors, and vibe. Powered by AI that understands visual emotions.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => setLocation("/login")}
                className="btn-wing-accent !rounded-full !px-8 !py-6 text-lg group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => scrollToSection("how-it-works")}
                className="btn-wing-secondary !rounded-full !px-8 !py-6 text-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                See How It Works
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: "420K+", label: "Music Tracks" },
                { value: "13K+", label: "Images Analyzed" },
                { value: "100%", label: "Free" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl text-wing-display text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================
         * HOW IT WORKS SECTION
         * ============================================ */}
        <section id="how-it-works" className="min-h-screen flex items-center py-20 px-4">
          <div className="max-w-6xl mx-auto w-full">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-wing-display text-white mb-4">
                How It Works
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto">
                Three simple steps to discover your perfect soundtrack
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Upload,
                  step: "01",
                  title: "Upload Your Moment",
                  description: "Share any image - a photo, screenshot, artwork, or scenery. Our AI works with any visual content.",
                  color: "from-gray-700 to-gray-900",
                },
                {
                  icon: Brain,
                  step: "02",
                  title: "AI Analyzes Mood",
                  description: "Our vision AI detects colors, emotions, scenes, and vibes using advanced CLIP technology.",
                  color: "from-gray-600 to-gray-800",
                },
                {
                  icon: Headphones,
                  step: "03",
                  title: "Discover Music",
                  description: "Get personalized recommendations from 420K+ tracks that match your image's emotional signature.",
                  color: "from-gray-500 to-gray-700",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="glass-strong p-8 relative group hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Step Number */}
                  <div className="absolute top-6 right-6 text-5xl font-black text-white/50 group-hover:text-white/60 transition-colors">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-wing-heading text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/80 text-wing-body">
                    {step.description}
                  </p>

                  {/* Connector Line (hidden on mobile) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
         * FEATURES SECTION
         * ============================================ */}
        <section id="features" className="min-h-screen flex items-center py-20 px-4">
          <div className="max-w-6xl mx-auto w-full">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl text-wing-display text-white mb-4">
                Why Pulsar AI?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto">
                Advanced features that make music discovery magical
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Personalized Learning",
                  description: "The more you use Pulsar, the better it understands your taste. Our AI learns from your likes to give even better recommendations.",
                },
                {
                  icon: Brain,
                  title: "Multi-Modal AI",
                  description: "We combine computer vision (CLIP), natural language processing (SBERT), and audio analysis to understand music at a deeper level.",
                },
                {
                  icon: MessageCircle,
                  title: "Telegram Integration",
                  description: "Get recommendations on the go! Send images directly to our Telegram bot and receive music suggestions instantly.",
                },
                {
                  icon: Music,
                  title: "Explainable Results",
                  description: "Understand why each song was recommended. See the mood match, lyric relevance, and how it connects to your image.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="glass p-8 group hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-wing-heading text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-wing-body">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
         * TELEGRAM CTA SECTION
         * ============================================ */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-strong p-10 md:p-16 text-center relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#0088cc]/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gray-500/10 blur-3xl" />

              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0088cc 0%, #00a8e8 100%)" }}
                >
                  <TelegramIcon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl md:text-4xl text-wing-display text-white mb-4">
                  Try It On Telegram
                </h2>
                <p className="text-white/80 text-lg max-w-lg mx-auto mb-8">
                  No signup needed to try! Open our Telegram bot, share your phone number,
                  and start getting music recommendations instantly.
                </p>

                <Button
                  onClick={() => window.open("https://t.me/mussiyiy010_bot", "_blank")}
                  className="!rounded-full !px-8 !py-6 text-lg font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #0088cc 0%, #00a8e8 100%)" }}
                >
                  <TelegramIcon className="w-5 h-5 mr-2" />
                  Open Telegram Bot
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
         * FINAL CTA SECTION
         * ============================================ */}
        <section className="min-h-[60vh] flex items-center justify-center py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-6xl text-wing-display text-white mb-6">
                Ready to Discover Your
                <br />
                <span className="text-gradient-wing">Soundtrack?</span>
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of music lovers who use Pulsar AI to find the perfect
                music for every moment. It's free to start.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => setLocation("/login")}
                  className="btn-wing-accent !rounded-full !px-10 !py-6 text-lg group"
                >
                  Start Free Now
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
         * FOOTER
         * ============================================ */}
        <footer className="py-10 px-4 border-t border-white/20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/80 text-sm">
                Pulsar AI - Music that feels your moment
              </span>
            </div>
            <div className="text-white/70 text-sm">
              Built with AI, powered by open-source technology
            </div>
          </div>
        </footer>
      </div>

      {/* Mouse Trail Effect */}
      <MouseTrail
        variant="line"
        trailColor="#000000"
        trailColorEnd="#666666"
        fillType="gradient"
        trailLength={25}
        lineWidth={2}
        fadeOut={true}
        autoFade={true}
        fadeDuration={2}
        smoothing={0.4}
      />
    </div>
  );
}
