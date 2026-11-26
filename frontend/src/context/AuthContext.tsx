"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createGoogleProvider,
  getFirebaseAuth,
  getFirebaseDb,
  initFirebaseAnalytics,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { api } from "@/lib/api";

export type DashboardRole = "student" | "volunteer" | "organizer";

export function getDashboardPath(role: DashboardRole): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "volunteer":
      return "/dashboard/volunteer";
    case "organizer":
      return "/dashboard/organizer";
  }
}

export function getDashboardLabel(role: DashboardRole): string {
  switch (role) {
    case "student":
      return "Student Dashboard";
    case "volunteer":
      return "Volunteer Console";
    case "organizer":
      return "Organizer Dashboard";
  }
}

const ROLE_STORAGE_PREFIX = "eventhub_role_";
const LAST_ACTIVE_ROLE_KEY = "eventhub_last_role";

function isValidRole(value: unknown): value is DashboardRole {
  return value === "student" || value === "volunteer" || value === "organizer";
}

function getLocalRole(uid?: string): DashboardRole | null {
  if (typeof window === "undefined") return null;
  try {
    if (uid) {
      const specific = window.localStorage.getItem(`${ROLE_STORAGE_PREFIX}${uid}`);
      if (isValidRole(specific)) return specific;
    }
    const last = window.localStorage.getItem(LAST_ACTIVE_ROLE_KEY);
    if (isValidRole(last)) return last;
  } catch {
    // ignore storage quota / sandbox errors
  }
  return null;
}

function saveLocalRole(uid: string, assignedRole: DashboardRole) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${ROLE_STORAGE_PREFIX}${uid}`, assignedRole);
      window.localStorage.setItem(LAST_ACTIVE_ROLE_KEY, assignedRole);
    } catch {
      // ignore
    }
  }
}

async function persistUserRole(
  user: User,
  assignedRole: DashboardRole
): Promise<void> {
  saveLocalRole(user.uid, assignedRole);

  // Background sync to backend API (safe and non-blocking)
  api.syncUser({
    firebaseUid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    role: assignedRole,
  }).catch(() => {});

  const db = getFirebaseDb();
  if (!db) return;

  try {
    const writePromise = setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        role: assignedRole,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    // Strict 1.2s timeout so the promise never hangs waiting on Firestore
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1200));
    await Promise.race([writePromise, timeoutPromise]);
  } catch {
    // Firestore rules or database may not be enabled yet; localStorage fallback remains active
  }
}

async function fetchUserRole(uid: string): Promise<DashboardRole | null> {
  // Check local cache first for instant resolution
  const local = getLocalRole(uid);
  if (local) return local;

  const db = getFirebaseDb();
  if (db) {
    try {
      const getPromise = getDoc(doc(db, "users", uid));
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
      const snap = await Promise.race([getPromise, timeoutPromise]);
      if (snap && "exists" in snap && snap.exists()) {
        const data = snap.data();
        if (isValidRole(data?.role)) {
          saveLocalRole(uid, data.role);
          return data.role;
        }
      }
    } catch {
      // fall through
    }
  }

  return null;
}

interface AuthContextValue {
  user: User | null;
  role: DashboardRole | null;
  needsRoleSelection: boolean;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<DashboardRole | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
    assignedRole: DashboardRole
  ) => Promise<DashboardRole>;
  signInWithGoogle: (
    preferredRole?: DashboardRole
  ) => Promise<DashboardRole | null>;
  assignRole: (assignedRole: DashboardRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<DashboardRole | null>(() => getLocalRole());
  const [needsRoleSelection, setNeedsRoleSelection] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    initFirebaseAnalytics();

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // 1. Instant check from local cache to immediately unblock the UI with zero delay
        const cached = getLocalRole(firebaseUser.uid);
        if (cached) {
          setRole(cached);
          setNeedsRoleSelection(false);
          setLoading(false); // Unblock UI immediately!
        }

        // 2. Query remote Firestore in background (or if no cache)
        fetchUserRole(firebaseUser.uid)
          .then((remoteRole) => {
            if (remoteRole) {
              setRole(remoteRole);
              setNeedsRoleSelection(false);
            } else if (!cached) {
              setRole(null);
              setNeedsRoleSelection(true);
            }
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } else {
        setRole(null);
        setNeedsRoleSelection(false);
        setLoading(false);
      }
    });

    // Safety fallback: never keep user stuck on loading spinner for more than 2.5s
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const requireAuth = () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      throw new Error(
        "Firebase is not configured yet. Add your NEXT_PUBLIC_FIREBASE_* credentials to frontend/.env.local and restart the server."
      );
    }
    return firebaseAuth;
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<DashboardRole | null> => {
    const firebaseAuth = requireAuth();
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const cachedRole = getLocalRole(cred.user.uid);
    if (cachedRole) {
      setRole(cachedRole);
      setNeedsRoleSelection(false);
      return cachedRole;
    }
    const savedRole = await fetchUserRole(cred.user.uid);
    setRole(savedRole);
    setNeedsRoleSelection(!savedRole);
    return savedRole;
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    assignedRole: DashboardRole
  ): Promise<DashboardRole> => {
    const firebaseAuth = requireAuth();
    const cred = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
    }
    saveLocalRole(cred.user.uid, assignedRole);
    setUser(cred.user);
    setRole(assignedRole);
    setNeedsRoleSelection(false);
    persistUserRole(cred.user, assignedRole).catch(() => {});
    return assignedRole;
  };

  const signInWithGoogle = async (
    preferredRole?: DashboardRole
  ): Promise<DashboardRole | null> => {
    const firebaseAuth = requireAuth();
    const cred = await signInWithPopup(firebaseAuth, createGoogleProvider());
    const cachedRole = getLocalRole(cred.user.uid);
    if (cachedRole) {
      setRole(cachedRole);
      setNeedsRoleSelection(false);
      return cachedRole;
    }
    if (preferredRole) {
      saveLocalRole(cred.user.uid, preferredRole);
      setRole(preferredRole);
      setNeedsRoleSelection(false);
      persistUserRole(cred.user, preferredRole).catch(() => {});
      return preferredRole;
    }
    const existingRole = await fetchUserRole(cred.user.uid);
    if (existingRole) {
      setRole(existingRole);
      setNeedsRoleSelection(false);
      return existingRole;
    }
    setRole(null);
    setNeedsRoleSelection(true);
    return null;
  };

  const assignRole = async (assignedRole: DashboardRole): Promise<void> => {
    const firebaseAuth = requireAuth();
    const current = firebaseAuth.currentUser;
    if (!current) {
      throw new Error("Please sign in before assigning a dashboard.");
    }
    // 1. Immediately store in localStorage so next reload or read is instant
    saveLocalRole(current.uid, assignedRole);
    // 2. Immediately update state so router.replace executes without waiting on Firestore
    setRole(assignedRole);
    setNeedsRoleSelection(false);

    // 3. Persist in background non-blockingly
    persistUserRole(current, assignedRole).catch(() => {});
  };

  const resetPassword = async (email: string) => {
    const firebaseAuth = requireAuth();
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const signOut = async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) return;
    await firebaseSignOut(firebaseAuth);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(LAST_ACTIVE_ROLE_KEY);
      } catch {}
    }
    setRole(null);
    setNeedsRoleSelection(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        needsRoleSelection,
        loading,
        isConfigured: isFirebaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        assignRole,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
