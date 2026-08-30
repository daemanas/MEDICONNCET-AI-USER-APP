import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {bootstrapSession, logout as logoutService, saveLocation, saveProfile} from '../auth/authService';
import {startSyncListener, runSync} from '../sync/syncService';
import {userApi} from '../api/userApi';

const SessionContext = createContext(null);

export function SessionProvider({children}) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unread, setUnread] = useState(0);

  const refreshMe = useCallback(async () => {
    const next = await userApi.me();
    setProfile(next);
    return next;
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await userApi.notifications();
      setUnread(data.unread || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const boot = await bootstrapSession();
      if (!alive) {
        return;
      }
      if (boot.ok) {
        setProfile(boot.profile);
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    startSyncListener(() => profile?.patient);
    if (profile?.patient) {
      runSync({patient: profile.patient}).catch(() => {});
      refreshUnread();
    }
  }, [profile, refreshUnread]);

  const value = useMemo(
    () => ({
      ready,
      profile,
      user: profile?.user,
      patient: profile?.patient,
      signedIn: !!profile?.user,
      unread,
      setProfile,
      refreshMe,
      refreshUnread,
      updateProfile: async body => {
        const next = await saveProfile(body);
        setProfile(next);
        return next;
      },
      updateLocation: async body => {
        const next = await saveLocation(body);
        setProfile(next);
        return next;
      },
      logout: async () => {
        await logoutService();
        setProfile(null);
      },
    }),
    [ready, profile, unread, refreshMe, refreshUnread],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return ctx;
}
