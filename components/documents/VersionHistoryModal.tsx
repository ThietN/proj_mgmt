"use client";

import React, { useState, useEffect } from "react";
import { History, GitCommit, User, Calendar, FileText, ArrowLeftRight, Check, X, RotateCcw } from "lucide-react";
import { DocumentVersion, ManagedDocument } from "@/types";
import toast from "react-hot-toast";

interface VersionHistoryModalProps {
    document: ManagedDocument;
    isOpen: boolean;
    onClose: () => void;
    onRestoreSnapshot?: (content: string) => void;
}

export function VersionHistoryModal({
    document,
    isOpen,
    onClose,
    onRestoreSnapshot,
}: VersionHistoryModalProps) {
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
    const [compareVersion, setCompareVersion] = useState<DocumentVersion | null>(null);
    const [viewMode, setViewMode] = useState<"snapshot" | "diff">("snapshot");

    useEffect(() => {
        if (!isOpen) return;

        const fetchVersions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/documents/${document.id}/versions`);
                if (res.ok) {
                    const data = await res.json();
                    setVersions(data.versions || []);
                    if (data.versions && data.versions.length > 0) {
                        setSelectedVersion(data.versions[0]);
                        if (data.versions.length > 1) {
                            setCompareVersion(data.versions[1]);
                        }
                    }
                }
            } catch (err) {
                toast.error("Failed to load version history");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVersions();
    }, [isOpen, document.id]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">Version History & Audit Log</h3>
                            <p className="text-xs text-slate-400">Document: {document.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                            <button
                                onClick={() => setViewMode("snapshot")}
                                className={`px-3 py-1 rounded-lg transition-all ${
                                    viewMode === "snapshot"
                                        ? "bg-blue-600 text-white font-medium"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Snapshot View
                            </button>
                            <button
                                onClick={() => setViewMode("diff")}
                                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                                    viewMode === "diff"
                                        ? "bg-blue-600 text-white font-medium"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <ArrowLeftRight className="w-3.5 h-3.5" /> Diff View
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white rounded-lg p-1.5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Version Timeline List */}
                    <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto p-4 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                            Published Versions ({versions.length})
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-xs text-slate-400">Loading version history...</div>
                        ) : versions.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">No versions published yet</div>
                        ) : (
                            versions.map((ver) => {
                                const isSelected = selectedVersion?.id === ver.id;
                                const isCompare = compareVersion?.id === ver.id;

                                return (
                                    <div
                                        key={ver.id}
                                        onClick={() => {
                                            if (viewMode === "diff" && selectedVersion && selectedVersion.id !== ver.id) {
                                                setCompareVersion(ver);
                                            } else {
                                                setSelectedVersion(ver);
                                            }
                                        }}
                                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20"
                                                : isCompare && viewMode === "diff"
                                                ? "bg-amber-50/80 border-amber-400 shadow-sm"
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                                <GitCommit className="w-3.5 h-3.5 text-blue-600" />
                                                Version {ver.version_number}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(ver.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 line-clamp-2 text-[11px] mb-2 font-medium">
                                            {ver.change_summary || "No change summary"}
                                        </p>

                                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-slate-400" />
                                                {ver.created_by_user_name}
                                            </span>
                                            <span>{new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right: Detail Snapshot or Diff Comparison */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-white p-6">
                        {selectedVersion ? (
                            <div className="h-full flex flex-col">
                                {/* Top Bar */}
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900 text-lg">
                                                Version {selectedVersion.version_number} Snapshot
                                            </h4>
                                            {viewMode === "diff" && compareVersion && (
                                                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                                                    Compared vs Version {compareVersion.version_number}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Published by {selectedVersion.created_by_user_name} on{" "}
                                            {new Date(selectedVersion.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    {onRestoreSnapshot && (
                                        <button
                                            onClick={() => {
                                                onRestoreSnapshot(selectedVersion.content);
                                                toast.success(`Loaded Version ${selectedVersion.version_number} into editor draft!`);
                                                onClose();
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Restore Draft
                                        </button>
                                    )}
                                </div>

                                {/* Content Preview */}
                                {viewMode === "snapshot" ? (
                                    <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                                        {selectedVersion.content || "(Empty Content)"}
                                    </div>
                                ) : (
                                    <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                                        <div className="flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200">
                                                Version {selectedVersion.version_number} (Selected)
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap bg-slate-50">
                                                {selectedVersion.content}
                                            </div>
                                        </div>

                                        <div className="flex flex-col h-full border border-amber-200 rounded-xl overflow-hidden">
                                            <div className="bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 border-b border-amber-200">
                                                Version {compareVersion?.version_number || "?"} (Comparison Target)
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap bg-amber-50/20">
                                                {compareVersion?.content || "Select a second version from list on the left to compare"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                                Select a version from the timeline to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
