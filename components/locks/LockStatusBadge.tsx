"use client";

import React from "react";
import { Lock, CheckCircle, Clock, Unlock } from "lucide-react";
import { LockStatus, DocumentLock } from "@/types";

interface LockStatusBadgeProps {
    status: LockStatus;
    lock?: DocumentLock;
    className?: string;
}

export function LockStatusBadge({ status, lock, className = "" }: LockStatusBadgeProps) {
    if (status === "LOCKED" && lock) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
                title={`Locked by ${lock.locked_by_user_name} at ${new Date(lock.locked_at).toLocaleTimeString()}`}
            >
                <Lock className="w-3 h-3 text-amber-600 animate-pulse" />
                <span>Locked by {lock.locked_by_user_name}</span>
            </span>
        );
    }

    if (status === "EXPIRED") {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 ${className}`}
            >
                <Clock className="w-3 h-3 text-orange-600" />
                <span>Lock Expired</span>
            </span>
        );
    }

    if (status === "RELEASED") {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
            >
                <Unlock className="w-3 h-3 text-blue-600" />
                <span>Released</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Available</span>
        </span>
    );
}
