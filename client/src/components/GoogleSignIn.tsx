/**
 * Google Sign-In Button Component
 * Uses Google Identity Services for OAuth
 */

import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '@/contexts/AuthContext';

interface GoogleSignInProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  buttonText?: 'signin_with' | 'signup_with' | 'continue_with';
}

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; error?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: string | number;
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({
  onSuccess,
  onError,
  buttonText = 'continue_with'
}: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !buttonRef.current || initialized.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 350,
          text: buttonText,
          shape: 'rectangular',
          logo_alignment: 'left',
        });

        initialized.current = true;
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err);
        onError?.('Failed to initialize Google Sign-In');
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google) {
          onError?.('Google Sign-In failed to load. Please refresh the page.');
        }
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, [onError, buttonText]);

  const handleCredentialResponse = (response: { credential?: string; error?: string }) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError?.(response.error || 'Google sign-in was cancelled');
    }
  };

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} className="google-signin-button" />
    </div>
  );
}
