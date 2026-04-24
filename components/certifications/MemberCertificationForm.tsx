"use client";
import { useState, useEffect } from "react";
import { Certification, MemberCertification, MemberCertificationStatus, LearningMethod, CertificationPriority, Resource } from "@/types";
import { X, Check, Calendar, TrendingUp, User, Award, List, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface MemberCertificationFormProps {
    initialData?: Partial<MemberCertification>;
    members: Resource[];
    certifications: Certification[];
    onSuccess: (mc: MemberCertification) => void;
    onCancel: () => void;
}

const STATUSES: MemberCertificationStatus[] = ["PLANNED", "LEARNING", "SCHEDULED", "PASSED", "FAILED", "EXPIRED"];
const METHODS: LearningMethod[] = ["SELF_STUDY", "COURSE", "BOOTCAMP", "MENTORING"];
const PRIORITIES: CertificationPriority[] = ["LOW", "MEDIUM", "HIGH"];

export function MemberCertificationForm({ initialData, members, certifications, onSuccess, onCancel }: MemberCertificationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        member_id: initialData?.member_id || "",
        certification_id: initialData?.certification_id || "",
        status: initialData?.status || "PLANNED" as MemberCertificationStatus,
        progress_percent: initialData?.progress_percent || 0,
        start_date: initialData?.start_date || "",
        target_exam_date: initialData?.target_exam_date || "",
        actual_exam_date: initialData?.actual_exam_date || "",
        expiry_date: initialData?.expiry_date || "",
        attempt_count: initialData?.attempt_count || 0,
        score: initialData?.score || 0,
        certificate_number: initialData?.certificate_number || "",
        learning_method: initialData?.learning_method || "SELF_STUDY" as LearningMethod,
        priority: initialData?.priority || "MEDIUM" as CertificationPriority,
        is_mandatory: initialData?.is_mandatory || false,
        estimated_cost: initialData?.estimated_cost || 0,
        actual_cost: initialData?.actual_cost || 0,
        manager_note: initialData?.manager_note || "",
        member_note: initialData?.member_note || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.member_id || !formData.certification_id) {
            toast.error("Please select both member and certification");
            return;
        }
        setIsLoading(true);
        try {
            const method = initialData?.id ? "PUT" : "POST";
            const payload = initialData?.id ? { ...formData, id: initialData.id } : formData;

            const res = await fetch("/api/member-certifications", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(initialData?.id ? "Record updated!" : "Certification assigned!");
                onSuccess(data.memberCertification || payload);
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">{initialData?.id ? "Update Progress" : "Add Certification"}</h3>
                        <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest leading-none">Tracking Management</p>
                    </div>
                </div>
                <button onClick={onCancel} className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-indigo-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Member & Cert Selection */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Member (Resource)</label>
                            <div className="relative">
                                <select
                                    required
                                    disabled={!!initialData?.id}
                                    value={formData.member_id}
                                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Member...</option>
                                    {members.map(m => <option key={m.employee_id} value={m.employee_id}>{m.name} ({m.employee_id})</option>)}
                                </select>
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Certification</label>
                            <div className="relative">
                                <select
                                    required
                                    disabled={!!initialData?.id}
                                    value={formData.certification_id}
                                    onChange={(e) => setFormData({ ...formData, certification_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Certification...</option>
                                    {certifications.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberCertificationStatus })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-bold text-indigo-600"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Progress (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.progress_percent}
                                        onChange={(e) => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as CertificationPriority })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                >
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                                <select
                                    value={formData.learning_method}
                                    onChange={(e) => setFormData({ ...formData, learning_method: e.target.value as LearningMethod })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                >
                                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Dates */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Target Date</label>
                                <input
                                    type="date"
                                    value={formData.target_exam_date}
                                    onChange={(e) => setFormData({ ...formData, target_exam_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Actual Exam Date</label>
                                <input
                                    type="date"
                                    value={formData.actual_exam_date}
                                    onChange={(e) => setFormData({ ...formData, actual_exam_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expiry_date}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Attempt Count</label>
                                <input
                                    type="number"
                                    value={formData.attempt_count}
                                    onChange={(e) => setFormData({ ...formData, attempt_count: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Score</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.score}
                                    onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Certificate Number</label>
                            <input
                                value={formData.certificate_number}
                                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                placeholder="e.g. AWS-12345-6789"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Note</label>
                        <textarea
                            value={formData.manager_note}
                            onChange={(e) => setFormData({ ...formData, manager_note: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm min-h-[60px]"
                            placeholder="Add manager internal notes here..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.is_mandatory}
                            onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            Mandatory for this role
                        </span>
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
                            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {initialData?.id ? "Update" : "Add"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
