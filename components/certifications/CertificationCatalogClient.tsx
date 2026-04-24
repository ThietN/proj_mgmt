"use client";
import { useState } from "react";
import { Certification } from "@/types";
import { Search, Filter, Plus, Edit2, Trash2, Globe, Shield, Cpu, Briefcase, Zap, ShieldAlert, BadgeCheck, ExternalLink, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { CertificationForm } from "./CertificationForm";
import toast from "react-hot-toast";

interface CertificationCatalogClientProps {
    initialData: Certification[];
}

export function CertificationCatalogClient({ initialData }: CertificationCatalogClientProps) {
    const [certs, setCerts] = useState<Certification[]>(initialData);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);

    const filtered = certs.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                              c.code.toLowerCase().includes(search.toLowerCase()) ||
                              c.provider.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This will perform a soft delete.`)) return;
        try {
            const res = await fetch(`/api/certifications?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setCerts(certs.filter(c => c.id !== id));
                toast.success("Certification removed from catalog");
            } else {
                toast.error("Failed to delete certification");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search certifications..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 shadow-sm"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 shadow-sm"
                    >
                        <option value="all">All Categories</option>
                        <option value="TECHNICAL">Technical</option>
                        <option value="TESTING">Testing</option>
                        <option value="CLOUD">Cloud</option>
                        <option value="SECURITY">Security</option>
                        <option value="AI">AI / ML</option>
                        <option value="DEVOPS">DevOps</option>
                        <option value="MANAGEMENT">Management</option>
                    </select>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Certification
                </button>
            </div>

            {(isAdding || editingCert) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CertificationForm
                            initialData={editingCert || {}}
                            onSuccess={(newCert) => {
                                if (editingCert) {
                                    setCerts(certs.map(c => c.id === editingCert.id ? { ...c, ...newCert } : c));
                                } else {
                                    setCerts([newCert, ...certs]);
                                }
                                setIsAdding(false);
                                setEditingCert(null);
                            }}
                            onCancel={() => {
                                setIsAdding(false);
                                setEditingCert(null);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((cert) => (
                    <div key={cert.id} className="glass-card bg-white border-slate-200 group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300",
                                    cert.category === 'CLOUD' ? "bg-sky-500 shadow-sky-200" :
                                    cert.category === 'SECURITY' ? "bg-red-500 shadow-red-200" :
                                    cert.category === 'AI' ? "bg-violet-500 shadow-violet-200" :
                                    cert.category === 'TESTING' ? "bg-emerald-500 shadow-emerald-200" :
                                    "bg-blue-500 shadow-blue-200"
                                )}>
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cert.provider}</span>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 uppercase tracking-tight",
                                        cert.level === 'EXPERT' ? "bg-red-50 text-red-600 border-red-100" :
                                        cert.level === 'PROFESSIONAL' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                        "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {cert.level}
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {cert.name}
                            </h3>
                            <p className="text-[11px] font-mono font-bold text-slate-400 mb-2">{cert.code}</p>
                            
                            <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                                {cert.description || "No description provided."}
                            </p>
                            
                            <div className="flex items-center gap-4 border-t border-slate-50 pt-4 mt-auto">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validity</p>
                                    <p className="text-xs font-bold text-slate-700">{cert.validity_period_months ? `${cert.validity_period_months} Mo` : 'Life'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cost</p>
                                    <p className="text-xs font-bold text-slate-700">{cert.cost ? `${cert.cost} ${cert.currency}` : 'Free'}</p>
                                </div>
                                <div className="ml-auto">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                    <p className="text-xs font-bold text-slate-700">{cert.certificate_type}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingCert(cert)}
                                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cert.id, cert.name)}
                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {cert.exam_url && (
                                <a
                                    href={cert.exam_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700"
                                >
                                    Visit Exam <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {filtered.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No certifications found in the catalog.</p>
                </div>
            )}
        </div>
    );
}
