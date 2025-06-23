import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { googleLogin } from '../../api';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for Google OAuth authentication
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback function called after successful authentication
 * @param {Function} options.onError - Callback function called when an error occurs
 * @returns {Object} - Object containing authentication methods and state
 */
const useGoogleAuth = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [initState, setInitState] = useState({
    initialized: false,
    initError: null,
    clientId: null
  });
  const googleInitialized = useRef(false);

  // Load the Google OAuth script
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (window.google) {
        console.log('Google OAuth script already present in window object');
        setScriptLoaded(true);
        return;
      }

      console.log('Loading Google OAuth script...');

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-oauth-script';
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
      // Clean up Google OAuth resources
      console.log('Cleaning up Google OAuth resources');
      const script = document.getElementById('google-oauth-script');
      if (script) {
        document.head.removeChild(script);
        console.log('Removed Google OAuth script');
      }
      
      // Cancel any pending Google prompts
      if (window.google && window.google.accounts && window.google.accounts.id && typeof window.google.accounts.id.cancel === 'function') {
        try {
          window.google.accounts.id.cancel();
          console.log('Cancelled any pending Google OAuth prompts');
        } catch (error) {
          console.error('Error cancelling Google OAuth prompts:', error);
        }
      }
    };
  }, [onError]);

  // Initialize Google OAuth once script is loaded
  useEffect(() => {
    if (scriptLoaded && window.google && !googleInitialized.current) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      console.log('Attempting to initialize Google OAuth...');
      console.log('Using client ID:', clientId ? `${clientId.substring(0, 8)}...` : 'Not found!');
      
      if (!clientId) {
        const error = 'Google Client ID not found in environment variables';
        console.error(error);
        setInitState({
          initialized: false,
          initError: error,
          clientId: null
        });
        
        if (onError) {
          onError('Google authentication configuration is missing. Please contact support.');
        }
        return;
      }

      try {
        if (!window.google.accounts || !window.google.accounts.id) {
          throw new Error('Google accounts API not available');
        }
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true // Enable FedCM API
        });
        
        googleInitialized.current = true;
        setInitState({
          initialized: true,
          initError: null,
          clientId: clientId
        });
        
        console.log('Google OAuth initialized successfully');
      } catch (error) {
        const errorMsg = error.message || 'Unknown initialization error';
        console.error('Google OAuth initialization failed:', errorMsg, error);
        
        setInitState({
          initialized: false,
          initError: errorMsg,
          clientId: clientId
        });
        
        if (onError) {
          onError(`Failed to initialize Google authentication: ${errorMsg}`);
        }
      }
    }
  }, [scriptLoaded, onError]);

  /**
   * Handle Google authentication response
   * @param {Object} response - Response from Google OAuth
   */
  const handleGoogleResponse = async (response) => {
    console.group('Google OAuth Response Handler');
    console.log('Received Google OAuth response:', response ? 'Response object present' : 'No response');
    
    // Validate the response
    if (!response) {
      const errorMsg = 'Empty response received from Google';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      console.groupEnd();
      return;
    }
    
    // Log response properties for debugging
    console.log('Response properties:', Object.keys(response));
    
    // Check if credential exists
    if (!response.credential) {
      const errorMsg = 'No credential found in Google response';
      console.error(errorMsg, 'Response object:', response);
      if (onError) onError(errorMsg);
      console.groupEnd();
      return;
    }
    
    // Log credential details (safely)
    const credentialLength = response.credential.length;
    const credentialPrefix = response.credential.substring(0, 10);
    const credentialSuffix = response.credential.substring(credentialLength - 10);
    
    console.log('Google OAuth credential details:');
    console.log(`- Length: ${credentialLength} characters`);
    console.log(`- Format: ${credentialPrefix}...${credentialSuffix}`);
    
    // Validate credential format - it should be a JWT token (3 parts separated by dots)
    const parts = response.credential.split('.');
    if (parts.length !== 3) {
      const errorMsg = `Invalid credential format: expected JWT format (3 parts), got ${parts.length} parts`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      console.groupEnd();
      return;
    }
    
    console.log('Credential appears to be in valid JWT format');
    
    try {
      console.log('Sending credential to backend for verification...');
      
      // Track request timing for debugging
      const startTime = performance.now();
      let responseStatus = null;
      let responseData = null;
      
      try {
        const data = await googleLogin(response.credential);
        responseData = data;
        const endTime = performance.now();
        console.log(`Backend verification completed in ${Math.round(endTime - startTime)}ms`);
        console.log('Response data:', data ? 'Data received' : 'No data received');
        
        if (data) {
          console.log('Response fields:', Object.keys(data));
          console.log('Username:', data.username);
          console.log('Token present:', !!data.token);
        } else {
          console.warn('Received empty data from backend');
        }
        
        if (onSuccess) {
          onSuccess(data);
        } else {
          navigate('/dashboard');
        }
      } catch (networkError) {
        // Handle specific network errors
        const endTime = performance.now();
        console.error(`Backend request failed after ${Math.round(endTime - startTime)}ms`);
        
        if (networkError.name === 'TypeError' && networkError.message.includes('Failed to fetch')) {
          console.error('Network error - server unreachable:', networkError.message);
          if (onError) onError('Server unreachable. Please check your internet connection and try again.');
          console.groupEnd();
          return;
        }
        
        // Extract response status and details if available
        if (networkError.response) {
          responseStatus = networkError.response.status;
          console.error(`HTTP Error: ${responseStatus}`);
          
          try {
            const errorBody = await networkError.response.text();
            console.error('Error response body:', errorBody);
            
            try {
              // Try to parse as JSON if possible
              const jsonError = JSON.parse(errorBody);
              console.error('Parsed error details:', jsonError);
              
              if (jsonError.detail) {
                if (onError) onError(`Server error: ${jsonError.detail}`);
                console.groupEnd();
                return;
              }
            } catch (e) {
              // Not JSON, use as plain text
              console.log('Error response is not valid JSON');
            }
          } catch (e) {
            console.error('Could not read error response body');
          }
        }
        
        // Re-throw to be handled by the outer catch
        throw networkError;
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to authenticate with Google";
      console.error('Google login error:', errorMessage);
      
      // Detailed error inspection
      console.error('Error type:', error.constructor.name);
      console.error('Full error object:', error);
      
      // Log more details about the error
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      
      // Check for specific error types
      if (error.message && error.message.includes('token')) {
        console.error('Token-related error detected');
        if (onError) onError('Invalid authentication token. Please try again or use another sign-in method.');
      } else if (error.message && error.message.includes('network')) {
        console.error('Network error detected');
        if (onError) onError('Network error during authentication. Please check your connection and try again.');
      } else {
        if (onError) onError(`Authentication failed: ${errorMessage}. Please try again.`);
      }
    } finally {
      console.groupEnd();
    }
  };

  /**
   * Trigger Google login prompt
   */
  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    console.log('Auth state:', {
      scriptLoaded,
      scriptError,
      initialized: initState.initialized,
      initError: initState.initError
    });
    
    // Check for script loading errors
    if (scriptError) {
      const errorMsg = `Google OAuth script error: ${scriptError}`;
      console.error(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }
    
    // Check if script is still loading
    if (!scriptLoaded) {
      const errorMsg = "Google authentication is still loading. Please wait a moment and try again.";
      console.log(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }
    
    // Check for initialization errors
    if (initState.initError) {
      const errorMsg = `Google OAuth initialization error: ${initState.initError}`;
      console.error(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }
    
    // Check if Google is available and properly initialized
    if (window.google && window.google.accounts && window.google.accounts.id && initState.initialized) {
      try {
        console.log('Showing Google authentication prompt using FedCM...');
        
        // Use the FedCM-compatible prompt method without the notification callback
        window.google.accounts.id.prompt();
        
      } catch (error) {
        const errorMsg = error.message || "Unknown error displaying Google prompt";
        console.error('Google Sign-In prompt error:', errorMsg, error);
        if (onError) {
          onError(`Something went wrong with Google authentication: ${errorMsg}. Please try again.`);
        }
      }
    } else {
      const errorMsg = "Google OAuth not properly initialized. Please refresh and try again.";
      console.error(errorMsg, { 
        googleExists: !!window.google,
        accountsExists: !!(window.google && window.google.accounts),
        idExists: !!(window.google && window.google.accounts && window.google.accounts.id),
        initialized: initState.initialized
      });
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  /**
   * Render a Google Sign-In button
   * @param {string} buttonText - Text to display on the button
   * @param {string} className - CSS class name for styling
   * @param {Object} props - Additional props to pass to the button
   * @returns {Function} - Render function that returns JSX for the button
   */
  const renderGoogleButton = (buttonText = "Sign in with Google", className = "", props = {}) => {
    return (
      <button 
        className={`google-login-button ${className}`}
        onClick={handleGoogleLogin}
        disabled={!scriptLoaded || scriptError}
        {...props}
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
    isLoaded: scriptLoaded && initState.initialized,
    hasError: !!(scriptError || initState.initError),
    errorMessage: scriptError || initState.initError,
    authState: {
      scriptLoaded,
      initialized: initState.initialized,
      clientId: initState.clientId ? `${initState.clientId.substring(0, 8)}...` : null
    }
  };
};

export default useGoogleAuth;
