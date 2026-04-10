"use client";
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
    Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
    Loader2, X, ChevronRight, Table, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";


interface RowData {
    employee_name: string;
    username: string;
    badge_id?: string;
    project?: string;
    program?: string;
    dc_name?: string;
    bu_name?: string;
    tracking_date: string;
    check_in_time: string;
}

export default function AttendanceUpload() {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const REQUIRED_COLUMNS = ["Full Name", "Username", "Date Tracking", "Check-In Time"];

    const handleFile = (file: File) => {
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            setError("Invalid report format. Please upload an Excel file.");
            return;
        }
        setFile(file);
        setError(null);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { range: 3 });

            if (json.length > 0) {
                const headers = Object.keys(json[0] as object).map(k => k.trim());
                const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
                if (missing.length > 0) {
                    setError(`Missing required column: ${missing.join(", ")}`);
                    setPreviewData([]);
                    return;
                }
                setPreviewData(json.slice(0, 10));
            }
        };
        reader.readAsBinaryString(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);


        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const json: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { range: 3 });

                const records = json.map(row => {
                    const findKey = (name: string) => {
                        return Object.keys(row).find(k => k.trim() === name) || name;
                    };

                    return {
                        employee_name: row[findKey("Full Name")],
                        username: row[findKey("Username")],
                        badge_id: row[findKey("Badge ID")]?.toString(),
                        project: row[findKey("Project/Groups")],
                        program: row[findKey("Program")],
                        dc_name: row[findKey("DC Name")],
                        bu_name: row[findKey("BU Name")],
                        tracking_date: (() => {
                            const val = row[findKey("Date Tracking")];
                            if (typeof val === 'number') {
                                return new Date((val - (25567 + 1)) * 86400 * 1000).toISOString().split('T')[0];
                            }
                            if (typeof val === 'string') {
                                const d = new Date(val);
                                if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
                            }
                            return val;
                        })(),
                        check_in_time: (() => {
                            const val = row[findKey("Check-In Time")];
                            if (typeof val === 'number') {
                                return new Date(Math.round(val * 86400 * 1000)).toISOString().substr(11, 5);
                            }
                            return val?.toString()?.trim();
                        })()
                    };
                });

                const res = await fetch("/api/attendance/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: file.name,
                        records
                    })
                });

                const jsonRes = await res.json();
                if (res.ok) {
                    setResult(jsonRes);
                    setPreviewData([]);
                    setFile(null);
                    toast.success("Attendance report uploaded successfully!");
                } else {
                    setError(jsonRes.error || "Upload failed");
                    toast.error(jsonRes.error || "Upload failed");
                }
            } catch (err: any) {
                setError("Error parsing file: " + err.message);
                toast.error("Error parsing file");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="glass-card p-10 bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden"
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}>
                
                {dragging && <div className="absolute inset-0 bg-indigo-50/50 backdrop-blur-[2px] z-10 flex items-center justify-center font-black text-indigo-600 uppercase tracking-widest">Drop report here</div>}

                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-sm ring-1 ring-indigo-100">
                    <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Upload Attendance Report</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6 font-medium">Drag and drop your Excel (.xlsx) file here, or click to browse. Ensure all required columns are present.</p>
                
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:opacity-95 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                    Select File
                </button>
            </div>

            {error && (
                <div className="glass-card p-4 bg-red-50 border-red-200 flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-xs font-bold text-red-700">{error}</p>
                </div>
            )}

            {result && (
                <div className="glass-card p-6 bg-emerald-50 border-emerald-200 animate-fadeInUp">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Upload Complete</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/50 p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Processed</p>
                            <p className="text-lg font-black text-slate-900">{result.processed} rows</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-xl border border-red-100">
                            <p className="text-[10px] font-black text-red-600 uppercase mb-1">Late</p>
                            <p className="text-lg font-black text-slate-900">{result.late}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-xl border border-amber-100">
                            <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Not Access</p>
                            <p className="text-lg font-black text-slate-900">{result.notAccess}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Speed</p>
                            <p className="text-lg font-black text-slate-900">{(result.timeMs / 1000).toFixed(2)}s</p>
                        </div>
                    </div>
                </div>
            )}

            {file && !loading && !error && (
                <div className="glass-card bg-white overflow-hidden animate-fadeInUp">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs font-black text-slate-900 leading-none mb-1">{file.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">Ready to process • {(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setFile(null); setPreviewData([]); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                            <button onClick={handleUpload} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-black hover:opacity-90 shadow-md active:scale-95 transition-all">
                                <Database className="w-4 h-4" /> Start Processing
                            </button>
                        </div>
                    </div>

                    {previewData.length > 0 && (
                        <div className="p-4 overflow-x-auto">
                            <div className="flex items-center gap-2 mb-3">
                                <Table className="w-4 h-4 text-slate-400" />
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview (First 10 rows)</h4>
                            </div>
                            <table className="w-full text-[11px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-2 font-black text-slate-400 uppercase px-2">Name</th>
                                        <th className="pb-2 font-black text-slate-400 uppercase px-2">User</th>
                                        <th className="pb-2 font-black text-slate-400 uppercase px-2 text-center">Date</th>
                                        <th className="pb-2 font-black text-slate-400 uppercase px-2 text-center">In Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="border-b last:border-0 border-slate-50 hover:bg-slate-50/50">
                                            <td className="py-2.5 px-2 font-bold text-slate-700">{row["Full Name"]}</td>
                                            <td className="py-2.5 px-2 text-slate-500">{row["Username"]}</td>
                                            <td className="py-2.5 px-2 text-slate-500 text-center">{typeof row["Date Tracking"] === 'number' ? 'Excel Date' : row["Date Tracking"]}</td>
                                            <td className="py-2.5 px-2 text-center">
                                                <span className={cn("px-2 py-0.5 rounded-full font-black text-[10px]", row["Check-In Time"] === "Not Access" ? "bg-amber-100 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
                                                    {row["Check-In Time"]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <div>
                        <h4 className="font-black text-slate-900">Processing Data...</h4>
                        <p className="text-xs text-slate-500 font-medium pb-2">Batch inserting records into database</p>
                        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-indigo-500 animate-loading-bar" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
