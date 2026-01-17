/**
 * Login Page
 * Handles email/password and Google OAuth authentication
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, Lock, User, Loader2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GoogleSignIn from '@/components/GoogleSignIn';
import VideoBackground from '@/components/VideoBackground';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signup, googleLogin, isAuthenticated } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/onboarding');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name || undefined);
      } else {
        await login(email, password);
      }
      // Redirect to onboarding after successful auth
      setLocation('/onboarding');
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
      setLocation('/onboarding');
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
      {/* Video Background */}
      <VideoBackground opacity={0.25} overlay={true} />

      <Card className="w-full max-w-md z-10 border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-white/60 mt-2">
            {isSignup
              ? 'Sign up to discover music that matches your moments'
              : 'Sign in to continue your musical journey'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
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
              <span className="bg-black/50 backdrop-blur px-3 text-white/50">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  placeholder="Full Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-900/30 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>{isSignup ? 'Create Account' : 'Sign In'}</>
              )}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-white/50 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
