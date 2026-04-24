import { getCertifications, getMemberCertifications } from "@/lib/database";
import { CertificationDashboardClient } from "@/components/certifications/CertificationDashboardClient";

export const dynamic = "force-dynamic";

export default async function CertificationsDashboardPage() {
    const certifications = await getCertifications();
    const memberCerts = await getMemberCertifications();

    return <CertificationDashboardClient records={memberCerts} certifications={certifications} />;
}
