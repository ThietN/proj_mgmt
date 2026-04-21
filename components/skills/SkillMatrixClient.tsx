"use client";

import { Resource, SkillDefinition, SkillMatrixEntry, Project } from "@/types";
import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
    Plus, Trash2, Download, Upload, Search, Filter,
    BarChart3, Table as TableIcon, ChevronDown, Save, X,
    FileSpreadsheet, AlertCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Level = "Beginner" | "Intermediate" | "Advanced" | "Expert" | null;

interface SkillMatrixProps {
    resources: Resource[];
    projects: Project[];
    initialSkills: SkillDefinition[];
    initialMatrix: SkillMatrixEntry[];
}

export function SkillMatrixClient({ resources, projects, initialSkills, initialMatrix }: SkillMatrixProps) {
    const [view, setView] = useState<"table" | "dashboard">("table");
    const [skills, setSkills] = useState<SkillDefinition[]>(initialSkills);
    const [matrix, setMatrix] = useState<SkillMatrixEntry[]>(initialMatrix);
    const [search, setSearch] = useState("");
    const [teamFilter, setTeamFilter] = useState("all");

    // UI States
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [loading, setLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = true;
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
        isDraggingRef.current = false;
        if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = 'default';
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = 'default';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 2; // Scroll speed
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    // Matrix Map for fast lookup [employee_id][skill_id]
    const matrixMap = useMemo(() => {
        const map: Record<string, Record<string, Level>> = {};
        matrix.forEach(entry => {
            if (!map[entry.employee_id]) map[entry.employee_id] = {};
            map[entry.employee_id][entry.skill_id] = entry.level;
        });
        return map;
    }, [matrix]);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.employee_id.toLowerCase().includes(search.toLowerCase());
            const matchesProject = teamFilter === "all" || r.project_id === teamFilter;
            return matchesSearch && matchesProject;
        });
    }, [resources, search, teamFilter]);

    const projectMap = useMemo(() => {
        const map: Record<string, string> = {};
        projects.forEach(p => map[p.project_id] = p.project_name);
        return map;
    }, [projects]);

    const handleAddSkill = async () => {
        if (!newSkillName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/skills/definitions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSkillName.trim() })
            });
            if (res.ok) {
                toast.success("Skill column added");
                const freshSkills = await fetch("/api/skills/definitions").then(r => r.json());
                setSkills(freshSkills);
                setNewSkillName("");
                setIsAddingSkill(false);
            } else {
                toast.error("Failed to add skill");
            }
        } catch (e) {
            toast.error("Error adding skill");
        }
        setLoading(false);
    };

    const handleDeleteSkill = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the skill column "${name}"? This removes all associated data.`)) return;
        try {
            const res = await fetch(`/api/skills/definitions?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSkills(skills.filter(s => s.id !== id));
                setMatrix(matrix.filter(m => m.skill_id !== id));
                toast.success("Skill column removed");
            }
        } catch (e) {
            toast.error("Error deleting skill");
        }
    };

    const handleUpdateLevel = async (employeeId: string, skillId: string, level: Level) => {
        try {
            if (!level) {
                // Delete the entry if level is cleared
                const res = await fetch(`/api/skills/matrix?employee_id=${employeeId}&skill_id=${skillId}`, {
                    method: "DELETE"
                });
                if (res.ok) {
                    setMatrix(matrix.filter(m => !(m.employee_id === employeeId && m.skill_id === skillId)));
                }
                return;
            }

            const res = await fetch("/api/skills/matrix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employee_id: employeeId, skill_id: skillId, level })
            });
            if (res.ok) {
                // Update local state
                const existingIndex = matrix.findIndex(m => m.employee_id === employeeId && m.skill_id === skillId);
                if (existingIndex > -1) {
                    const newMatrix = [...matrix];
                    newMatrix[existingIndex] = { ...newMatrix[existingIndex], level: level as any };
                    setMatrix(newMatrix);
                } else {
                    setMatrix([...matrix, { 
                        id: Date.now().toString(), 
                        employee_id: employeeId, 
                        skill_id: skillId, 
                        level: level as any, 
                        updated_at: new Date().toISOString() 
                    }]);
                }
            }
        } catch (e) {
            toast.error("Failed to update skill level");
        }
    };

    const exportToExcel = () => {
        const promise = new Promise((resolve, reject) => {
            try {
                const data = filteredResources.map(r => {
                    const row: Record<string, any> = {
                        "Employee ID": r.employee_id,
                        "Name": r.name,
                        "Project": projectMap[r.project_id || ""] || "Unassigned"
                    };
                    skills.forEach(s => {
                        row[s.name] = matrixMap[r.employee_id]?.[s.id] || "";
                    });
                    return row;
                });

                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Skill Matrix");
                XLSX.writeFile(workbook, `Skill_Matrix_${new Date().toISOString().split('T')[0]}.xlsx`);
                resolve(true);
            } catch (e) { reject(e); }
        });

        toast.promise(promise, {
            loading: 'Preparing Excel payload...',
            success: 'Export successful!',
            error: 'Export failed!',
        });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const buffer = event.target?.result as ArrayBuffer;
                const workbook = XLSX.read(buffer, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (rawJson.length === 0) {
                    toast.error("File is empty");
                    return;
                }

                // Normalize JSON keys (trim whitespace)
                const json = rawJson.map(row => {
                    const normalized: Record<string, any> = {};
                    Object.keys(row).forEach(key => {
                        normalized[key.trim()] = row[key];
                    });
                    return normalized;
                });

                const dataToUpsert: any[] = [];
                setImportProgress(10);
                
                json.forEach((row, idx) => {
                    const employeeIdRaw = row["Employee ID"];
                    if (!employeeIdRaw) return;
                    const employeeId = employeeIdRaw.toString().trim();

                    skills.forEach(skill => {
                        const cellValue = row[skill.name];
                        let level: Level = null;
                        
                        if (cellValue) {
                            const trimmedValue = cellValue.toString().trim();
                            if (["Beginner", "Intermediate", "Advanced", "Expert"].includes(trimmedValue)) {
                                level = trimmedValue as Level;
                            }
                        }
                        
                        // We always push even if level is null to allow clearing values
                        dataToUpsert.push({
                            employee_id: employeeId,
                            skill_id: skill.id,
                            level: level
                        });
                    });
                    
                    if (idx % 10 === 0) setImportProgress(10 + (idx / json.length) * 40);
                });

                if (json.length > 0 && dataToUpsert.length > 0) {
                    setLoading(true);
                    setImportProgress(60);
                    const res = await fetch("/api/skills/matrix", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ batch: dataToUpsert })
                    });
                    
                    setImportProgress(100);
                    if (res.ok) {
                        toast.success(`Successfully processed matrix for ${json.length} resources`);
                        const freshMatrix = await fetch("/api/skills/matrix").then(r => r.json());
                        setMatrix(freshMatrix);
                    } else {
                        const errorData = await res.json();
                        toast.error(`Server error: ${errorData.error || "Failed to save data"}`);
                    }
                } else {
                    toast.error("No valid resources found in the file");
                }
            } catch (err: any) {
                console.error("Import Error:", err);
                toast.error(`Import failed: ${err.message}`);
            } finally {
                setLoading(false);
                setImportProgress(0);
                e.target.value = ''; // Reset input
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const getLevelConfig = (level: Level) => {
        switch (level) {
            case "Expert": return { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };
            case "Advanced": return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
            case "Intermediate": return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
            case "Beginner": return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
            default: return { color: "text-slate-400", bg: "bg-slate-50/50", border: "border-slate-100" };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                        Skill Matrix
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Mapped competencies across {resources.length} engineering assets</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setView("table")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            view === "table" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <TableIcon className="w-4 h-4" /> Matrix Table
                    </button>
                    <button
                        onClick={() => setView("dashboard")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            view === "dashboard" ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <BarChart3 className="w-4 h-4" /> Insight Dashboard
                    </button>
                </div>
            </div>

            {view === "table" ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-medium"
                                />
                            </div>
                            <select
                                value={teamFilter}
                                onChange={e => setTeamFilter(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-indigo-400"
                            >
                                <option value="all">All Projects</option>
                                {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all">
                                <FileSpreadsheet className="w-4 h-4" /> Export Excel
                            </button>
                            <label className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                                <Upload className="w-4 h-4" /> Import Excel
                                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
                            </label>
                            <div className="h-6 w-px bg-slate-200 mx-2" />
                            <button
                                onClick={() => setIsAddingSkill(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Add Skill
                            </button>
                        </div>
                    </div>

                    {/* Drag to Scroll Hint */}
                    <div className="bg-slate-50 border-b border-slate-100 py-1 px-4 flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse delay-75" />
                            <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse delay-150" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hold Left Mouse to Drag & Scroll</span>
                    </div>

                    {/* Matrix Table */}
                    <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="overflow-x-auto select-none no-scrollbar active:cursor-grabbing"
                    >
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-sm p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px] border-r border-slate-100">Engineering Resource</th>
                                    {skills.map(skill => (
                                        <th key={skill.id} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest group border-r border-slate-100 min-w-[140px]">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate">{skill.name}</span>
                                                <button
                                                    onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredResources.map(resource => (
                                    <tr key={resource.employee_id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm p-4 border-r border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{resource.name}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{resource.employee_id}</span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[100px]">{projectMap[resource.project_id || ""] || "Unassigned"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {skills.map(skill => {
                                            const currentLevel = matrixMap[resource.employee_id]?.[skill.id];
                                            const cfg = getLevelConfig(currentLevel);

                                            return (
                                                <td key={skill.id} className="p-0 border-r border-slate-100 group relative">
                                                    <select
                                                        value={currentLevel || ""}
                                                        onChange={(e) => handleUpdateLevel(resource.employee_id, skill.id, e.target.value as Level)}
                                                        className={cn(
                                                            "w-full h-full p-4 text-xs font-black tracking-widest outline-none bg-transparent appearance-none cursor-pointer text-center",
                                                            cfg.color,
                                                            currentLevel && cfg.bg
                                                        )}
                                                    >
                                                        <option value="">--</option>
                                                        <option value="Beginner">Beginner</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Advanced">Advanced</option>
                                                        <option value="Expert">Expert</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-all" />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-black text-emerald-600 mb-2">Team Strengths</div>
                            <div className="space-y-2">
                                {skills.map(s => ({
                                    name: s.name,
                                    score: matrix.filter(m => m.skill_id === s.id && (m.level === "Expert" || m.level === "Advanced")).length
                                }))
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 3)
                                    .map(s => (
                                        <div key={s.name} className="flex justify-between items-center bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                            <span className="text-xs font-black text-slate-700">{s.name}</span>
                                            <span className="text-xs font-black text-emerald-600">{s.score}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-black text-red-600 mb-2">Critical Gaps</div>
                            <div className="space-y-2">
                                {skills.map(s => ({
                                    name: s.name,
                                    score: matrix.filter(m => m.skill_id === s.id && (m.level === "Expert" || m.level === "Advanced")).length
                                }))
                                    .sort((a, b) => a.score - b.score)
                                    .slice(0, 3)
                                    .map(s => (
                                        <div key={s.name} className="flex justify-between items-center bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100">
                                            <span className="text-xs font-black text-slate-700">{s.name}</span>
                                            <span className="text-xs font-black text-red-600">{s.score}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-black text-indigo-600 mb-1">Advanced Ratio</div>
                            <div className="text-3xl font-black text-slate-900">
                                {Math.round((matrix.filter(m => m.level === "Expert" || m.level === "Advanced").length / Math.max(1, matrix.length)) * 100)}%
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">of all recorded data points</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-black text-slate-400 mb-1">Mapped Skills</div>
                            <div className="text-3xl font-black text-slate-900">{skills.length}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">Distinct Technologies</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Dashboard Cards Example */}
                        {skills.map(skill => {
                            const skillEntries = matrix.filter(m => m.skill_id === skill.id);
                            const expertCount = skillEntries.filter(e => e.level === "Expert").length;
                            const advCount = skillEntries.filter(e => e.level === "Advanced").length;
                            const totalCount = expertCount + advCount;

                            return (
                                <div key={skill.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-black text-slate-800 tracking-tight">{skill.name}</h3>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Core Capacity</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div className="text-3xl font-black text-slate-900">{totalCount}</div>
                                            <div className="text-[10px] font-black text-slate-400">Expert + Advanced</div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-purple-500"
                                                style={{ width: `${(expertCount / Math.max(1, resources.length)) * 100}%` }}
                                                title={`Expert: ${expertCount}`}
                                            />
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${(advCount / Math.max(1, resources.length)) * 100}%` }}
                                                title={`Advanced: ${advCount}`}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                <span className="text-[10px] font-bold text-slate-500">Expert: {expertCount}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-[10px] font-bold text-slate-500">Advanced: {advCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

                    {/* Add Skill Modal */}
                    {isAddingSkill && (
                        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-4 bg-indigo-600 flex items-center justify-between">
                                    <h3 className="text-white text-sm font-black uppercase tracking-widest">Register New Capability</h3>
                                    <button onClick={() => setIsAddingSkill(false)} className="text-indigo-200 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Technology / Skill Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Next.js, Rust, AWS..."
                                            value={newSkillName}
                                            onChange={e => setNewSkillName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setIsAddingSkill(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                        <button
                                            onClick={handleAddSkill}
                                            disabled={loading || !newSkillName.trim()}
                                            className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? "Adding..." : "Add Column"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
}
