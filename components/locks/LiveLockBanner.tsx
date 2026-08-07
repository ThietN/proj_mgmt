"use client";

import React, { useState, useEffect } from "react";
import { Lock, Clock, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";
import { DocumentLock } from "@/types";
import toast from "react-hot-toast";

interface LiveLockBannerProps {
    lock: DocumentLock;
    lockToken: string;
    currentUser: { id: string; name: string; role: string };
    onLockExtended?: (newExpiresAt: string) => void;
    onLockLost?: () => void;
}

export function LiveLockBanner({
    lock,
    lockToken,
    currentUser,
    onLockExtended,
    onLockLost,
}: LiveLockBannerProps) {
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
    const [isExtending, setIsExtending] = useState<boolean>(false);

    // Calculate remaining seconds
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const expires = new Date(lock.expires_at).getTime();
            const diffSeconds = Math.max(0, Math.floor((expires - now) / 1000));
            setTimeLeftSeconds(diffSeconds);

            if (diffSeconds === 0 && onLockLost) {
                onLockLost();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lock.expires_at, onLockLost]);

    // Heartbeat ping every 30 seconds
    useEffect(() => {
        const sendHeartbeat = async () => {
            try {
                const res = await fetch("/api/locks/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        document_id: lock.document_id,
                        lock_token: lockToken,
                    }),
                });
                if (!res.ok && onLockLost) {
                    onLockLost();
                }
            } catch (err) {
                console.error("Heartbeat ping failed", err);
            }
        };

        const interval = setInterval(sendHeartbeat, 30000);
        return () => clearInterval(interval);
    }, [lock.document_id, lockToken, onLockLost]);

    const handleExtendLock = async () => {
        setIsExtending(true);
        try {
            const res = await fetch("/api/locks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "extend",
                    document_id: lock.document_id,
                    lock_token: lockToken,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Lock extended for 60 minutes!");
                if (onLockExtended && data.expires_at) {
                    onLockExtended(data.expires_at);
                }
            } else {
                toast.error(data.error || data.message || "Failed to extend lock");
                if (onLockLost) onLockLost();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to extend lock");
        } finally {
            setIsExtending(false);
        }
    };

    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;
    const formattedTime = `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    const isWarning = minutes < 10;
    const isCritical = minutes < 3;

    const isLockOwner = lock.locked_by_user_id === currentUser.id;

    return (
        <div
            className={`w-full rounded-xl border p-4 transition-all duration-200 shadow-sm ${
                isCritical
                    ? "bg-red-50/90 border-red-200 text-red-900"
                    : isWarning
                    ? "bg-amber-50/90 border-amber-200 text-amber-900"
                    : "bg-slate-900 text-white border-slate-800"
            }`}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                            isCritical
                                ? "bg-red-100 text-red-600"
                                : isWarning
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                        }`}
                    >
                        {isCritical ? (
                            <ShieldAlert className="w-5 h-5 animate-bounce" />
                        ) : isWarning ? (
                            <AlertTriangle className="w-5 h-5 animate-pulse" />
                        ) : (
                            <Lock className="w-5 h-5" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <span>
                                🔒 Locked by:{" "}
                                <strong className="font-semibold">{lock.locked_by_user_name}</strong>
                            </span>
                            {isLockOwner && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                                    You
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs opacity-80 mt-0.5">
                            <span>
                                Locked at: {new Date(lock.locked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono font-medium">
                                <Clock className="w-3 h-3" /> Auto-release in: {formattedTime}
                            </span>
                        </div>
                    </div>
                </div>

                {isLockOwner && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                            onClick={handleExtendLock}
                            disabled={isExtending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                                isCritical || isWarning
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isExtending ? "animate-spin" : ""}`} />
                            {isExtending ? "Extending..." : "Extend Lock (+60m)"}
                        </button>
                    </div>
                )}
            </div>

            {isLockOwner && isWarning && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/50 text-xs font-medium flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>
                        Your editing session will expire in {minutes} minutes. Please extend your lock or save and publish your changes to avoid losing edits.
                    </span>
                </div>
            )}
        </div>
    );
}
