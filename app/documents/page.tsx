"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    Lock,
    Unlock,
    History,
    ShieldAlert,
    Search,
    Filter,
    Folder,
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight
} from "lucide-react";
import { ManagedDocument } from "@/types";
import { LockStatusBadge } from "@/components/locks/LockStatusBadge";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { ForceUnlockModal } from "@/components/locks/ForceUnlockModal";
import { VersionHistoryModal } from "@/components/documents/VersionHistoryModal";
import toast from "react-hot-toast";

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<ManagedDocument[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);

    // Active Editor & Modal States
    const [editingDoc, setEditingDoc] = useState<ManagedDocument | null>(null);
    const [historyDoc, setHistoryDoc] = useState<ManagedDocument | null>(null);
    const [forceUnlockDoc, setForceUnlockDoc] = useState<ManagedDocument | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

    // New Document Form
    const [newTitle, setNewTitle] = useState<string>("");
    const [newCategory, setNewCategory] = useState<"WEEKLY_REPORT" | "PROJECT_DOC" | "GENERAL">("PROJECT_DOC");
    const [newContent, setNewContent] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);

    // Fetch Current User
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                }
            } catch (err) {}
        };
        fetchUser();
    }, []);

    // Fetch Documents List
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const url = selectedCategory !== "ALL"
                ? `/api/documents?category=${selectedCategory}`
                : "/api/documents";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            }
        } catch (err) {
            toast.error("Failed to load documents");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [selectedCategory]);

    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("Please enter a document title");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    category: newCategory,
                    content: newContent,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Document created successfully!");
                setShowCreateModal(false);
                setNewTitle("");
                setNewContent("");
                fetchDocuments();
                setEditingDoc(data.document);
            } else {
                toast.error(data.error || "Failed to create document");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create document");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredDocs = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.created_by.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Project Documents & File Locking</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Collaborative editing with exclusive 60-minute file locks, automatic expiration, and version control snapshots.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> New Document
                </button>
            </div>

            {/* Active Document Editor view */}
            {editingDoc && currentUser && (
                <div className="space-y-4">
                    <button
                        onClick={() => {
                            setEditingDoc(null);
                            fetchDocuments();
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                        ← Back to Documents List
                    </button>

                    <DocumentEditor
                        document={editingDoc}
                        currentUser={currentUser}
                        onUpdateComplete={() => {
                            fetchDocuments();
                        }}
                        onClose={() => {
                            setEditingDoc(null);
                            fetchDocuments();
                        }}
                    />
                </div>
            )}

            {!editingDoc && (
                <>
                    {/* Filter & Search Bar */}
                    <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-slate-200">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {["ALL", "WEEKLY_REPORT", "PROJECT_DOC", "GENERAL"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        selectedCategory === cat
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {cat === "ALL" ? "All Documents" : cat.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, author, category..."
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="px-5 py-3.5">Document Title</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Lock Owner</th>
                                        <th className="px-4 py-3.5">Locked At</th>
                                        <th className="px-4 py-3.5">Expires At</th>
                                        <th className="px-4 py-3.5">Version</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                                Loading document locks...
                                            </td>
                                        </tr>
                                    ) : filteredDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                                No documents found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocs.map((doc) => {
                                            const isLocked = doc.status === "LOCKED" && doc.lock;
                                            const isOwner = doc.lock?.locked_by_user_id === currentUser?.id;

                                            return (
                                                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 text-sm">
                                                                    {doc.title}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    Category: {doc.category}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <LockStatusBadge status={doc.status} lock={doc.lock} />
                                                    </td>

                                                    <td className="px-4 py-4 font-medium text-slate-700">
                                                        {doc.lock?.locked_by_user_name || "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-500 font-mono">
                                                        {doc.lock?.locked_at
                                                            ? new Date(doc.lock.locked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-500 font-mono">
                                                        {doc.lock?.expires_at
                                                            ? new Date(doc.lock.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : "—"}
                                                    </td>

                                                    <td className="px-4 py-4 font-bold text-slate-800">
                                                        V{doc.current_version}
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditingDoc(doc)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                                                    isOwner
                                                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                                                        : isLocked
                                                                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                                                }`}
                                                            >
                                                                {isOwner ? (
                                                                    <>Edit (Lock Owner)</>
                                                                ) : isLocked ? (
                                                                    <>View (Read-Only)</>
                                                                ) : (
                                                                    <>
                                                                        <Lock className="w-3 h-3" /> Lock & Edit
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => setHistoryDoc(doc)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
                                                                title="View Version History"
                                                            >
                                                                <History className="w-3.5 h-3.5" />
                                                            </button>

                                                            {isLocked && !isOwner && currentUser?.role === "SuperAdmin" && (
                                                                <button
                                                                    onClick={() => setForceUnlockDoc(doc)}
                                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                                                                    title="Super Admin Force Unlock"
                                                                >
                                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Create Document Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900 text-base">Create New Managed Document</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCreateDocument} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Weekly_Report_W32.xlsx or Project Delivery Scope"
                                    required
                                    className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                                <select
                                    value={newCategory}
                                    onChange={(e: any) => setNewCategory(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="PROJECT_DOC">Project Document</option>
                                    <option value="WEEKLY_REPORT">Weekly Report</option>
                                    <option value="GENERAL">General Document</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Content</label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    rows={4}
                                    placeholder="Initial draft or notes..."
                                    className="w-full text-xs font-mono rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                                >
                                    {isCreating ? "Creating..." : "Create Document"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modals */}
            {historyDoc && (
                <VersionHistoryModal
                    document={historyDoc}
                    isOpen={!!historyDoc}
                    onClose={() => setHistoryDoc(null)}
                />
            )}

            {forceUnlockDoc && (
                <ForceUnlockModal
                    document={forceUnlockDoc}
                    isOpen={!!forceUnlockDoc}
                    onClose={() => setForceUnlockDoc(null)}
                    onUnlocked={() => {
                        setForceUnlockDoc(null);
                        fetchDocuments();
                    }}
                />
            )}
        </div>
    );
}
