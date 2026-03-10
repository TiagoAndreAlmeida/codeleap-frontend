"use client";

interface CreatePostTriggerProps {
  username: string;
  onClick: () => void;
}

export default function CreatePostTrigger({ username, onClick }: CreatePostTriggerProps) {
  return (
    <section 
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-input-border bg-white p-5 sm:p-6 transition-all hover:bg-gray-50 active:scale-[0.99] shadow-sm"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white uppercase shadow-inner">
          {username.substring(0, 2)}
        </div>
        
        <div className="flex flex-1 items-center h-10 rounded-full border border-input-border bg-gray-50 px-5 text-sm text-[#777777] overflow-hidden">
          <span className="truncate whitespace-nowrap">
            What’s on your mind, @{username}?
          </span>
        </div>
      </div>
    </section>
  );
}
