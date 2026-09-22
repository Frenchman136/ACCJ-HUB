import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API = import.meta.env.VITE_API_URL || '/api';

/** Tiny data-fetching hook: returns an authenticated request function. */
export function useApi() {
  const { getToken, isSignedIn } = useAuth();

  const request = async (path, { method = 'GET', data, params, headers } = {}) => {
    const token = isSignedIn ? await getToken() : null;
    const res = await axios({
      url: `${API}${path}`,
      method,
      data,
      params,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
        ...headers,
      },
    });
    return res.data;
  };

  return { request };
}

/** Parse a Clerk API error into a friendly message. */
export const errMsg = (err) =>
  err?.response?.data?.error || err?.message || 'Something went wrong';
