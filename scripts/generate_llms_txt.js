const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const JSON_DIR = path.join(PUBLIC_DIR, 'jsons');
const CONFIG_PATH = path.join(ROOT_DIR, 'website.config.json');

function loadJson(filename) {
    const filePath = path.join(JSON_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

// Clean markdown text of TeX escape characters if any
function cleanText(text) {
    if (!text) return '';
    if (Array.isArray(text)) return text.map(cleanText).join('\n');
    return text.replace(/\\_/g, '_')
               .replace(/\\&/g, '&')
               .replace(/\\%/g, '%')
               .replace(/\\\$/g, '$')
               .trim();
}

function generateLlmsTxt() {
    const config = loadConfig();
    const education = loadJson('education.json') || [];
    const publications = loadJson('publications.json') || [];
    const researchExp = loadJson('research-experience.json') || [];
    const projects = loadJson('projects.json') || [];
    const skills = loadJson('skills.json') || {};
    const awards = loadJson('awards.json') || [];
    const news = loadJson('news.json') || [];

    const lines = [];

    // Header & Summary
    lines.push(`# ${config.name || 'Kunal Pai'}`);
    lines.push('');
    lines.push(`> ${cleanText(config.intro || '')}`);
    lines.push('');

    // Contact & Quick Links
    lines.push('## Contact & Links');
    lines.push(`- **Website**: ${config.resume_contact?.website_url || 'https://www.kunpai.space'}`);
    lines.push(`- **Email**: ${config.email || 'pai.kunal05@gmail.com'}`);
    lines.push(`- **GitHub**: https://${config.resume_contact?.github || 'github.com/kunpai'}`);
    lines.push(`- **LinkedIn**: https://${config.resume_contact?.linkedin || 'linkedin.com/in/kunpai'}`);
    lines.push(`- **Google Scholar**: ${config.footerLinks?.['Google Scholar'] || ''}`);
    lines.push(`- **CV / Resume**: ${config.resume_contact?.website_url || 'https://www.kunpai.space'}${config.resume || '/Kunal_Pai_CV.pdf'}`);
    lines.push('');

    // Education
    lines.push('## Education');
    for (const edu of education) {
        if (edu.show_on_website !== false) {
            const period = [edu.start, edu.end].filter(Boolean).join(' – ');
            lines.push(`- **${edu.degree} in ${edu.major}**, ${edu.university} (${period})`);
            if (edu.description) {
                lines.push(`  ${cleanText(edu.description)}`);
            }
        }
    }
    lines.push('');

    // Key Publications
    lines.push('## Key Publications & Pre-prints');
    for (const pub of publications) {
        if (pub.show_on_website !== false) {
            const authorsStr = (pub.authors || []).join(', ');
            const venueStr = pub.conference || pub.type || '';
            const badgeStr = pub.badge ? ` **[${pub.badge}]**` : '';
            const linksStr = pub.links ? Object.entries(pub.links).map(([k, v]) => `[${k}](${v})`).join(' | ') : '';
            lines.push(`- **${cleanText(pub.title)}**${badgeStr}`);
            lines.push(`  Authors: ${authorsStr}`);
            if (venueStr) lines.push(`  Venue: ${venueStr}`);
            if (pub.badge) lines.push(`  Recognition: ${pub.badge}`);
            if (pub.description) lines.push(`  Summary: ${cleanText(pub.description)}`);
            if (linksStr) lines.push(`  Links: ${linksStr}`);
            lines.push('');
        }
    }

    // Core Research & Projects
    lines.push('## Selected Research & Projects');
    for (const proj of projects) {
        if (proj.show_on_website !== false) {
            const period = [proj.start, proj.end].filter(Boolean).join(' – ');
            const skillsStr = proj.skills ? ` (${proj.skills.join(', ')})` : '';
            lines.push(`- **${cleanText(proj.title)}**${skillsStr} [${period}]`);
            if (proj.description) lines.push(`  ${cleanText(proj.description)}`);
            if (proj.links) {
                const pLinks = Object.entries(proj.links).map(([k, v]) => `[${k}](${v})`).join(' | ');
                lines.push(`  Links: ${pLinks}`);
            }
            lines.push('');
        }
    }

    // Awards & Honors
    if (awards.length > 0) {
        lines.push('## Awards & Honors');
        for (const award of awards) {
            if (award.show_on_website !== false) {
                const awarderStr = award.awarder ? ` - ${award.awarder}` : '';
                const dateStr = (award.date || award.year) ? ` (${award.date || award.year})` : '';
                lines.push(`- **${cleanText(award.title)}**${awarderStr}${dateStr}`);
                if (award.description) lines.push(`  ${cleanText(award.description)}`);
            }
        }
        lines.push('');
    }

    // Technical Skills
    lines.push('## Technical Skills');
    if (skills.resume_skills) {
        for (const [category, items] of Object.entries(skills.resume_skills)) {
            if (Array.isArray(items)) {
                lines.push(`- **${category}**: ${items.join(', ')}`);
            }
        }
    } else {
        for (const [category, items] of Object.entries(skills)) {
            if (Array.isArray(items)) {
                const catName = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                lines.push(`- **${catName}**: ${items.join(', ')}`);
            }
        }
    }
    lines.push('');

    // Detailed Files Notice
    lines.push('## Full Details');
    lines.push(`For complete research details, work history, full publication abstracts, talks, and teaching experience, see the full LLM document:`);
    lines.push(`- [Full LLM Markdown Summary](https://www.kunpai.space/llms-full.txt)`);
    lines.push('');

    return lines.join('\n');
}

function generateLlmsFullTxt() {
    const config = loadConfig();
    const education = loadJson('education.json') || [];
    const publications = loadJson('publications.json') || [];
    const researchExp = loadJson('research-experience.json') || [];
    const workExp = loadJson('work-experience.json') || [];
    const projects = loadJson('projects.json') || [];
    const skills = loadJson('skills.json') || {};
    const awards = loadJson('awards.json') || [];
    const news = loadJson('news.json') || [];
    const service = loadJson('service.json') || [];
    const talks = loadJson('talks.json') || [];
    const teaching = loadJson('teaching-experience.json') || [];

    const lines = [];

    lines.push(`# ${config.name || 'Kunal Pai'} - Complete Portfolio & Academic Profile`);
    lines.push('');
    lines.push(`> ${cleanText(config.intro || '')}`);
    lines.push('');

    // Contact Information
    lines.push('## Contact Information');
    lines.push(`- **Name**: ${config.name}`);
    lines.push(`- **Email**: ${config.email}`);
    if (config.resume_contact) {
        lines.push(`- **Website**: ${config.resume_contact.website_url}`);
        lines.push(`- **GitHub**: https://${config.resume_contact.github}`);
        lines.push(`- **LinkedIn**: https://${config.resume_contact.linkedin}`);
    }
    if (config.footerLinks) {
        for (const [k, v] of Object.entries(config.footerLinks)) {
            lines.push(`- **${k}**: ${v}`);
        }
    }
    lines.push('');

    // Education
    lines.push('## Education');
    for (const edu of education) {
        const period = [edu.start, edu.end].filter(Boolean).join(' – ');
        lines.push(`### ${edu.degree} in ${edu.major}`);
        lines.push(`- **Institution**: ${edu.university}`);
        lines.push(`- **Timeline**: ${period}`);
        if (edu.gpa) lines.push(`- **GPA**: ${edu.gpa}`);
        if (edu.description) lines.push(`- **Details**: ${cleanText(edu.description)}`);
        lines.push('');
    }

    // Research Experience
    lines.push('## Research Experience');
    for (const exp of researchExp) {
        const period = [exp.start, exp.end].filter(Boolean).join(' – ');
        lines.push(`### ${exp.title} - ${exp.organization}`);
        lines.push(`- **Period**: ${period}`);
        if (exp.location) lines.push(`- **Location**: ${exp.location}`);
        lines.push(`- **Description**:`);
        const bullets = cleanText(exp.description).split('\n');
        for (const bullet of bullets) {
            if (bullet.trim()) lines.push(`  - ${bullet.trim()}`);
        }
        lines.push('');
    }

    // Publications
    lines.push('## Publications & Pre-prints');
    for (const pub of publications) {
        lines.push(`### ${cleanText(pub.title)}`);
        lines.push(`- **Authors**: ${(pub.authors || []).join(', ')}`);
        if (pub.conference) lines.push(`- **Venue**: ${pub.conference}`);
        if (pub.badge) lines.push(`- **Recognition**: ${pub.badge}`);
        if (pub.description) lines.push(`- **Abstract / Summary**: ${cleanText(pub.description)}`);
        if (pub.tags && pub.tags.length > 0) lines.push(`- **Tags**: ${pub.tags.join(', ')}`);
        if (pub.links) {
            const pLinks = Object.entries(pub.links).map(([k, v]) => `[${k}](${v})`).join(' | ');
            lines.push(`- **Links**: ${pLinks}`);
        }
        if (pub.bibtex) {
            lines.push(`- **BibTeX**:`);
            lines.push('```bibtex');
            lines.push(pub.bibtex);
            lines.push('```');
        }
        lines.push('');
    }

    // Projects
    lines.push('## Projects');
    for (const proj of projects) {
        const period = [proj.start, proj.end].filter(Boolean).join(' – ');
        lines.push(`### ${cleanText(proj.title)}`);
        lines.push(`- **Timeline**: ${period}`);
        if (proj.skills) lines.push(`- **Technologies**: ${proj.skills.join(', ')}`);
        if (proj.description) lines.push(`- **Summary**: ${cleanText(proj.description)}`);
        if (proj.collaborators && proj.collaborators.length > 0) {
            const collabStr = proj.collaborators.map(c => `[${c.name}](${c.link})`).join(', ');
            lines.push(`- **Collaborators**: ${collabStr}`);
        }
        if (proj.links) {
            const pLinks = Object.entries(proj.links).map(([k, v]) => `[${k}](${v})`).join(' | ');
            lines.push(`- **Links**: ${pLinks}`);
        }
        lines.push('');
    }

    // Work Experience
    if (workExp.length > 0) {
        lines.push('## Work Experience');
        for (const work of workExp) {
            const period = [work.start, work.end].filter(Boolean).join(' – ');
            lines.push(`### ${work.title} - ${work.organization}`);
            lines.push(`- **Period**: ${period}`);
            if (work.location) lines.push(`- **Location**: ${work.location}`);
            if (work.description) {
                lines.push(`- **Description**:`);
                const bullets = cleanText(work.description).split('\n');
                for (const bullet of bullets) {
                    if (bullet.trim()) lines.push(`  - ${bullet.trim()}`);
                }
            }
            lines.push('');
        }
    }

    // Talks
    if (talks.length > 0) {
        lines.push('## Talks & Presentations');
        for (const talk of talks) {
            lines.push(`- **${cleanText(talk.title)}** (${talk.event || ''}, ${talk.date || ''})`);
            if (talk.description) lines.push(`  ${cleanText(talk.description)}`);
            if (talk.link) lines.push(`  [Link](${talk.link})`);
        }
        lines.push('');
    }

    // Teaching Experience
    if (teaching.length > 0) {
        lines.push('## Teaching Experience');
        for (const t of teaching) {
            lines.push(`- **${t.role || 'Teaching Assistant'}**: ${t.course} at ${t.institution} (${t.term})`);
            if (t.description) lines.push(`  ${cleanText(t.description)}`);
        }
        lines.push('');
    }

    // Awards
    if (awards.length > 0) {
        lines.push('## Awards & Honors');
        for (const award of awards) {
            lines.push(`- **${award.title}** (${award.year || award.date || ''}) - ${award.issuer || ''}`);
            if (award.description) lines.push(`  ${cleanText(award.description)}`);
        }
        lines.push('');
    }

    // News
    if (news.length > 0) {
        lines.push('## Recent News');
        for (const item of news) {
            lines.push(`- **${item.date}**: ${cleanText(item.content || item.title || '')}`);
        }
        lines.push('');
    }

    // Service
    if (service.length > 0) {
        lines.push('## Service & Outreach');
        for (const s of service) {
            lines.push(`- **${s.role}**, ${s.organization} (${s.year || s.date || ''})`);
            if (s.description) lines.push(`  ${cleanText(s.description)}`);
        }
        lines.push('');
    }

    // Skills
    lines.push('## Technical & Language Skills');
    if (skills.resume_skills) {
        for (const [cat, items] of Object.entries(skills.resume_skills)) {
            if (Array.isArray(items)) {
                lines.push(`- **${cat}**: ${items.join(', ')}`);
            }
        }
    }
    lines.push('');

    return lines.join('\n');
}

function main() {
    console.log('Generating LLM Markdown files...');
    const llmsTxtContent = generateLlmsTxt();
    const llmsFullTxtContent = generateLlmsFullTxt();

    const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
    const llmsFullPath = path.join(PUBLIC_DIR, 'llms-full.txt');
    const indexMdPath = path.join(PUBLIC_DIR, 'index.md');

    fs.writeFileSync(llmsPath, llmsTxtContent, 'utf-8');
    fs.writeFileSync(llmsFullPath, llmsFullTxtContent, 'utf-8');
    fs.writeFileSync(indexMdPath, llmsTxtContent, 'utf-8');

    console.log(`Successfully generated:\n - ${llmsPath}\n - ${llmsFullPath}\n - ${indexMdPath}`);
}

main();
