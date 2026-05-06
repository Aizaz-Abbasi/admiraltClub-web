import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginApi, signupApi } from './api/auth';
import { AUTH_TOKEN_STORAGE_KEY, getApiErrorMessage } from './api/client';

export interface AuthUser {
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'GUEST';
}

export interface AuthPayload {
  mode: 'login' | 'signup';
  name?: string;
  email: string;
  password: string;
}

const AUTH_STORAGE_KEY = 'admiralty.auth.user';
const AUTH_QUERY_KEY = ['auth', 'user'] as const;
interface AuthSession {
  user: AuthUser;
  token?: string;
}

export function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function setStoredUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function setStoredToken(token?: string) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

function persistAuthSession(session: AuthSession) {
  setStoredUser(session.user);
  setStoredToken(session.token);
}

function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

function parseRole(raw?: string): AuthUser['role'] {
  if (raw === 'ADMIN' || raw === 'GUEST') return raw;
  return 'MEMBER';
}

async function login(payload: AuthPayload): Promise<AuthSession> {
  const response = await loginApi({
    email: payload.email.trim(),
    password: payload.password,
  });

  const user: AuthUser = {
    name:
      response.user?.name ||
      response.name ||
      payload.name?.trim() ||
      payload.email.split('@')[0] ||
      'Member',
    email: response.user?.email || response.email || payload.email.trim(),
    role: parseRole(response.user?.role ?? response.role),
  };

  return { user, token: response.token };
}

async function signup(payload: AuthPayload): Promise<AuthSession> {
  const response = await signupApi({
    name: payload.name?.trim(),
    email: payload.email.trim(),
    password: payload.password,
  });

  const user: AuthUser = {
    name: response.user?.name || response.name || payload.name?.trim() || 'Member',
    email: response.user?.email || response.email || payload.email.trim(),
    role: parseRole(response.user?.role ?? response.role),
  };

  return { user, token: response.token };
}

export function primeAuthCache(queryClient: QueryClient) {
  queryClient.setQueryData(AUTH_QUERY_KEY, getStoredUser());
}

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => getStoredUser(),
    initialData: getStoredUser,
    staleTime: Infinity,
  });
}


export function useAuthActions() {
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (payload: AuthPayload) => {
      try {
        return payload.mode === 'login' ? await login(payload) : await signup(payload);
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      }
    },
    onSuccess: (session) => {
      persistAuthSession(session);
      queryClient.setQueryData(AUTH_QUERY_KEY, session.user);
    },
  });

  

  const logout = () => {
    clearStoredUser();
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
  };

  return {
    authMutation,
    logout,
  };
}
