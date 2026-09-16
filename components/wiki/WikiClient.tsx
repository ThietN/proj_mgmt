"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { WikiPage } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { BookOpen, Lock, Unlock, Loader2, Check, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface WikiClientProps {
    initialData: WikiPage;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
}

export default function WikiClient({ initialData }: WikiClientProps) {
    const [page, setPage] = useState<WikiPage>(initialData);
    const [title, setTitle] = useState(initialData.title);
    const [content, setContent] = useState(initialData.content);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<string>(initialData.updated_at);
    const [relativeTime, setRelativeTime] = useState<string>("");
    const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
    const [isLocking, setIsLocking] = useState(false);

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedTitleRef = useRef(initialData.title);
    const lastSavedContentRef = useRef(initialData.content);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) { }
        };
        fetchUser();
    }, []);

    // Update relative time every 30s
    useEffect(() => {
        const update = () => setRelativeTime(getRelativeTime(lastSavedAt));
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [lastSavedAt]);

    // Determine edit permissions
    const isSuperAdmin = user?.role === "SuperAdmin";
    const isLockedByMe = page.is_locked && page.locked_by_user_id === user?.id;
    const isLockedByOther = page.is_locked && page.locked_by_user_id !== user?.id;
    const canEdit = isSuperAdmin && !isLockedByOther;

    // Auto-save function
    const doSave = useCallback(async (newTitle: string, newContent: string) => {
        // Skip if nothing changed
        if (newTitle === lastSavedTitleRef.current && newContent === lastSavedContentRef.current) {
            return;
        }

        setSaveStatus("saving");
        try {
            const res = await fetch("/api/wiki", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: page.id,
                    title: newTitle,
                    content: newContent,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Save failed");
            }

            const now = new Date().toISOString();
            lastSavedTitleRef.current = newTitle;
            lastSavedContentRef.current = newContent;
            setLastSavedAt(now);
            setSaveStatus("saved");

            // Reset to idle after 3s
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err: any) {
            setSaveStatus("error");
            toast.error(err.message || "Failed to save");
        }
    }, [page.id]);

    // Debounced auto-save on title change
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canEdit) return;
        const newTitle = e.target.value;
        setTitle(newTitle);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => doSave(newTitle, content), 1500);
    };

    // Debounced auto-save on content change
    const handleContentChange = (newContent: string) => {
        if (!canEdit) return;
        setContent(newContent);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => doSave(title, newContent), 1500);
    };

    // Lock / Unlock
    const handleToggleLock = async () => {
        if (!isSuperAdmin) return;
        setIsLocking(true);

        try {
            const action = page.is_locked ? "unlock" : "lock";
            const res = await fetch("/api/wiki/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    wiki_id: page.id,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Failed to ${action}`);
            }

            // Refresh wiki page state
            const pageRes = await fetch("/api/wiki");
            if (pageRes.ok) {
                const updatedPage = await pageRes.json();
                setPage(updatedPage);
                setTitle(updatedPage.title);
                setContent(updatedPage.content);
                lastSavedTitleRef.current = updatedPage.title;
                lastSavedContentRef.current = updatedPage.content;
            }

            toast.success(page.is_locked ? "Wiki page unlocked" : "Wiki page locked");
        } catch (err: any) {
            toast.error(err.message || "Lock operation failed");
        } finally {
            setIsLocking(false);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    return (
        <div className="min-h-full">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Wiki</h1>
                        <p className="text-xs text-slate-500">Project notes & documentation</p>
                    </div>
                </div>
            </div>

            {/* Wiki Content Area */}
            <div className="max-w-4xl mx-auto">
                {/* Lock Banner */}
                {page.is_locked && (
                    <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isLockedByMe
                            ? "bg-amber-50 border border-amber-200 text-amber-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                    }`}>
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>
                            {isLockedByMe
                                ? "You have locked this page for editing"
                                : `Locked by ${page.locked_by_user_name} — Read-only mode`}
                        </span>
                        {page.locked_at && (
                            <span className="ml-auto text-xs opacity-60">
                                Locked {getRelativeTime(page.locked_at)}
                            </span>
                        )}
                    </div>
                )}

                {/* Title & Meta Bar */}
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                disabled={!canEdit}
                                placeholder="Untitled"
                                className="w-full text-3xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder-slate-300 disabled:cursor-default disabled:text-slate-900"
                            />
                        </div>

                        {/* Lock Button - SuperAdmin only */}
                        {isSuperAdmin && (
                            <button
                                onClick={handleToggleLock}
                                disabled={isLocking || isLockedByOther}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                    page.is_locked
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={page.is_locked ? "Unlock this page" : "Lock this page for editing"}
                            >
                                {isLocking ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : page.is_locked ? (
                                    <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                )}
                                {page.is_locked ? "Unlock" : "Lock"}
                            </button>
                        )}
                    </div>

                    {/* Save status & meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {/* Save status indicator */}
                        <span className="flex items-center gap-1.5">
                            {saveStatus === "saving" && (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                    <span className="text-blue-500">Saving...</span>
                                </>
                            )}
                            {saveStatus === "saved" && (
                                <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-500">Saved just now</span>
                                </>
                            )}
                            {saveStatus === "error" && (
                                <>
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                    <span className="text-red-500">Save failed</span>
                                </>
                            )}
                            {saveStatus === "idle" && relativeTime && (
                                <>
                                    <Clock className="w-3 h-3" />
                                    <span>Last saved: {relativeTime}</span>
                                </>
                            )}
                        </span>

                        {page.updated_by && page.updated_by !== "system" && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span>Edited by {page.updated_by}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Editor / Read-only Content */}
                {canEdit ? (
                    <div className="wiki-editor">
                        <RichTextEditor
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Write anything... Use the toolbar to format your notes."
                            height={500}
                        />
                    </div>
                ) : (
                    <div className="wiki-readonly">
                        {content ? (
                            <div
                                className="rich-content prose-wiki"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <div className="text-slate-400 italic py-12 text-center">
                                No content yet. A SuperAdmin can edit this page.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Wiki-specific styles */}
            <style jsx global>{`
                /* Wiki Editor - Notion-inspired look */
                .wiki-editor .rich-text-editor .ql-toolbar {
                    border-radius: 12px 12px 0 0;
                    border-color: #e2e8f0;
                    background: #fafbfc;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .wiki-editor .rich-text-editor .ql-container {
                    border-radius: 0 0 12px 12px;
                    border-color: #e2e8f0;
                    font-size: 15px;
                }
                .wiki-editor .rich-text-editor .ql-editor {
                    min-height: 500px;
                    max-height: none;
                    padding: 24px 32px;
                    line-height: 1.75;
                }
                .wiki-editor .rich-text-editor .ql-editor h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #0f172a;
                }
                .wiki-editor .rich-text-editor .ql-editor h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }
                .wiki-editor .rich-text-editor .ql-editor h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    color: #334155;
                }
                .wiki-editor .rich-text-editor .ql-editor p {
                    margin-bottom: 0.5rem;
                }
                .wiki-editor .rich-text-editor .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #94a3b8;
                    left: 32px;
                }

                /* Wiki Read-only view */
                .wiki-readonly {
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: #fff;
                    padding: 24px 32px;
                    min-height: 400px;
                }
                .prose-wiki h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #0f172a;
                }
                .prose-wiki h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }
                .prose-wiki h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    color: #334155;
                }
                .prose-wiki p {
                    margin-bottom: 0.5rem;
                    line-height: 1.75;
                }
                .prose-wiki ul {
                    list-style-type: disc;
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .prose-wiki ol {
                    list-style-type: decimal;
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .prose-wiki li {
                    margin-bottom: 0.25em;
                    line-height: 1.75;
                }
                .prose-wiki blockquote {
                    border-left: 4px solid #4f46e5;
                    background: #f5f3ff;
                    padding: 8px 16px;
                    border-radius: 4px;
                    color: #4338ca;
                    font-style: italic;
                    margin: 12px 0;
                }
                .prose-wiki pre {
                    background-color: #1e293b;
                    color: #f8fafc;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'JetBrains Mono', monospace;
                    overflow-x: auto;
                    margin: 12px 0;
                }
                .prose-wiki img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 12px 0;
                }
                .prose-wiki a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .prose-wiki a:hover {
                    color: #1d4ed8;
                }
            `}</style>
        </div>
    );
}
