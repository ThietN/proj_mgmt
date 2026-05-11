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
    Loader2,
    AlertCircle
} from "lucide-react";
import { Survey, SurveyQuestion, QuestionType } from "@/types";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [responses, setResponses] = useState<any[]>([]);
    
    // Response deletion states
    const [respDeleteId, setRespDeleteId] = useState<string | null>(null);
    const [showDeleteAllResp, setShowDeleteAllResp] = useState(false);

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
        if (!survey.title?.trim()) return toast.error("Please enter a title");
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
            toast.success(isNew ? "New survey added!" : "Survey updated successfully!");
            fetchSurveys();
            if (isNew && data.survey) {
                setSurvey(data.survey);
            }
            setShowList(true);
        } catch (err) {
            toast.error("Failed to save survey.");
        } finally {
            setIsSaving(false);
        }
    };

    const copyShareLink = () => {
        if (!survey.id) return toast.error("Save the survey first!");
        const url = `${window.location.origin}/surveys/view/${survey.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setIsLoading(true);
        try {
            await fetch(`/api/surveys?id=${deleteConfirmId}`, { method: "DELETE" });
            setSurveys(prev => prev.filter(s => s.id !== deleteConfirmId));
            toast.success("Survey deleted successfully.");
            setDeleteConfirmId(null);
            setShowList(true); 
        } catch (err) {
            toast.error("Failed to delete survey.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteResponse = async () => {
        if (!respDeleteId) return;
        try {
            await fetch(`/api/surveys/responses?id=${respDeleteId}`, { method: "DELETE" });
            setResponses(prev => prev.filter(r => r.id !== respDeleteId));
            toast.success("Response deleted");
            setRespDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete response");
        }
    };

    const handleDeleteAllResponses = async () => {
        if (!survey.id) return;
        try {
            await fetch(`/api/surveys/responses?survey_id=${survey.id}`, { method: "DELETE" });
            setResponses([]);
            toast.success("All responses deleted");
            setShowDeleteAllResp(false);
        } catch (err) {
            toast.error("Failed to delete responses");
        }
    };

    const exportToExcel = () => {
        if (responses.length === 0) return toast.error("No responses to export");

        try {
            const data = responses.map(res => {
                const row: any = {
                    "Submitted At": new Date(res.submitted_at).toLocaleString(),
                    "Respondent": res.respondent_email || "Anonymous"
                };
                survey.questions?.forEach(q => {
                    let answer = res.answers[q.id];
                    if (Array.isArray(answer)) answer = answer.join(", ");
                    row[q.question] = answer || "";
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Responses");
            XLSX.writeFile(wb, `${survey.title || "Survey"}_Responses.xlsx`);
            toast.success("Excel file downloaded!");
        } catch (err) {
            console.error("Export failed", err);
            toast.error("Failed to export to Excel");
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

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(survey.questions || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index
        }));
        setSurvey(prev => ({ ...prev, questions: updatedItems }));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#202124]">
            {showList ? (
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
                        <section className="mb-12">
                            <h2 className="text-sm font-medium text-gray-600 mb-4">Start a new form</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                                <button onClick={createNew} className="group">
                                    <div className="aspect-[3/4] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all shadow-sm">
                                        <Plus size={48} className="text-purple-600" />
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-gray-700 text-left">Blank</p>
                                </button>
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

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-medium text-gray-700">Recent forms</h2>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><GripVertical size={18} /></button>
                                    <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            {isLoading && surveys.length === 0 ? (
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
                                                        <span className="text-[10px] text-gray-500 font-medium">{new Date(s.updated_at || s.created_at || Date.now()).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} 
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            ) : (
                <div className="min-h-screen bg-[#f0ebf8]">
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
                                {survey.id && (
                                    <button 
                                        onClick={() => handleDelete(survey.id!)}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
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

                    <main className="max-w-[770px] mx-auto py-4 px-4 sm:px-0">
                        {activeTab === "questions" && (
                            <div className="space-y-4">
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

                                <div className="flex items-start">
                                    <div className="flex-1">
                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <Droppable droppableId="questions-list">
                                                {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                        {survey.questions?.map((q, idx) => (
                                                            <Draggable key={q.id} draggableId={q.id} index={idx}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        onClick={() => setActiveQuestionId(q.id)}
                                                                        className={`bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 overflow-hidden ${activeQuestionId === q.id ? "border-blue-500 scale-[1.01] shadow-md" : "border-transparent"} ${snapshot.isDragging ? "shadow-2xl ring-2 ring-purple-400" : ""}`}
                                                                    >
                                                                        <div {...provided.dragHandleProps} className="flex justify-center py-1 opacity-50 cursor-grab active:cursor-grabbing hover:opacity-100 transition-opacity">
                                                                            <GripVertical size={16} />
                                                                        </div>
                                                                        <div className="p-6 pt-0">
                                                                            {activeQuestionId === q.id ? (
                                                                                <div className="space-y-6">
                                                                                    <div className="flex flex-col sm:flex-row gap-6">
                                                                                        <input className="flex-1 bg-gray-50 p-4 border-b border-gray-300 focus:border-purple-700 focus:outline-none transition-all text-base" value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })} placeholder="Question" />
                                                                                        <div className="w-full sm:w-[220px] relative">
                                                                                            <select className="w-full p-4 bg-white border border-gray-300 rounded focus:border-purple-700 focus:outline-none appearance-none text-sm cursor-pointer" value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}>
                                                                                                {QUESTION_TYPES.map(type => (
                                                                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                                                                <ChevronDown size={16} />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="space-y-3">
                                                                                        {(q.type === "multiple_choice" || q.type === "checkbox" || q.type === "dropdown") && (
                                                                                            <>
                                                                                                {q.options?.map((opt, optIdx) => (
                                                                                                    <div key={optIdx} className="flex items-center gap-3">
                                                                                                        {q.type === "multiple_choice" && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                                                                                                        {q.type === "checkbox" && <div className="w-5 h-5 border-2 border-gray-300 rounded" />}
                                                                                                        {q.type === "dropdown" && <span className="text-gray-400 text-xs w-5 text-center">{optIdx + 1}</span>}
                                                                                                        <input className="flex-1 border-b border-transparent focus:border-gray-300 focus:outline-none py-1 text-sm" value={opt} onChange={(e) => {
                                                                                                            const newOpts = [...(q.options || [])];
                                                                                                            newOpts[optIdx] = e.target.value;
                                                                                                            updateQuestion(q.id, { options: newOpts });
                                                                                                        }} />
                                                                                                        <button onClick={() => {
                                                                                                            const newOpts = q.options?.filter((_, i) => i !== optIdx);
                                                                                                            updateQuestion(q.id, { options: newOpts });
                                                                                                        }} className="p-1 text-gray-400 hover:text-gray-600">
                                                                                                            <Plus className="rotate-45" size={20} />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                ))}
                                                                                                <div className="flex items-center gap-3 text-gray-500">
                                                                                                    {q.type === "multiple_choice" && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                                                                                                    {q.type === "checkbox" && <div className="w-5 h-5 border-2 border-gray-300 rounded" />}
                                                                                                    {q.type === "dropdown" && <span className="text-gray-400 text-xs w-5 text-center">{(q.options?.length || 0) + 1}</span>}
                                                                                                    <button onClick={() => addOption(q.id)} className="text-sm hover:underline">Add option</button>
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                        {q.type === "short_answer" && <div className="text-gray-400 border-b border-gray-200 border-dashed pb-2 text-sm w-[60%]">Short answer text</div>}
                                                                                        {q.type === "paragraph" && <div className="text-gray-400 border-b border-gray-200 border-dashed pb-2 text-sm w-[80%]">Long answer text</div>}
                                                                                    </div>
                                                                                    <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-6 text-gray-500">
                                                                                        <button className="hover:text-gray-900 transition-colors"><Copy size={20} /></button>
                                                                                        <button onClick={() => deleteQuestion(q.id)} className="hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                                                                                        <div className="h-6 w-[1px] bg-gray-300 mx-1" />
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-sm">Required</span>
                                                                                            <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${q.required ? "bg-purple-200" : "bg-gray-300"}`} onClick={() => updateQuestion(q.id, { required: !q.required })}>
                                                                                                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-all ${q.required ? "right-[-4px] bg-purple-700" : "left-[-4px] bg-white"}`} />
                                                                                            </div>
                                                                                        </div>
                                                                                        <button className="hover:text-gray-900 transition-colors"><MoreVertical size={20} /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                    <div className="text-base font-normal">{q.question || "Untitled Question"}</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>
                                    <div className="hidden sm:flex sticky top-24 self-start ml-4 flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-2 h-fit">
                                        <button onClick={addQuestion} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add question"><Plus size={24} /></button>
                                        <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Add title and description"><Type size={24} /></button>
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
                                            <button onClick={exportToExcel} className="flex items-center gap-2 text-green-700 font-medium text-sm hover:bg-green-50 px-3 py-2 rounded border border-green-200 transition-colors">
                                                <Grid size={16} /> Export
                                            </button>
                                            {responses.length > 0 && (
                                                <button onClick={() => setShowDeleteAllResp(true)} className="flex items-center gap-2 text-red-600 font-medium text-sm hover:bg-red-50 px-3 py-2 rounded border border-red-100 transition-colors">
                                                    <Trash2 size={16} /> Delete All
                                                </button>
                                            )}
                                            <button onClick={fetchResponses} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Activity size={20} /></button>
                                        </div>
                                    </div>
                                    {responses.length === 0 ? (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 flex flex-col items-center gap-4">
                                            <MessageSquare className="text-gray-300" size={64} /><p className="text-gray-500">Waiting for responses</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {survey.questions?.map(q => (
                                                <div key={q.id} className="border border-gray-200 rounded-lg p-6">
                                                    <h3 className="text-base font-medium mb-4">{q.question}</h3>
                                                    <div className="space-y-2">
                                                        {responses.filter(r => r.answers[q.id] !== undefined).map((res, i) => (
                                                            <div key={i} className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100 group">
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900">{Array.isArray(res.answers[q.id]) ? res.answers[q.id].join(", ") : String(res.answers[q.id])}</div>
                                                                    <div className="text-xs text-gray-500 mt-0.5">{res.respondent_email || "Anonymous"} • {new Date(res.submitted_at).toLocaleString()}</div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setRespDeleteId(res.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
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
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-gray-700"><AtSign size={18} /><span className="text-sm font-medium">Responses</span><ChevronDown size={16} /></div>
                                            <div className="pl-6 space-y-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1"><div className="text-sm text-gray-800">Collect email addresses</div></div>
                                                    <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${!survey.is_anonymous ? "bg-purple-200" : "bg-gray-300"}`} onClick={() => setSurvey({...survey, is_anonymous: !survey.is_anonymous})}>
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
            )}

            {/* Modals */}
            {(deleteConfirmId || respDeleteId || showDeleteAllResp) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300 border border-slate-200">
                        <div className="p-6 space-y-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <Trash2 size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {deleteConfirmId ? "Delete survey?" : respDeleteId ? "Delete response?" : "Delete all responses?"}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {deleteConfirmId ? "This action will permanently remove the survey and all its responses." : "This action will permanently remove the selected data. You cannot undo this."}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setDeleteConfirmId(null); setRespDeleteId(null); setShowDeleteAllResp(false); }}
                                    className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirmId) confirmDelete();
                                        if (respDeleteId) handleDeleteResponse();
                                        if (showDeleteAllResp) handleDeleteAllResponses();
                                    }}
                                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
