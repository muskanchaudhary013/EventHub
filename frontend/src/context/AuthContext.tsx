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

function isValidRole(value: unknown): value is DashboardRole {
  return value === "student" || value === "volunteer" || value === "organizer";
}

async function persistUserRole(
  user: User,
  assignedRole: DashboardRole
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${ROLE_STORAGE_PREFIX}${user.uid}`, assignedRole);
    } catch {
      // ignore storage quota errors
    }
  }

  const db = getFirebaseDb();
  if (!db) return;

  try {
    await setDoc(
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
  } catch {
    // Firestore rules or database may not be enabled yet; localStorage fallback remains active
  }
}

async function fetchUserRole(uid: string): Promise<DashboardRole | null> {
  const db = getFirebaseDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        if (isValidRole(data?.role)) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(`${ROLE_STORAGE_PREFIX}${uid}`, data.role);
          }
          return data.role;
        }
      }
    } catch {
      // fall through to local cache
    }
  }

  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(`${ROLE_STORAGE_PREFIX}${uid}`);
    if (isValidRole(cached)) {
      return cached;
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
  const [role, setRole] = useState<DashboardRole | null>(null);
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
        const savedRole = await fetchUserRole(firebaseUser.uid);
        setRole(savedRole);
        setNeedsRoleSelection(!savedRole);
      } else {
        setRole(null);
        setNeedsRoleSelection(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    await persistUserRole(cred.user, assignedRole);
    setUser(cred.user);
    setRole(assignedRole);
    setNeedsRoleSelection(false);
    return assignedRole;
  };

  const signInWithGoogle = async (
    preferredRole?: DashboardRole
  ): Promise<DashboardRole | null> => {
    const firebaseAuth = requireAuth();
    const cred = await signInWithPopup(firebaseAuth, createGoogleProvider());
    const existingRole = await fetchUserRole(cred.user.uid);
    if (existingRole) {
      setRole(existingRole);
      setNeedsRoleSelection(false);
      return existingRole;
    }
    if (preferredRole) {
      await persistUserRole(cred.user, preferredRole);
      setRole(preferredRole);
      setNeedsRoleSelection(false);
      return preferredRole;
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
    await persistUserRole(current, assignedRole);
    setRole(assignedRole);
    setNeedsRoleSelection(false);
  };

  const resetPassword = async (email: string) => {
    const firebaseAuth = requireAuth();
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const signOut = async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) return;
    await firebaseSignOut(firebaseAuth);
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
