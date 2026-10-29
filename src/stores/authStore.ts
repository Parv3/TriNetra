import { getOrCreateBackendSession } from '@/services/api/realApi';
import { create } from 'zustand';
import { User, SessionStatus } from '@/types/api';
import { mockApi } from '@/services/api/mockApi';
import { auth, googleProvider } from '@/services/firebase';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  session: SessionStatus | null;
  email: string;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  isFaceVerified: boolean;
  isLoading: boolean;
  error: string | null;
  activeSessionConflict: boolean;
  deviceId: string;

  setEmail: (email: string) => void;
  sendOtp: () => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  verifyFace: (imageDataUri: string) => Promise<boolean>;
  logout: () => void;
  resetError: () => void;
}

const getInitialSession = (deviceId: string): SessionStatus => {
  let sessId = localStorage.getItem('spb_session_id');
  if (!sessId) {
    sessId = `TRN-SESS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    localStorage.setItem('spb_session_id', sessId);
  }
  return {
    sessionId: sessId,
    userId: 'usr_candidate_01',
    isActive: true,
    activeDeviceId: deviceId,
    lastHeartbeat: new Date().toISOString(),
  };
};

const getDeviceId = (): string => {
  let id = localStorage.getItem('spb_device_id');
  if (!id) {
    id = `dev_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('spb_device_id', id);
  }
  return id;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: getInitialSession(getDeviceId()),
  email: '',
  isOtpSent: false,
  isOtpVerified: false,
  isFaceVerified: false,
  isLoading: false,
  error: null,
  activeSessionConflict: false,
  deviceId: getDeviceId(),

  setEmail: (email: string) => set({ email, error: null }),

  sendOtp: async () => {
    const { email } = get();
    set({ isLoading: true, error: null });
    try {
      const res = await mockApi.sendOtp(email);
      if (res.success) {
        set({ isOtpSent: true, isLoading: false });
        return true;
      } else {
        set({ error: res.message, isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to send OTP', isLoading: false });
      return false;
    }
  },

  verifyOtp: async (otp: string) => {
    const { email, deviceId } = get();
    set({ isLoading: true, error: null, activeSessionConflict: false });
    try {
      const res = await mockApi.verifyOtp(email, otp);
      if (res.success && res.user) {
        const backendSess = await getOrCreateBackendSession(res.user.name, res.user.id);
        const sessionRes = { success: true, session: { sessionId: backendSess.id, userId: res.user.id, isActive: true, activeDeviceId: deviceId, lastHeartbeat: new Date().toISOString() } };
        if (!sessionRes.success) {
          set({
            user: res.user,
            activeSessionConflict: true,
            error: 'Active session conflict',
            isLoading: false,
          });
          return false;
        }

        set({
          user: res.user,
          session: sessionRes.session || getInitialSession(deviceId),
          isOtpVerified: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: res.message, isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to verify OTP', isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async () => {
    const { deviceId } = get();
    set({ isLoading: true, error: null, activeSessionConflict: false });
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const user: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0].toUpperCase() : 'Candidate'),
        registeredPhotoUrl:
          fbUser.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        role:
          fbUser.email?.includes('admin') || fbUser.email?.includes('examiner')
            ? 'examiner'
            : 'student',
      };

      const backendSess = await getOrCreateBackendSession(user.name, user.id);
      const sessionRes = { success: true, session: { sessionId: backendSess.id, userId: user.id, isActive: true, activeDeviceId: deviceId, lastHeartbeat: new Date().toISOString() } };
      if (!sessionRes.success) {
        set({
          user,
          activeSessionConflict: true,
          error: 'Active session conflict',
          isLoading: false,
        });
        return false;
      }

      set({
        user,
        session: sessionRes.session,
        email: user.email,
        isOtpVerified: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Google authentication failed', isLoading: false });
      return false;
    }
  },

  verifyFace: async (imageDataUri: string) => {
    const { user } = get();
    if (!user) return false;
    set({ isLoading: true, error: null });
    try {
      const res = await mockApi.verifyFace(user.id, imageDataUri);
      if (res.verified) {
        set({ isFaceVerified: true, isLoading: false });
        return true;
      } else {
        set({ error: res.message, isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Face verification failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    fbSignOut(auth).catch(() => {});
    set({
      user: null,
      session: null,
      email: '',
      isOtpSent: false,
      isOtpVerified: false,
      isFaceVerified: false,
      activeSessionConflict: false,
      error: null,
    });
  },

  resetError: () => set({ error: null }),
}));
