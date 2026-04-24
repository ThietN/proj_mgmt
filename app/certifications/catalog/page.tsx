import { getCertifications } from "@/lib/database";
import { CertificationCatalogClient } from "@/components/certifications/CertificationCatalogClient";

export const dynamic = "force-dynamic";

export default async function CertificationCatalogPage() {
    const certifications = await getCertifications();

    return <CertificationCatalogClient initialData={certifications} />;
}
