"use client";
import { useState, useEffect } from "react";
import { Survey, SurveyQuestion } from "@/types";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SurveyParticipantView({ surveyId }: { surveyId: string }) {
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSurvey();
    }, [surveyId]);

    const fetchSurvey = async () => {
        try {
            const res = await fetch("/api/surveys");
            const data = await res.json();
            const found = data.surveys?.find((s: any) => s.id === surveyId);
            if (found) {
                setSurvey(found);
            } else {
                setError("Survey not found");
            }
        } catch (err) {
            setError("Failed to load survey");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for required questions
        if (survey?.questions) {
            for (const q of survey.questions) {
                if (q.required && !answers[q.id]) {
                    return toast.error(`Please answer: ${q.question}`);
                }
            }
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/surveys/responses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    survey_id: surveyId,
                    respondent_email: survey?.is_anonymous ? null : email,
                    answers: answers
                }),
            });

            if (!res.ok) throw new Error("Failed to submit");
            setIsSubmitted(true);
            toast.success("Response submitted!");
        } catch (err) {
            toast.error("Error submitting response");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-purple-700" size={48} />
                <p className="text-purple-900 font-medium">Loading survey...</p>
            </div>
        );
    }

    if (error || !survey) {
        return (
            <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center gap-4 p-4 text-center">
                <AlertCircle className="text-red-500" size={64} />
                <h1 className="text-2xl font-bold text-gray-800">{error || "Something went wrong"}</h1>
                <p className="text-gray-600 max-w-md">The survey you are looking for might have been deleted or the link is incorrect.</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center gap-6 p-4 text-center">
                <div className="bg-white rounded-lg shadow-md p-10 max-w-lg w-full flex flex-col items-center gap-4 border-t-8 border-purple-700">
                    <CheckCircle2 className="text-green-500" size={64} />
                    <h1 className="text-3xl font-bold text-gray-800">{survey.title}</h1>
                    <p className="text-gray-600">Your response has been recorded.</p>
                    <button 
                        onClick={() => { setIsSubmitted(false); setAnswers({}); }}
                        className="text-purple-700 font-medium hover:underline mt-4"
                    >
                        Submit another response
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0ebf8] py-8 px-4">
            <div className="max-w-[770px] mx-auto space-y-4">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-8 border-purple-700">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{survey.description}</p>
                        {!survey.is_anonymous && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="w-full md:w-1/2 border-b border-gray-300 focus:border-purple-700 focus:outline-none py-2 transition-all"
                                />
                            </div>
                        )}
                        {survey.is_anonymous && (
                            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 border border-gray-100 italic">
                                This survey is anonymous. Your email will not be recorded.
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pb-20">
                    {survey.questions.map((q) => (
                        <div key={q.id} className="bg-white rounded-lg shadow-sm p-6 space-y-4 border border-gray-200">
                            <div className="text-base font-medium text-gray-900 flex gap-1">
                                {q.question}
                                {q.required && <span className="text-red-500">*</span>}
                            </div>

                            <div className="space-y-3">
                                {(q.type === "multiple_choice" || q.type === "dropdown") && (
                                    <div className="space-y-2">
                                        {q.options?.map((opt, i) => (
                                            <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                                <input 
                                                    type="radio" 
                                                    name={q.id}
                                                    required={q.required}
                                                    onChange={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === "checkbox" && (
                                    <div className="space-y-2">
                                        {q.options?.map((opt, i) => (
                                            <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    onChange={(e) => {
                                                        const current = answers[q.id] || [];
                                                        const next = e.target.checked 
                                                            ? [...current, opt]
                                                            : current.filter((v: string) => v !== opt);
                                                        setAnswers(p => ({ ...p, [q.id]: next }));
                                                    }}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === "short_answer" && (
                                    <input 
                                        type="text" 
                                        required={q.required}
                                        placeholder="Your answer"
                                        onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                                        className="w-full md:w-3/4 border-b border-gray-300 focus:border-purple-700 focus:outline-none py-2 transition-all text-sm"
                                    />
                                )}

                                {q.type === "paragraph" && (
                                    <textarea 
                                        required={q.required}
                                        placeholder="Your answer"
                                        rows={3}
                                        onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                                        className="w-full border-b border-gray-300 focus:border-purple-700 focus:outline-none py-2 transition-all text-sm resize-none"
                                    />
                                )}

                                {q.type === "rating" && (
                                    <div className="flex gap-4 items-center">
                                        {[1,2,3,4,5].map(n => (
                                            <button 
                                                key={n}
                                                type="button"
                                                onClick={() => setAnswers(p => ({ ...p, [q.id]: n }))}
                                                className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center font-medium ${
                                                    answers[q.id] === n 
                                                        ? "bg-purple-700 text-white border-purple-700" 
                                                        : "bg-white text-gray-600 border-gray-300 hover:border-purple-300"
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === "linear_scale" && (
                                    <div className="flex items-center justify-between max-w-md pt-2">
                                        <span className="text-xs text-gray-500">Not likely</span>
                                        <div className="flex gap-2">
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                <button 
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setAnswers(p => ({ ...p, [q.id]: n }))}
                                                    className={`w-8 h-8 rounded-lg border text-xs transition-all flex items-center justify-center font-medium ${
                                                        answers[q.id] === n 
                                                            ? "bg-purple-700 text-white border-purple-700" 
                                                            : "bg-white text-gray-600 border-gray-300 hover:border-purple-300"
                                                    }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">Very likely</span>
                                    </div>
                                )}

                                {q.type === "date" && (
                                    <input 
                                        type="date" 
                                        required={q.required}
                                        onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                                        className="border-b border-gray-300 focus:border-purple-700 focus:outline-none py-2 transition-all text-sm outline-none"
                                    />
                                )}

                                {q.type === "time" && (
                                    <input 
                                        type="time" 
                                        required={q.required}
                                        onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                                        className="border-b border-gray-300 focus:border-purple-700 focus:outline-none py-2 transition-all text-sm outline-none"
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white px-8 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            Submit
                        </button>
                        <button 
                            type="button"
                            onClick={() => setAnswers({})}
                            className="text-purple-700 hover:bg-purple-50 px-4 py-2 rounded transition-all text-sm font-medium"
                        >
                            Clear form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
