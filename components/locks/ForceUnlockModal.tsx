"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import { ManagedDocument } from "@/types";

interface ForceUnlockModalProps {
    document: ManagedDocument;
    isOpen: boolean;
    onClose: () => void;
    onUnlocked: () => void;
}

export function ForceUnlockModal({
    document,
    isOpen,
    onClose,
    onUnlocked,
}: ForceUnlockModalProps) {
    const [reason, setReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleForceUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Please provide a reason for force unlocking.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/locks/force-unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    document_id: document.id,
                    reason: reason.trim(),
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Document lock successfully forcibly released!");
                onUnlocked();
                onClose();
            } else {
                toast.error(data.error || "Failed to force unlock document.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to force unlock document.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const lockUser = document.lock?.locked_by_user_name || "Active Editor";
    const lockedAt = document.lock?.locked_at
        ? new Date(document.lock.locked_at).toLocaleString()
        : "Unknown time";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Super Admin Force Unlock</h3>
                            <p className="text-xs text-red-700">Override lock on file "{document.title}"</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleForceUnlock} className="p-6 space-y-4">
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-3.5 text-xs text-amber-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>Active Lock Information</span>
                        </div>
                        <p>
                            Locked by: <strong className="font-medium text-slate-900">{lockUser}</strong>
                        </p>
                        <p>Locked at: {lockedAt}</p>
                        <p className="text-[11px] opacity-80 pt-1">
                            Warning: Forcibly unlocking this file will allow other users to edit it immediately. The active editor's session will be invalidated.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reason for Force Unlock <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. User is unavailable / browser crash / urgent production edit needed..."
                            rows={3}
                            required
                            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            This action, timestamp, and reason will be permanently recorded in the system Audit Log.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !reason.trim()}
                            className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                        >
                            {isSubmitting ? "Force Unlocking..." : "Confirm Force Unlock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
