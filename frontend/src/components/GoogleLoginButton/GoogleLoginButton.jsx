import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import { googleLogin } from '../../api';
import { useNavigate } from 'react-router-dom';
import './GoogleLoginButton.scss';

const GoogleLoginButton = ({ onSuccess, onError, buttonText = "Sign in with Google" }) => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    try {
      // Get the access token from the response
      const accessToken = tokenResponse.access_token;
      
      // Call our backend API with the token
      const data = await googleLogin(accessToken);
      
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Default behavior: navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) {
        onError(error.message);
      }
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: (error) => {
      console.error('Google login error:', error);
      if (onError) {
        onError('Google login failed. Please try again.');
      }
    },
    flow: 'implicit',
  });

  return (
    <Button 
      variant="light" 
      className="google-login-button" 
      onClick={() => login()}
    >
      <FcGoogle size={20} className="google-icon" />
      <span>{buttonText}</span>
    </Button>
  );
};

export default GoogleLoginButton;