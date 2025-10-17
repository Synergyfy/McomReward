import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoginCredentials, LoginResponse } from '@/types/auth';
import Cookies from 'js-cookie';

export const useLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<LoginResponse>('/admin/login', credentials);
      Cookies.set('accessToken', response.data.accessToken);
      router.push('/admin/dashboard');
      if (onSuccess) {
        onSuccess();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
