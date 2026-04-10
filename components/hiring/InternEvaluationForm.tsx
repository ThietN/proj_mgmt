"use client";
import { FinalGrade, Intern, InternEvaluation } from "@/types";
import { useState } from "react";
import { Check, X, Star } from "lucide-react";
import toast from "react-hot-toast";


interface InternEvaluationFormProps {
    intern: Intern;
    onClose: () => void;
    onSuccess: () => void;
}

const grades: FinalGrade[] = ["Excellent", "Good", "Fair", "Average", "Poor"];

export function InternEvaluationForm({ intern, onClose, onSuccess }: InternEvaluationFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<InternEvaluation>>(
        intern.evaluation || {
            intern_id: intern.id,
            technical_score: 5,
            technical_note: "",
            soft_skill_score: 5,
            soft_skill_note: "",
            attitude_score: 5,
            attitude_note: "",
            english_score: 5,
            final_grade: "Average",
        }
    );


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/interns/evaluation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("Evaluation submitted successfully!");
                onSuccess();
            } else {
                toast.error("Failed to submit evaluation");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "An error occurred");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-springIn">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Assessment</h3>
                        <p className="text-[10px] text-slate-400 font-bold">Evaluating: {intern.full_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Technical Skills */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Skills (1-10)</label>
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.technical_score}</span>
                        </div>
                        <input
                            type="range" min="1" max="10" step="1"
                            value={formData.technical_score}
                            onChange={(e) => setFormData({ ...formData, technical_score: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <textarea
                            placeholder="Add technical skill notes..."
                            value={formData.technical_note}
                            onChange={(e) => setFormData({ ...formData, technical_note: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-400 focus:bg-white min-h-[60px]"
                        />
                    </div>

                    {/* Soft Skills */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soft Skills (1-10)</label>
                            <span className="text-sm font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">{formData.soft_skill_score}</span>
                        </div>
                        <input
                            type="range" min="1" max="10" step="1"
                            value={formData.soft_skill_score}
                            onChange={(e) => setFormData({ ...formData, soft_skill_score: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        />
                        <textarea
                            placeholder="Add soft skill notes..."
                            value={formData.soft_skill_note}
                            onChange={(e) => setFormData({ ...formData, soft_skill_note: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-400 focus:bg-white min-h-[60px]"
                        />
                    </div>

                    {/* Attitude */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attitude (1-10)</label>
                            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{formData.attitude_score}</span>
                        </div>
                        <input
                            type="range" min="1" max="10" step="1"
                            value={formData.attitude_score}
                            onChange={(e) => setFormData({ ...formData, attitude_score: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <textarea
                            placeholder="Add attitude notes..."
                            value={formData.attitude_note}
                            onChange={(e) => setFormData({ ...formData, attitude_note: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:bg-white min-h-[60px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* English */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">English Score (1-10)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min="1" max="10"
                                    value={formData.english_score}
                                    onChange={(e) => setFormData({ ...formData, english_score: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-400"
                                />
                            </div>
                        </div>

                        {/* Final Grade */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final Grade</label>
                            <select
                                value={formData.final_grade}
                                onChange={(e) => setFormData({ ...formData, final_grade: e.target.value as FinalGrade })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-400 font-bold"
                            >
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                            Submit Evaluation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
