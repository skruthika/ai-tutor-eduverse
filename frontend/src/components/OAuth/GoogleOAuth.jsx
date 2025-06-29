import React, { useEffect, useState } from 'react';
import { googleLogin } from '../../api';
import { useNavigate } from 'react-router-dom';

const GoogleOAuth = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);

  // Load the Google OAuth script
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (window.google) {
        setScriptLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
        console.log('Google OAuth script loaded successfully');
      };
      script.onerror = (error) => {
        setScriptError('Failed to load Google OAuth script');
        console.error('Google OAuth script loading failed:', error);
        if (onError) {
          onError('Failed to load Google authentication. Please check your internet connection and try again.');
        }
      };

      // Add script to document
      document.head.appendChild(script);
    };

    loadGoogleScript();

    // Clean up function
    return () => {
      // Optional: Remove the script when component unmounts
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [onError]);

  // Initialize Google OAuth once script is loaded
  useEffect(() => {
    if (scriptLoaded && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id",
          callback: handleGoogleResponse,
        });
        console.log('Google OAuth initialized successfully');
      } catch (error) {
        console.error('Google OAuth initialization failed:', error);
        if (onError) {
          onError('Failed to initialize Google authentication. Please try again later.');
        }
      }
    }
  }, [scriptLoaded]);

  const handleGoogleResponse = async (response) => {
    try {
      const data = await googleLogin(response.credential);
      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (onError) {
        onError(error.message);
      }
    }
  };
  // Render Google Sign-In button or handle prompt
  const handleGoogleLogin = () => {
    if (scriptError) {
      if (onError) {
        onError(scriptError);
      }
      return;
    }
    
    if (!scriptLoaded) {
      if (onError) {
        onError("Google authentication is still loading. Please wait a moment and try again.");
      }
      return;
    }
    
    if (window.google) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Google Sign-In prompt error:', error);
        if (onError) {
          onError("Something went wrong with Google authentication. Please try again.");
        }
      }
    } else {
      if (onError) {
        onError("Google OAuth not loaded properly. Please refresh and try again.");
      }
    }
  };

  // Render a custom Google Sign-In button
  const renderGoogleButton = (buttonText = "Sign in with Google", className = "") => {
    return (
      <button 
        className={`google-login-button ${className}`}
        onClick={handleGoogleLogin}
        disabled={!scriptLoaded || scriptError}
      >
        {scriptError ? "Google Sign-In Unavailable" : 
         !scriptLoaded ? "Loading Google Sign-In..." : 
         buttonText}
      </button>
    );
  };

  return { 
    handleGoogleLogin,
    renderGoogleButton,
    isLoaded: scriptLoaded,
    hasError: !!scriptError,
    errorMessage: scriptError
  };
};

export default GoogleOAuth;
