"use client";
import { useState } from "react";
import Link from "next/link";
import { Activity, Mail, CheckCircle, AlertCircle } from "lucide-react";

const ALLOWED_DOMAIN = "@tma.com.vn";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Team Lead");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    // Real-time domain validation
    const emailInvalid = email.length > 0 && !email.toLowerCase().endsWith(ALLOWED_DOMAIN);
    const emailValid = email.length > 0 && email.toLowerCase().endsWith(ALLOWED_DOMAIN) && email.includes("@");

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            setError(`Chỉ chấp nhận email có domain ${ALLOWED_DOMAIN}`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                setRegisteredEmail(email);
                setRegistered(true);
            } else {
                setError(data.error || "Đăng ký thất bại");
            }
        } catch (err) {
            setError("Lỗi kết nối mạng");
        }
        setLoading(false);
    }

    // ── SUCCESS STATE ──────────────────────────────────────────────
    if (registered) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm glass-card p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Đăng ký thành công!</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Tài khoản của bạn đã được tạo và có thể đăng nhập ngay.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800 mb-1">
                                    Email đăng ký
                                </p>
                                <p className="text-sm font-bold text-blue-800 mt-1 break-all">
                                    {registeredEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="block w-full bg-blue-600 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                        Đi đến trang đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    // ── REGISTER FORM ──────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm glass-card p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-600/25 mb-4">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Join DC12_PG3_MGMT</h1>
                    <p className="text-sm text-slate-500">Tạo tài khoản của bạn</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm break-words flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email TMA
                            <span className="ml-1 text-xs font-normal text-slate-400">(bắt buộc @tma.com.vn)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-900 outline-none pr-8 transition-colors ${
                                    emailInvalid
                                        ? "border-red-400 focus:border-red-500"
                                        : emailValid
                                        ? "border-green-400 focus:border-green-500"
                                        : "border-slate-200 focus:border-blue-500"
                                }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@tma.com.vn"
                                required
                            />
                            {emailValid && (
                                <CheckCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            )}
                            {emailInvalid && (
                                <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                            )}
                        </div>
                        {emailInvalid && (
                            <p className="text-xs text-red-500 mt-1">
                                Chỉ chấp nhận email <strong>@tma.com.vn</strong>
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="Senior Manager">Senior Manager</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="PM">PM</option>
                            <option value="SM">SM</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            minLength={6}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || emailInvalid}
                        className="w-full bg-blue-600 text-white font-medium text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                    </button>
                    <div className="text-center text-xs text-slate-500 mt-4">
                        Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
