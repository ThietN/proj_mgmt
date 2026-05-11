"use client";
import { useState } from "react";
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
    MoveHorizontal
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

export default function SurveyDesigner() {
    const [activeTab, setActiveTab] = useState<Tab>("questions");
    const [survey, setSurvey] = useState<Partial<Survey>>({
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
    });

    const [activeQuestionId, setActiveQuestionId] = useState<string | null>("q1");

    // Mock responses for the "Responses" tab
    const mockResponses = [
        { email: "john.doe@example.com", answers: { "q1": "Option 1" }, date: "2024-05-10" },
        { email: "alice.smith@example.com", answers: { "q1": "Option 2" }, date: "2024-05-11" },
        { email: "bob.wilson@example.com", answers: { "q1": "Option 1" }, date: "2024-05-11" },
    ];

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

    return (
        <div className="min-h-screen bg-[#f0ebf8] font-sans text-[#202124]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-[#dadce0]">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg text-white">
                            <Layout size={20} />
                        </div>
                        <h1 className="text-xl font-medium truncate max-w-[300px]">
                            {survey.title || "Untitled form"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Eye size={20} />
                        </button>
                        <button className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded font-medium text-sm transition-colors ml-2">
                            Send
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors ml-2">
                            <MoreVertical size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold ml-4">
                            T
                        </div>
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
                                    <h2 className="text-2xl font-normal text-gray-900">{mockResponses.length} responses</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 text-green-700 font-medium text-sm hover:bg-green-50 px-3 py-2 rounded">
                                        <Layout size={16} /> Link to Sheets
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Response Stats / Summary (simplified) */}
                            <div className="space-y-8">
                                {survey.questions?.map(q => (
                                    <div key={q.id} className="border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-base font-medium mb-4">{q.question}</h3>
                                        <div className="text-xs text-gray-500 mb-4">{mockResponses.length} responses</div>
                                        
                                        {/* Inline Responses */}
                                        <div className="space-y-2">
                                            {mockResponses.map((res, i) => (
                                                <div key={i} className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{res.answers[q.id as keyof typeof res.answers] || "No answer"}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{res.email} • {res.date}</div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600"><ChevronRight size={18} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                                <div className="text-xs text-gray-500 mt-1">Require users to sign in to respond</div>
                                            </div>
                                            <div 
                                                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${!survey.is_anonymous ? "bg-purple-200" : "bg-gray-300"}`}
                                                onClick={() => setSurvey({...survey, is_anonymous: !survey.is_anonymous})}
                                            >
                                                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-all ${!survey.is_anonymous ? "right-[-4px] bg-purple-700" : "left-[-4px] bg-white"}`} />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-800">Limit to 1 response</div>
                                            </div>
                                            <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                                                <div className="absolute top-1/2 -translate-y-1/2 left-[-4px] w-6 h-6 bg-white rounded-full shadow-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="text-base font-medium text-gray-900 mb-6">Presentation</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Layout size={18} />
                                    <span className="text-sm font-medium">Form defaults</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Footer Padding */}
                <div className="h-20" />
            </main>
        </div>
    );
}
