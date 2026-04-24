import { getMemberCertifications, getResources, getUserByEmail } from "@/lib/database";
import { MyCertificationsClient } from "@/components/certifications/MyCertificationsClient";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyCertificationsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) redirect("/login");

    const decoded = (await verifyToken(token)) as any;
    if (!decoded || !decoded.email) redirect("/login");

    // Strategy: Find the resource that matches the logged-in user's email
    // If not found, we might need a way to link user to resource
    // For now, assume email match or SuperAdmin view (but SuperAdmin might not be a resource)
    
    const resources = await getResources();
    const myResource = resources.find(r => r.name.toLowerCase() === decoded.name?.toLowerCase() || (decoded.role === 'SuperAdmin')); 
    
    // Fallback: If it's a SuperAdmin, show some data or a message
    const memberId = myResource?.employee_id || "";
    
    const memberCerts = await getMemberCertifications({ member_id: memberId });

    return (
        <div className="space-y-6">
            {!myResource && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm font-medium">
                    Note: We couldn't automatically link your user account to an employee record. Showing all records if you are Admin.
                </div>
            )}
            <MyCertificationsClient records={memberCerts} />
        </div>
    );
}
