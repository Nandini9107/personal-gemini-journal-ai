import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  entryTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entryTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Delete Journal Entry?</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">&ldquo;{entryTitle}&rdquo;</span>?
            This reflection will be permanently removed from your private Firestore database.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            Keep Entry
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
