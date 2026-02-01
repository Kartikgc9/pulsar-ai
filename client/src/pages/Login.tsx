/**
 * Login Page
 * Handles email/password and Google OAuth authentication
 * Apple iOS style - white glass cards, black text
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, Lock, User, Loader2, Music, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleSignIn from '@/components/GoogleSignIn';
import BokehBackground from '@/components/BokehBackground';
import { useAuth } from '@/contexts/AuthContext';
import { MouseTrail } from '@/components/framer';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signup, googleLogin, isAuthenticated } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/app');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name || undefined, phone || undefined);
      } else {
        await login(email, password);
      }
      // Redirect to app after successful auth
      setLocation('/app');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(token);
      setLocation('/app');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Bokeh Background */}
      <BokehBackground />

      {/* Main Content */}
      <div className="w-full max-w-md z-10 animate-slide-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg animate-glow-pulse">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl text-wing-display text-white mb-2">
            PULSAR AI
          </h1>
          <p className="text-white/80 text-wing-body">
            Music that feels your moment
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-strong p-8 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl text-wing-heading text-white mb-1">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-white/80 text-sm">
              {isSignup
                ? 'Sign up to discover personalized music'
                : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Google Sign-In */}
          <GoogleSignIn
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText={isSignup ? 'signup_with' : 'signin_with'}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/10 backdrop-blur-sm px-3 text-white/70">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
                  <Input
                    placeholder="Full Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl focus:border-black focus:bg-white transition-all"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
                  <Input
                    type="tel"
                    placeholder="Phone number for Telegram (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl focus:border-black focus:bg-white transition-all"
                  />
                  <p className="text-white/70 text-xs mt-1 ml-1">
                    Add your phone to link Telegram later
                  </p>
                </div>
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl focus:border-black focus:bg-white transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl focus:border-black focus:bg-white transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg btn-wing-accent !rounded-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-white/80 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-white hover:text-gray-700 font-medium transition-colors"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>

      {/* Mouse Trail Effect */}
      <MouseTrail
        variant="dots"
        trailColor="#000000"
        trailLength={12}
        dotSize={5}
        dotSpacing={15}
        fadeOut={true}
        autoFade={true}
        fadeDuration={1.5}
      />
    </div>
  );
}
