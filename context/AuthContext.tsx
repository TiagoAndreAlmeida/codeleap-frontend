"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Retrieve ID Token (JWT) for the backend
        const idToken = await currentUser.getIdToken();
        console.log("🔥 [Firebase] Active User:", {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          idToken: idToken // This is the token the backend should validate
        });
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Log raw login result
      console.log("🚀 [Firebase] Google Login Success:", {
        user: result.user,
        credential: result.credential,
        additionalUserInfo: (result as any)._tokenResponse // Extra info like isNewUser
      });

    } catch (error) {
      console.error("❌ [Firebase] Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("🚪 [Firebase] User logged out");
    } catch (error) {
      console.error("❌ [Firebase] Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
