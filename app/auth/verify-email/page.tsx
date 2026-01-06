'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';

// Force dynamic rendering to prevent prerendering issues because this page depends on the per-request `token` query param
export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already-verified'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided');
        return;
      }

      try {
        const data = await api.verifyEmail(token);

        // Store token for authenticated requests
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error: unknown) {
        const err = error as { response?: { error?: string; alreadyVerified?: boolean; expired?: boolean; email?: string } };

        if (err.response?.alreadyVerified) {
          setStatus('already-verified');
        } else {
          setStatus('error');
          setErrorMessage(
            err.response?.error ||
            'Failed to verify email. The link may have expired or is invalid.'
          );
          if (err.response?.email) {
            setEmail(err.response.email);
          }
        }
      }
    };

    verify();
  }, [router]);

  const handleResendVerification = async () => {
    if (!email) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      const data = await api.resendVerification(email);
      setResendMessage(data.message);
    } catch (error: unknown) {
      const err = error as { response?: { error?: string } };
      setResendMessage(err.response?.error || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait a moment</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">Your account has been successfully verified</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === 'already-verified' && (
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Verified</h2>
            <p className="text-gray-600 mb-6">Your email is already verified. You can log in now!</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>

            {email && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Need a new verification link?</p>
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {resendMessage && (
                  <p className="mt-3 text-sm text-gray-600">{resendMessage}</p>
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/login')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
