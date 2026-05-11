"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Plus, 
    Trash2, 
    Copy, 
    MoreVertical, 
    Eye, 
    Settings as SettingsIcon, 
    MessageSquare, 
    User, 
    AtSign, 
    ChevronDown, 
    GripVertical,
    CircleDot,
    AlignLeft,
    CheckSquare,
    ChevronRight,
    Search,
    Share2,
    Calendar,
    Type,
    Layout,
    AlignJustify,
    ChevronDownCircle,
    UploadCloud,
    Star,
    Grid,
    Grid3X3,
    Clock,
    MoveHorizontal,
    ChevronLeft,
    Activity,
    Check,
    Loader2
} from "lucide-react";
import { Survey, SurveyQuestion, QuestionType } from "@/types";

type Tab = "questions" | "responses" | "settings";

const QUESTION_TYPES: { value: QuestionType; label: string; icon: any }[] = [
    { value: "short_answer", label: "Short answer", icon: AlignLeft },
    { value: "paragraph", label: "Paragraph", icon: AlignJustify },
    { value: "multiple_choice", label: "Multiple choice", icon: CircleDot },
    { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
    { value: "dropdown", label: "Dropdown", icon: ChevronDownCircle },
    { value: "file_upload", label: "File upload", icon: UploadCloud },
    { value: "linear_scale", label: "Linear scale", icon: MoveHorizontal },
    { value: "rating", label: "Rating", icon: Star },
    { value: "multiple_choice_grid", label: "Multiple choice grid", icon: Grid },
    { value: "checkbox_grid", label: "Checkbox grid", icon: Grid3X3 },
    { value: "date", label: "Date", icon: Calendar },
    { value: "time", label: "Time", icon: Clock },
];

const DEFAULT_SURVEY: Partial<Survey> = {
    title: "Untitled form",
    description: "",
    questions: [
        {
            id: "q1",
            order_index: 0,
            type: "multiple_choice",
            question: "Untitled Question",
            required: false,
            options: ["Option 1"]
        }
    ],
    is_anonymous: true,
    status: "Draft",
    audience: "All"
};

export default function SurveyDesigner() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("questions");
    const [survey, setSurvey] = useState<Partial<Survey>>(DEFAULT_SURVEY);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>("q1");
    const [showList, setShowList] = useState(true);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [responses, setResponses] = useState<any[]>([]);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        if (activeTab === "responses" && survey.id) {
            fetchResponses();
        }
    }, [activeTab, survey.id]);

    const fetchSurveys = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/surveys");
            const data = await res.json();
            if (data.surveys) setSurveys(data.surveys);
        } catch (err) {
            console.error("Failed to fetch surveys", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResponses = async () => {
        try {
            const res = await fetch(`/api/surveys/responses?survey_id=${survey.id}`);
            const data = await res.json();
            if (data.responses) setResponses(data.responses);
        } catch (err) {
            console.error("Failed to fetch responses", err);
        }
    };

    const handleSave = async () => {
        if (!survey.title?.trim()) return alert("Please enter a title");
        setIsSaving(true);
        try {
            const isNew = !survey.id;
            const res = await fetch("/api/surveys", {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(survey),
            });
            if (!res.ok) throw new Error("Failed to save");
            
            const data = await res.json();
            alert(isNew ? "Created successfully!" : "Updated successfully!");
            fetchSurveys();
            if (isNew && data.survey) {
                setSurvey(data.survey);
            }
            setShowList(true);
        } catch (err) {
            alert("Error saving survey");
        } finally {
            setIsSaving(false);
        }
    };

    const copyShareLink = () => {
        if (!survey.id) return alert("Please save the survey first before sharing.");
        const url = `${window.location.origin}/surveys/view/${survey.id}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this survey?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/surveys?id=${id}`, { method: "DELETE" });
            setSurveys(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert("Error deleting survey");
        } finally {
            setIsLoading(false);
        }
    };

    const editSurvey = (s: Survey) => {
        setSurvey({
            ...s,
            questions: s.questions.map(q => ({ ...q, options: q.options || [] }))
        });
        setActiveQuestionId(s.questions[0]?.id || null);
        setShowList(false);
    };

    const createNew = () => {
        setSurvey(DEFAULT_SURVEY);
        setActiveQuestionId("q1");
        setShowList(false);
    };

    const addQuestion = () => {
        const newId = `q${Date.now()}`;
        const newQuestion: SurveyQuestion = {
            id: newId,
            order_index: (survey.questions?.length || 0),
            type: "multiple_choice",
            question: "",
            required: false,
            options: ["Option 1"]
        };
        setSurvey(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQuestion]
        }));
        setActiveQuestionId(newId);
    };

    const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
        setSurvey(prev => ({
            ...prev,
            questions: prev.questions?.map(q => q.id === id ? { ...q, ...updates } : q)
        }));
    };

    const deleteQuestion = (id: string) => {
        setSurvey(prev => ({
            ...prev,
            questions: prev.questions?.filter(q => q.id !== id)
        }));
    };

    const addOption = (qId: string) => {
        setSurvey(prev => ({
            ...prev,
            questions: prev.questions?.map(q => 
                q.id === qId ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] } : q
            )
        }));
    };

    if (showList) {
        return (
            <div className="min-h-screen bg-[#f8f9fa]">
                <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded text-white">
                            <Layout size={20} />
                        </div>
                        <span className="text-xl font-medium text-gray-700">Surveys</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600" size={18} />
                            <input className="bg-gray-100 focus:bg-white border-transparent focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-lg pl-10 pr-4 py-2 w-[400px] transition-all outline-none text-sm" placeholder="Search forms" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">T</div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto py-8 px-6">
                    {/* Template Section */}
                    <section className="mb-12">
                        <h2 className="text-sm font-medium text-gray-600 mb-4">Start a new form</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                            <button onClick={createNew} className="group">
                                <div className="aspect-[3/4] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all shadow-sm">
                                    <Plus size={48} className="text-purple-600" />
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-700 text-left">Blank</p>
                            </button>
                            {/* Dummy templates */}
                            {["Contact Info", "RSVP", "Party Invite", "T-Shirt Sign Up", "Event Feedback"].map(t => (
                                <div key={t} className="group opacity-50 cursor-not-allowed">
                                    <div className="aspect-[3/4] bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-[10px] text-purple-300 font-bold uppercase rotate-[-20deg]">Template</div>
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-gray-700 text-left">{t}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Forms */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-medium text-gray-700">Recent forms</h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><GripVertical size={18} /></button>
                                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-purple-600" size={32} />
                                <p className="text-gray-500 text-sm">Loading your forms...</p>
                            </div>
                        ) : surveys.length === 0 ? (
                            <div className="bg-white rounded-lg border border-dashed border-gray-300 py-20 flex flex-col items-center gap-4">
                                <Activity className="text-gray-300" size={64} />
                                <p className="text-gray-500">No forms found. Create your first one!</p>
                                <button onClick={createNew} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">Create blank form</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {surveys.map(s => (
                                    <div key={s.id} onClick={() => editSurvey(s)} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-purple-600 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                        <div className="aspect-[16/9] bg-purple-50 flex items-center justify-center border-b border-gray-100">
                                            <Layout className="text-purple-200" size={48} />
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-800 truncate">{s.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Layout size={12} className="text-purple-600" />
                                                    <span className="text-[10px] text-gray-500 font-medium">Opened 10:24 AM</span>
                                                </div>
                                            </div>
                                            <div className="relative group/menu">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} 
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0ebf8] font-sans text-[#202124]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-[#dadce0]">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowList(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors mr-1">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="p-2 bg-purple-600 rounded text-white hidden sm:block">
                            <Layout size={16} />
                        </div>
                        <h1 className="text-lg font-medium truncate max-w-[300px]">
                            {survey.title || "Untitled form"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={copyShareLink} className="p-2 hover:bg-gray-100 rounded-full text-purple-600 transition-colors" title="Copy Share Link">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Eye size={20} />
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white px-6 py-2 rounded font-medium text-sm transition-colors ml-2 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Save
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors ml-2">
                            <MoreVertical size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold ml-4">T</div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex justify-center border-t border-[#dadce0]">
                    <div className="flex gap-8 px-4">
                        {(["questions", "responses", "settings"] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-3 px-4 text-sm font-medium transition-colors ${
                                    activeTab === tab ? "text-purple-700" : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-700 rounded-t-lg" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="max-w-[770px] mx-auto py-4 px-4 sm:px-0">
                
                {activeTab === "questions" && (
                    <div className="space-y-4">
                        {/* Survey Header Card */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-8 border-purple-700">
                            <div className="p-6">
                                <input 
                                    className="w-full text-3xl font-normal border-b border-transparent focus:border-gray-200 focus:outline-none pb-2 transition-all"
                                    value={survey.title}
                                    onChange={(e) => setSurvey({...survey, title: e.target.value})}
                                    placeholder="Form title"
                                />
                                <textarea 
                                    className="w-full mt-4 text-sm border-b border-transparent focus:border-gray-200 focus:outline-none resize-none transition-all"
                                    value={survey.description}
                                    onChange={(e) => setSurvey({...survey, description: e.target.value})}
                                    placeholder="Form description"
                                    rows={1}
                                />
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="relative">
                            <div className="space-y-4">
                                {survey.questions?.map((q, idx) => (
                                    <div 
                                        key={q.id}
                                        onClick={() => setActiveQuestionId(q.id)}
                                        className={`bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 overflow-hidden ${
                                            activeQuestionId === q.id ? "border-blue-500 scale-[1.01] shadow-md" : "border-transparent"
                                        }`}
                                    >
                                        <div className="flex justify-center py-1 opacity-50 cursor-grab">
                                            <GripVertical size={16} />
                                        </div>
                                        
                                        <div className="p-6 pt-0">
                                            {activeQuestionId === q.id ? (
                                                /* Active State */
                                                <div className="space-y-6">
                                                    <div className="flex gap-6">
                                                        <input 
                                                            className="flex-1 bg-gray-50 p-4 border-b border-gray-300 focus:border-purple-700 focus:outline-none transition-all text-base"
                                                            value={q.question}
                                                            onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                                            placeholder="Question"
                                                        />
                                                        <div className="w-[200px] relative">
                                                            <select 
                                                                className="w-full p-4 bg-white border border-gray-300 rounded focus:border-purple-700 focus:outline-none appearance-none text-sm cursor-pointer"
                                                                value={q.type}
                                                                onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                                                            >
                                                                {QUESTION_TYPES.map(type => (
                                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                                <ChevronDown size={16} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Options Area */}
                                                    <div className="space-y-3">
                                                        {(q.type === "multiple_choice" || q.type === "checkbox" || q.type === "dropdown") && (
                                                            <>
                                                                {q.options?.map((opt, optIdx) => (
                                                                    <div key={optIdx} className="flex items-center gap-3">
                                                                        {q.type === "multiple_choice" && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                                                                        {q.type === "checkbox" && <div className="w-5 h-5 border-2 border-gray-300 rounded" />}
                                                                        {q.type === "dropdown" && <span className="text-gray-400 text-xs w-5 text-center">{optIdx + 1}</span>}
                                                                        <input 
                                                                            className="flex-1 border-b border-transparent focus:border-gray-300 focus:outline-none py-1 text-sm"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...(q.options || [])];
                                                                                newOpts[optIdx] = e.target.value;
                                                                                updateQuestion(q.id, { options: newOpts });
                                                                            }}
                                                                        />
                                                                        <button 
                                                                            onClick={() => {
                                                                                const newOpts = q.options?.filter((_, i) => i !== optIdx);
                                                                                updateQuestion(q.id, { options: newOpts });
                                                                            }}
                                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <Plus className="rotate-45" size={20} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center gap-3 text-gray-500">
                                                                    {q.type === "multiple_choice" && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                                                                    {q.type === "checkbox" && <div className="w-5 h-5 border-2 border-gray-300 rounded" />}
                                                                    {q.type === "dropdown" && <span className="text-gray-400 text-xs w-5 text-center">{(q.options?.length || 0) + 1}</span>}
                                                                    <button 
                                                                        onClick={() => addOption(q.id)}
                                                                        className="text-sm hover:underline"
                                                                    >
                                                                        Add option
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                        {q.type === "short_answer" && (
                                                            <div className="text-gray-400 border-b border-gray-200 border-dashed pb-2 text-sm w-[60%]">
                                                                Short answer text
                                                            </div>
                                                        )}
                                                        {q.type === "paragraph" && (
                                                            <div className="text-gray-400 border-b border-gray-200 border-dashed pb-2 text-sm w-[80%]">
                                                                Long answer text
                                                            </div>
                                                        )}
                                                        {q.type === "file_upload" && (
                                                            <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-gray-50">
                                                                <UploadCloud className="text-gray-400" size={32} />
                                                                <span className="text-xs text-gray-500">File upload enabled</span>
                                                            </div>
                                                        )}
                                                        {q.type === "linear_scale" && (
                                                            <div className="flex items-center gap-4 py-4">
                                                                <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs">
                                                                    <option>1</option>
                                                                </select>
                                                                <span className="text-xs text-gray-500">to</span>
                                                                <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs">
                                                                    <option>5</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                        {q.type === "rating" && (
                                                            <div className="flex items-center gap-2 py-2">
                                                                {[1,2,3,4,5].map(n => <Star key={n} className="text-gray-300" size={24} />)}
                                                            </div>
                                                        )}
                                                        {(q.type === "multiple_choice_grid" || q.type === "checkbox_grid") && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-400">Rows</span>
                                                                    <div className="text-sm text-gray-600 px-2 py-1 border-b border-gray-200">Row 1</div>
                                                                    <div className="text-xs text-blue-600">+ Add row</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-400">Columns</span>
                                                                    <div className="text-sm text-gray-600 px-2 py-1 border-b border-gray-200">Column 1</div>
                                                                    <div className="text-xs text-blue-600">+ Add column</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {q.type === "date" && (
                                                            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-200 pb-2 w-40">
                                                                <Calendar size={18} />
                                                                <span className="text-sm">Month, day, year</span>
                                                            </div>
                                                        )}
                                                        {q.type === "time" && (
                                                            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-200 pb-2 w-40">
                                                                <Clock size={18} />
                                                                <span className="text-sm">Time</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Actions */}
                                                    <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-6 text-gray-500">
                                                        <button className="hover:text-gray-900 transition-colors"><Copy size={20} /></button>
                                                        <button onClick={() => deleteQuestion(q.id)} className="hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                                                        <div className="h-6 w-[1px] bg-gray-300 mx-1" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">Required</span>
                                                            <div 
                                                                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${q.required ? "bg-purple-200" : "bg-gray-300"}`}
                                                                onClick={() => updateQuestion(q.id, { required: !q.required })}
                                                            >
                                                                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-all ${q.required ? "right-[-4px] bg-purple-700" : "left-[-4px] bg-white"}`} />
                                                            </div>
                                                        </div>
                                                        <button className="hover:text-gray-900 transition-colors"><MoreVertical size={20} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Inactive State */
                                                <div className="space-y-2">
                                                    <div className="text-base font-normal">{q.question || "Untitled Question"}</div>
                                                    <div className="space-y-2">
                                                        {(q.type === "multiple_choice" || q.type === "checkbox" || q.type === "dropdown") && q.options?.map((opt, i) => (
                                                            <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                                                {q.type === "multiple_choice" && <div className="w-4 h-4 border border-gray-400 rounded-full" />}
                                                                {q.type === "checkbox" && <div className="w-4 h-4 border border-gray-400 rounded" />}
                                                                {q.type === "dropdown" && <span className="text-xs text-gray-400">{i + 1}.</span>}
                                                                {opt}
                                                            </div>
                                                        ))}
                                                        {q.type === "short_answer" && (
                                                            <div className="text-gray-400 border-b border-gray-200 border-dashed pb-1 text-sm w-[60%]">
                                                                Short answer text
                                                            </div>
                                                        )}
                                                        {q.type === "paragraph" && (
                                                            <div className="text-gray-400 border-b border-gray-200 border-dashed pb-1 text-sm w-[80%]">
                                                                Long answer text
                                                            </div>
                                                        )}
                                                        {q.type === "rating" && (
                                                            <div className="flex gap-1">
                                                                {[1,2,3,4,5].map(n => <Star key={n} className="text-gray-300" size={16} />)}
                                                            </div>
                                                        )}
                                                        {q.type === "date" && <div className="text-sm text-gray-400">Month, day, year</div>}
                                                        {q.type === "time" && <div className="text-sm text-gray-400">Time</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Toolbar */}
                            <div className="hidden sm:flex absolute left-full ml-4 top-0 flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-2">
                                <button onClick={addQuestion} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add question"><Plus size={24} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Import questions"><Share2 size={24} className="rotate-90" /></button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add title and description"><Type size={24} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add image"><Layout size={24} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add video"><Layout size={24} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add section"><Layout size={24} /></button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "responses" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-2xl font-normal text-gray-900">{responses.length} responses</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchResponses} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                        <Activity size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {responses.length === 0 ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 flex flex-col items-center gap-4">
                                    <MessageSquare className="text-gray-300" size={64} />
                                    <p className="text-gray-500">Waiting for responses</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {survey.questions?.map(q => (
                                        <div key={q.id} className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-base font-medium mb-4">{q.question}</h3>
                                            
                                            <div className="space-y-2">
                                                {responses.filter(r => r.answers[q.id] !== undefined).map((res, i) => (
                                                    <div key={i} className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {Array.isArray(res.answers[q.id]) 
                                                                    ? res.answers[q.id].join(", ") 
                                                                    : String(res.answers[q.id])}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {res.respondent_email || "Anonymous"} • {new Date(res.submitted_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {responses.filter(r => r.answers[q.id] !== undefined).length === 0 && (
                                                    <div className="text-sm text-gray-400 italic">No answers for this question yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                        <div className="p-6">
                            <h2 className="text-base font-medium text-gray-900 mb-6">General</h2>
                            <div className="space-y-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">Make this a quiz</div>
                                        <div className="text-xs text-gray-500 mt-1">Assign point values, set answers, and automatically provide feedback</div>
                                    </div>
                                    <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[-4px] w-6 h-6 bg-white rounded-full shadow-md" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <AtSign size={18} />
                                        <span className="text-sm font-medium">Responses</span>
                                        <ChevronDown size={16} />
                                    </div>
                                    <div className="pl-6 space-y-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-800">Collect email addresses</div>
                                            </div>
                                            <div 
                                                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${!survey.is_anonymous ? "bg-purple-200" : "bg-gray-300"}`}
                                                onClick={() => setSurvey({...survey, is_anonymous: !survey.is_anonymous})}
                                            >
                                                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-all ${!survey.is_anonymous ? "right-[-4px] bg-purple-700" : "left-[-4px] bg-white"}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="h-20" />
            </main>
        </div>
    );
}
