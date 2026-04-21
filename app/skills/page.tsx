import { getResources, getProjects, getSkillDefinitions, getSkillMatrix } from "@/lib/database";
import { SkillMatrixClient } from "@/components/skills/SkillMatrixClient";

export const dynamic = "force-dynamic";

export default async function SkillMatrixPage() {
    const resources = await getResources();
    const projects = await getProjects();
    const skills = await getSkillDefinitions();
    const matrix = await getSkillMatrix();

    return (
        <div className="container mx-auto py-8">
            <SkillMatrixClient 
                resources={resources} 
                projects={projects}
                initialSkills={skills} 
                initialMatrix={matrix} 
            />
        </div>
    );
}
