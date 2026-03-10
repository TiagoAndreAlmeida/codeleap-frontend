"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/feed");
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-[500px] flex-col gap-10 rounded-2xl bg-modal p-12 shadow-xl">
        <h1 className="text-[22px] font-bold leading-none text-black text-center">
          Welcome to CodeLeap network!
        </h1>
        
        <div className="flex flex-col gap-6 items-center">
          <p className="text-base text-center text-gray-600">
            Sign in with your Google account to access the network.
          </p>
          
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center gap-4 w-full h-12 rounded-lg border border-input-border bg-white font-bold text-black hover:bg-gray-50 transition-all active:scale-95 shadow-sm px-6"
          >
            <Image 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google Icon" 
              width={20} 
              height={20} 
            />
            Sign in with Google
          </button>
        </div>
      </section>
    </main>
  );
}
