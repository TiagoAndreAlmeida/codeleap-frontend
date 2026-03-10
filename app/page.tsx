"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const isButtonDisabled = username.trim() === "";

  const handleEnter = () => {
    localStorage.setItem("codeleap_username", username.trim());
    router.push("/feed");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-[500px] flex-col gap-6 rounded-2xl bg-modal p-6 shadow-xl sm:p-12">
        <h1 className="text-[22px] font-bold leading-none text-black">
          Welcome to CodeLeap network!
        </h1>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-base font-normal leading-none text-black">
            Please enter your username
          </label>
          <input
            id="username"
            type="text"
            placeholder="John doe"
            autoComplete="off"
            className="h-8 w-full rounded-lg border border-input-border px-3 text-sm outline-none placeholder:text-placeholder focus:ring-1 focus:ring-primary"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            className={`h-8 w-full rounded-lg text-base font-bold text-white transition-all sm:w-[111px] 
              ${isButtonDisabled 
                ? "cursor-not-allowed bg-primary-disabled" 
                : "cursor-pointer bg-primary hover:bg-primary-hover active:scale-95"
              }`}
            disabled={isButtonDisabled}
            onClick={handleEnter}
          >
            ENTER
          </button>
        </div>
      </section>
    </main>
  );
}
