"use client";

import Modal from "@/components/shared/Modal";

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePostModal({ isOpen, onClose, onConfirm }: DeletePostModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="660px">
      <h2 className="text-[22px] font-bold text-black">
        Are you sure you want to delete this item?
      </h2>

      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="h-8 w-[120px] rounded-lg border border-black font-bold text-black hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-8 w-[120px] rounded-lg bg-delete font-bold text-white hover:bg-delete-hover transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
