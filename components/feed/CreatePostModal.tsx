"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (title: string, content: string) => void;
  isLoading?: boolean;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, isLoading }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const isDisabled = title.trim() === "" || content.trim() === "" || isLoading;

  const handleCreate = () => {
    onPostCreated(title, content);
    setTitle("");
    setContent("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="660px">
      <h2 className="text-[22px] font-bold text-black">What’s on your mind?</h2>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-base font-normal text-black">Title</label>
          <input
            placeholder="Hello world"
            className="h-8 w-full rounded-lg border border-input-border px-3 text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-base font-normal text-black">Content</label>
          <textarea
            placeholder="Content here"
            className="min-h-[120px] w-full rounded-lg border border-input-border p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          className={`h-8 px-8 rounded-lg text-base font-bold text-white transition-colors ${
            isDisabled ? "bg-primary-disabled cursor-not-allowed" : "bg-primary hover:bg-primary-hover"
          }`}
          disabled={isDisabled}
          onClick={handleCreate}
        >
          {isLoading ? "Creating..." : "Create"}
        </button>
      </div>
    </Modal>
  );
}
