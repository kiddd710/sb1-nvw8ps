import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogin, msalInstance } from '../lib/auth';
import { useAuthStore } from '../stores/authStore';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Check for existing accounts
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      handleLogin()
        .then((authResult) => {
          setAuth(authResult);
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Silent login failed:', error);
        });
    }
  }, [isAuthenticated, navigate, setAuth]);

  const login = async () => {
    try {
      const authResult = await handleLogin();
      if (authResult) {
        setAuth(authResult);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Show error message to user
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogIn className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Project Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in with your organization account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={login}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}