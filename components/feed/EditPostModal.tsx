"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, content: string) => void;
  initialTitle: string;
  initialContent: string;
}

export default function EditPostModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialTitle, 
  initialContent 
}: EditPostModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [isOpen, initialTitle, initialContent]);

  const isSaveDisabled = title.trim() === "" || content.trim() === "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="660px">
      <h2 className="text-[22px] font-bold text-black">Edit item</h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-base font-normal text-black">Title</label>
          <input
            placeholder="Hello world"
            className="h-8 w-full rounded-lg border border-input-border px-3 text-sm outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base font-normal text-black">Content</label>
          <textarea
            placeholder="Content here"
            className="min-h-[74px] w-full rounded-lg border border-input-border p-3 text-sm outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <button
          onClick={onClose}
          className="h-8 w-[120px] rounded-lg border border-black font-bold text-black hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(title, content)}
          className={`h-8 w-[120px] rounded-lg font-bold text-white transition-colors 
            ${isSaveDisabled 
              ? "bg-primary-disabled cursor-not-allowed opacity-50" 
              : "bg-save hover:bg-save-hover"
            }`}
          disabled={isSaveDisabled}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
