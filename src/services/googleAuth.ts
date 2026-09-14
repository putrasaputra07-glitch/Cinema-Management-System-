import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// All Google Drive scopes configured for the app
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token storage (do NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleAuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Global listeners list for auth token changes
type AuthListener = (state: GoogleAuthState) => void;
const listeners = new Set<AuthListener>();

const notifyListeners = (state: GoogleAuthState) => {
  listeners.forEach((listener) => listener(state));
};

// Initialize auth state listener. Call this on app load or hook.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        notifyListeners({
          user,
          accessToken: cachedAccessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (!isSigningIn) {
        // If user is logged into firebase but token expired/lost on reload, prompt reconnect
        if (onAuthFailure) onAuthFailure();
        notifyListeners({
          user,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
      notifyListeners({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
};

export const subscribeGoogleAuth = (listener: AuthListener) => {
  listeners.add(listener);
  // Emit current state immediately
  listener({
    user: auth.currentUser,
    accessToken: cachedAccessToken,
    isAuthenticated: !!(auth.currentUser && cachedAccessToken),
    isLoading: false,
  });
  return () => {
    listeners.delete(listener);
  };
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Google OAuth access token dari Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    const authPayload = {
      user: result.user,
      accessToken: cachedAccessToken,
      isAuthenticated: true,
      isLoading: false,
    };
    notifyListeners(authPayload);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  notifyListeners({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  });
};
