"use client";
import { useState } from "react";
import { Certification, CertificationCategory, CertificationLevel, CertificateType } from "@/types";
import { X, Check, Globe, Shield, Cpu, Briefcase, Zap, ShieldAlert, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface CertificationFormProps {
    initialData?: Partial<Certification>;
    onSuccess: (cert: Certification) => void;
    onCancel: () => void;
}

const CATEGORIES: CertificationCategory[] = [
    "TECHNICAL", "TESTING", "CLOUD", "SECURITY", "AI", "DEVOPS", "MANAGEMENT", "SOFT_SKILL"
];

const LEVELS: CertificationLevel[] = ["FOUNDATION", "ASSOCIATE", "PROFESSIONAL", "EXPERT"];
const TYPES: CertificateType[] = ["INTERNAL", "EXTERNAL"];

export function CertificationForm({ initialData, onSuccess, onCancel }: CertificationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        code: initialData?.code || "",
        provider: initialData?.provider || "",
        category: initialData?.category || "TECHNICAL" as CertificationCategory,
        level: initialData?.level || "ASSOCIATE" as CertificationLevel,
        certificate_type: initialData?.certificate_type || "EXTERNAL" as CertificateType,
        validity_period_months: initialData?.validity_period_months || 36,
        cost: initialData?.cost || 0,
        currency: initialData?.currency || "USD",
        exam_url: initialData?.exam_url || "",
        description: initialData?.description || "",
        is_active: initialData?.is_active ?? true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = initialData?.id ? "PUT" : "POST";
            const payload = initialData?.id ? { ...formData, id: initialData.id } : formData;
            
            const res = await fetch("/api/certifications", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(initialData?.id ? "Certification updated!" : "Certification added!");
                onSuccess(data.certification || payload);
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save certification");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Award className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">{initialData?.id ? "Edit Certification" : "Add New Certification"}</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">Catalog Management</p>
                    </div>
                </div>
                <button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Certification Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. AWS Certified Solutions Architect"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Code</label>
                                <input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. AWS-SAA"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Provider</label>
                                <input
                                    required
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. AWS, Microsoft"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CertificationCategory })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value as CertificationLevel })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                <select
                                    value={formData.certificate_type}
                                    onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value as CertificateType })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                >
                                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Validity (Months)</label>
                                <input
                                    type="number"
                                    value={formData.validity_period_months}
                                    onChange={(e) => setFormData({ ...formData, validity_period_months: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="0 for lifelong"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cost</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Exam URL</label>
                                <input
                                    value={formData.exam_url}
                                    onChange={(e) => setFormData({ ...formData, exam_url: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm min-h-[92px]"
                                placeholder="Brief overview of the certification..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Active in Catalog</span>
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {initialData?.id ? "Update Certification" : "Create Certification"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
