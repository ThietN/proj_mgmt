"use client";

import React, { useState, useEffect } from "react";
import { Save, Send, Unlock, Lock, History, ShieldAlert, FileText, Check, AlertTriangle } from "lucide-react";
import { ManagedDocument, DocumentLock } from "@/types";
import { LiveLockBanner } from "@/components/locks/LiveLockBanner";
import { LockStatusBadge } from "@/components/locks/LockStatusBadge";
import { ForceUnlockModal } from "@/components/locks/ForceUnlockModal";
import { VersionHistoryModal } from "@/components/documents/VersionHistoryModal";
import toast from "react-hot-toast";

interface DocumentEditorProps {
    document: ManagedDocument;
    currentUser: { id: string; name: string; role: string };
    onUpdateComplete?: () => void;
    onClose?: () => void;
}

export function DocumentEditor({
    document: initialDoc,
    currentUser,
    onUpdateComplete,
    onClose,
}: DocumentEditorProps) {
    const [doc, setDoc] = useState<ManagedDocument>(initialDoc);
    const [content, setContent] = useState<string>(initialDoc.draft_content || initialDoc.content || "");
    const [changeSummary, setChangeSummary] = useState<string>("");
    const [lockToken, setLockToken] = useState<string | null>(initialDoc.lock?.lock_token || null);
    const [isLocking, setIsLocking] = useState<boolean>(false);
    const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [showForceUnlockModal, setShowForceUnlockModal] = useState<boolean>(false);
    const [showVersionHistoryModal, setShowVersionHistoryModal] = useState<boolean>(false);

    const isLockOwner = doc.lock?.locked_by_user_id === currentUser.id;
    const isLockedByOther = doc.status === "LOCKED" && !isLockOwner;

    // Automatically attempt lock acquisition on mount if available or expired
    useEffect(() => {
        const autoAcquireLock = async () => {
            if ((doc.status === "AVAILABLE" || doc.status === "EXPIRED" || doc.status === "RELEASED") && !lockToken) {
                setIsLocking(true);
                try {
                    const res = await fetch("/api/locks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "acquire",
                            document_id: doc.id,
                        }),
                    });

                    const data = await res.json();
                    if (res.ok && data.success && data.lock_token) {
                        setLockToken(data.lock_token);
                        setDoc((prev) => ({
                            ...prev,
                            status: "LOCKED",
                            lock: data.lock,
                        }));
                        toast.success("🔒 Exclusive edit lock acquired!");
                    } else if (res.status === 409 && data.lock) {
                        setDoc((prev) => ({
                            ...prev,
                            status: "LOCKED",
                            lock: data.lock,
                        }));
                        toast.error(`File is currently locked by ${data.lock.locked_by_user_name}`);
                    }
                } catch (err: any) {
                    console.error("Lock acquisition error", err);
                } finally {
                    setIsLocking(false);
                }
            }
        };

        autoAcquireLock();
    }, [doc.id]);

    const handleSaveDraft = async () => {
        if (!lockToken || !isLockOwner) {
            toast.error("You do not hold the active lock for this document.");
            return;
        }

        setIsSavingDraft(true);
        try {
            const res = await fetch("/api/documents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    document_id: doc.id,
                    draft_content: content,
                    lock_token: lockToken,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Draft changes saved successfully!");
            } else {
                toast.error(data.error || data.message || "Failed to save draft");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save draft");
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lockToken || !isLockOwner) {
            toast.error("You do not hold the active lock for this document.");
            return;
        }

        setIsPublishing(true);
        try {
            const res = await fetch(`/api/documents/${doc.id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content,
                    change_summary: changeSummary.trim() || `Updated by ${currentUser.name}`,
                    lock_token: lockToken,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Published Version ${data.version.version_number} & released lock!`);
                setLockToken(null);
                setDoc((prev) => ({
                    ...prev,
                    status: "AVAILABLE",
                    current_version: data.version.version_number,
                    content: content,
                    lock: undefined,
                }));
                if (onUpdateComplete) onUpdateComplete();
            } else {
                toast.error(data.error || data.message || "Failed to publish version");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to publish version");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleReleaseLock = async () => {
        if (!lockToken) return;
        try {
            const res = await fetch("/api/locks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "release",
                    document_id: doc.id,
                    lock_token: lockToken,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("🔓 Lock released. File is now available.");
                setLockToken(null);
                setDoc((prev) => ({
                    ...prev,
                    status: "AVAILABLE",
                    lock: undefined,
                }));
                if (onClose) onClose();
            } else {
                toast.error(data.error || "Failed to release lock");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to release lock");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-sm">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-900 text-xl">{doc.title}</h2>
                            <span className="text-xs bg-slate-100 font-bold text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                                V{doc.current_version}
                            </span>
                            <LockStatusBadge status={doc.status} lock={doc.lock} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Category: {doc.category} • Last updated by {doc.updated_by} on{" "}
                            {new Date(doc.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowVersionHistoryModal(true)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                        <History className="w-4 h-4 text-slate-500" /> Version History
                    </button>

                    {isLockedByOther && currentUser.role === "SuperAdmin" && (
                        <button
                            onClick={() => setShowForceUnlockModal(true)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 transition-all border border-red-200 flex items-center gap-1.5"
                        >
                            <ShieldAlert className="w-4 h-4 text-red-600" /> Force Unlock
                        </button>
                    )}
                </div>
            </div>

            {/* Live Lock Banner */}
            {doc.status === "LOCKED" && doc.lock && (
                <LiveLockBanner
                    lock={doc.lock}
                    lockToken={lockToken || ""}
                    currentUser={currentUser}
                    onLockExtended={(newExpires) => {
                        setDoc((prev) => ({
                            ...prev,
                            lock: prev.lock ? { ...prev.lock, expires_at: newExpires } : undefined,
                        }));
                    }}
                    onLockLost={() => {
                        toast.error("Lock lost or expired! Switching editor to Read-Only mode.");
                        setLockToken(null);
                        setDoc((prev) => ({ ...prev, status: "EXPIRED", lock: undefined }));
                    }}
                />
            )}

            {/* Read-Only Alert if locked by someone else */}
            {isLockedByOther && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <strong className="font-semibold">Read-Only Mode Active</strong>
                        <p className="mt-0.5">
                            This document is currently locked by <strong>{doc.lock?.locked_by_user_name}</strong>. You can view the document content below, but changes are disabled until the lock is released.
                        </p>
                    </div>
                </div>
            )}

            {/* Editor Workspace */}
            <form onSubmit={handlePublish} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Document Content {isLockedByOther && "(Read-Only)"}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isLockedByOther || !isLockOwner}
                        rows={12}
                        placeholder="Type or paste document / report content here..."
                        className="w-full text-xs font-mono rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed shadow-inner"
                    />
                </div>

                {isLockOwner && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Change Summary for Version {doc.current_version + 1}
                        </label>
                        <input
                            type="text"
                            value={changeSummary}
                            onChange={(e) => setChangeSummary(e.target.value)}
                            placeholder="Brief description of your changes (e.g., Added Section 4 metrics)..."
                            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                        {isLockOwner ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <Check className="w-4 h-4 text-emerald-600" /> Active edit session (Token verified)
                            </span>
                        ) : (
                            <span>Open in read-only preview mode</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {isLockOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={isSavingDraft}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 border border-slate-200 shadow-sm"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {isSavingDraft ? "Saving..." : "Save Draft"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReleaseLock}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all flex items-center gap-1.5 border border-amber-200"
                                >
                                    <Unlock className="w-3.5 h-3.5" /> Release Lock
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPublishing}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {isPublishing ? "Publishing..." : `Publish Version ${doc.current_version + 1}`}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </form>

            {/* Modals */}
            <ForceUnlockModal
                document={doc}
                isOpen={showForceUnlockModal}
                onClose={() => setShowForceUnlockModal(false)}
                onUnlocked={() => {
                    setDoc((prev) => ({ ...prev, status: "RELEASED", lock: undefined }));
                    if (onUpdateComplete) onUpdateComplete();
                }}
            />

            <VersionHistoryModal
                document={doc}
                isOpen={showVersionHistoryModal}
                onClose={() => setShowVersionHistoryModal(false)}
                onRestoreSnapshot={(restoredContent) => {
                    setContent(restoredContent);
                }}
            />
        </div>
    );
}
