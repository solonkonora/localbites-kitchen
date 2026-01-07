'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback - extract token from URL
    const authStatus = searchParams.get('auth');
    const token = searchParams.get('token');

    if (authStatus === 'success' && token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Remove token from URL for security
      window.history.replaceState({}, '', '/');
      
      // Reload to trigger auth context to fetch user
      window.location.reload();
    }
  }, [searchParams]);

  return null;
}
