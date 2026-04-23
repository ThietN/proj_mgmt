
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch/data.json', 'utf8').replace(/^\uFEFF/, ''));
const { resources, skills, matrix } = data;

const scoreValues = {
    "Expert": 4,
    "Advanced": 3,
    "Intermediate": 2,
    "Beginner": 1
};

const domains = {
    Testing: ["AI Testing Tool", "API Testing", "Cypress", "Jmeter", "Katalon", "Manual Testing", "Mobile Testing", "Performance/Stress Test", "Playwright", "Robot Framework", "Selenium", "Window Testing"],
    Development: ["BackEnd", "Cloud", "Database Skills", "DevOps", "FrontEnd", "FullStack Dev", "Git", "Java", "Jenkins", "Networking", "PenTest/Cyber", "TypeScripts"],
    AI: ["LLM/AI", "ML/AI", "MLOps", "Python"]
};

const matrixMap = {};
matrix.forEach(entry => {
    if (!matrixMap[entry.employee_id]) matrixMap[entry.employee_id] = {};
    matrixMap[entry.employee_id][entry.skill_id] = entry.level;
});

resources.forEach(resource => {
    const resourceLevels = matrixMap[resource.employee_id] || {};
    
    const calculateDomainStats = (categorySkills) => {
        const categorySkillIds = skills.filter(s => categorySkills.includes(s.name)).map(s => s.id);
        if (categorySkillIds.length === 0) return 0;
        
        let totalScore = 0;
        categorySkillIds.forEach(id => {
            totalScore += scoreValues[resourceLevels[id]] || 0;
        });
        return totalScore / categorySkillIds.length;
    };

    const testing = calculateDomainStats(domains.Testing);
    const development = calculateDomainStats(domains.Development);
    const ai = calculateDomainStats(domains.AI);

    const strengths = skills
        .filter(s => resourceLevels[s.id] === "Advanced" || resourceLevels[s.id] === "Expert")
        .map(s => s.name);

    const weaknesses = skills
        .filter(s => !resourceLevels[s.id] || resourceLevels[s.id] === "Beginner")
        .map(s => s.name);

    const getStrengthLabel = (avg) => {
        if (avg >= 3.5) return "Expert";
        if (avg >= 2.5) return "Strong";
        if (avg >= 1.5) return "Moderate";
        return "Weak";
    };

    const scores = [
        { name: "Testing", avg: testing },
        { name: "Development", avg: development },
        { name: "AI", avg: ai }
    ].sort((a, b) => b.avg - a.avg);

    const dominantDomain = scores[0].avg > 0 ? scores[0].name : "Generalist";

    console.log(`Member: ${resource.name}`);
    console.log(`Testing Strength: ${testing.toFixed(2)} (${getStrengthLabel(testing)})`);
    console.log(`Development Strength: ${development.toFixed(2)} (${getStrengthLabel(development)})`);
    console.log(`AI Strength: ${ai.toFixed(2)} (${getStrengthLabel(ai)})`);
    console.log(`Strengths: ${strengths.join(", ") || "None"}`);
    console.log(`Weaknesses: ${weaknesses.slice(0,5).join(", ") || "None"}`);
    console.log(`Recommendation: Focus on ${weaknesses[0] || 'Automation'} to improve ${dominantDomain} capabilities.`);
    console.log(`Dominant Domain: ${dominantDomain}`);
    console.log('---');
});
