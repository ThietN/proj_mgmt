import { getCertifications, getMemberCertifications, getResources } from "@/lib/database";
import { MemberCertificationTrackerClient } from "@/components/certifications/MemberCertificationTrackerClient";

export const dynamic = "force-dynamic";

export default async function CertificationTrackingPage() {
    const certifications = await getCertifications();
    const memberCerts = await getMemberCertifications();
    const resources = await getResources();

    return (
        <MemberCertificationTrackerClient 
            initialData={memberCerts} 
            members={resources} 
            certifications={certifications} 
        />
    );
}
