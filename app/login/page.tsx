"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, CheckCircle, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifiedBanner, setVerifiedBanner] = useState<"success" | "already" | null>(null);

    useEffect(() => {
        const verified = searchParams.get("verified");
        if (verified === "true") setVerifiedBanner("success");
        else if (verified === "already") setVerifiedBanner("already");
    }, [searchParams]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setNeedsVerification(false);
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                if (data.needsVerification) {
                    setNeedsVerification(true);
                }
                setError(data.error || "Đăng nhập thất bại");
            }
        } catch (err) {
            setError("Lỗi kết nối mạng");
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm glass-card p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-600/25 mb-4">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">DC12_PG3_MGMT</h1>
                    <p className="text-sm text-slate-500">Đăng nhập vào tài khoản</p>
                </div>

                {/* Email verified success banner */}
                {verifiedBanner === "success" && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">Kích hoạt thành công! 🎉</p>
                            <p className="text-xs text-green-600">Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập.</p>
                        </div>
                    </div>
                )}
                {verifiedBanner === "already" && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">Tài khoản đã được kích hoạt trước đó. Vui lòng đăng nhập.</p>
                    </div>
                )}

                {/* Error / needs verification */}
                {error && !needsVerification && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm break-words">
                        {error}
                    </div>
                )}
                {needsVerification && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                        <Mail className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Chưa kích hoạt tài khoản</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Vui lòng kiểm tra hộp thư <strong>@tma.com.vn</strong> và click vào link kích hoạt được gửi khi đăng ký.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@tma.com.vn"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                    <div className="text-center text-xs text-slate-500 mt-4">
                        Chưa có tài khoản? <Link href="/register" className="text-blue-600 hover:underline">Đăng ký</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

