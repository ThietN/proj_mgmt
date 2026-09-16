import { getWikiPage } from "@/lib/database";
import WikiClient from "@/components/wiki/WikiClient";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
    const wikiPage = await getWikiPage();

    return <WikiClient initialData={wikiPage} />;
}
