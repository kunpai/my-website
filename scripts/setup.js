#!/usr/bin/env node
/**
 * Portfolio Template Setup Wizard
 * Guides users through personalizing website.config.json.
 * 
 * Usage:
 *   npm run setup
 *   node scripts/setup.js [--defaults]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'website.config.json');
const BACKUP_PATH = path.join(ROOT_DIR, 'website.config.json.bak');

const existingConfig = fs.existsSync(CONFIG_PATH)
  ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  : {};

function askQuestion(rl, query, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askYesNo(rl, query, defaultVal = true) {
  const defaultStr = defaultVal ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`${query} (${defaultStr}): `, (answer) => {
      const clean = answer.trim().toLowerCase();
      if (!clean) return resolve(defaultVal);
      resolve(clean === 'y' || clean === 'yes');
    });
  });
}

async function runWizard() {
  const isDefault = process.argv.includes('--defaults');

  console.log('\n======================================================');
  console.log('   🚀 Welcome to the Portfolio Template Setup Wizard!   ');
  console.log('======================================================\n');
  console.log('This wizard will help you customize website.config.json.\n');

  if (isDefault) {
    console.log('Running with defaults...');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // 1. Basic Identity
    console.log('--- 👤 Personal Information ---');
    const name = await askQuestion(rl, 'Full Name', existingConfig.name || 'Alex Morgan');
    const defaultInitials = name.split(' ').map(w => w[0]).join('').toUpperCase();
    const initials = await askQuestion(rl, 'Monogram / Initials', existingConfig.initials || defaultInitials);
    const title = await askQuestion(rl, 'Professional Title', existingConfig.title || 'Researcher & Software Engineer');
    const institution = await askQuestion(rl, 'Institution / University / Company', existingConfig.institution || 'University of California');
    const institutionUrl = await askQuestion(rl, 'Institution URL', existingConfig.institutionUrl || 'https://www.university.edu');
    const siteUrl = await askQuestion(rl, 'Your Website URL', existingConfig.siteUrl || 'https://example.com');
    const email = await askQuestion(rl, 'Primary Contact Email', existingConfig.email || 'alex@example.com');

    // 2. Social & Profiles
    console.log('\n--- 🌐 Social Profiles ---');
    const github = await askQuestion(rl, 'GitHub Username or URL', existingConfig.resume_contact?.github || 'github.com/example');
    const linkedin = await askQuestion(rl, 'LinkedIn Username or URL', existingConfig.resume_contact?.linkedin || 'linkedin.com/in/example');
    const scholar = await askQuestion(rl, 'Google Scholar Profile URL (optional)', existingConfig.footerLinks?.['Google Scholar'] || '');

    // 3. Feature Flags
    console.log('\n--- ⚡ Enable or Disable Features ---');
    const enablePublications = await askYesNo(rl, 'Enable Publications section & page?', existingConfig.features?.publications !== false);
    const enableProjects = await askYesNo(rl, 'Enable Projects section & page?', existingConfig.features?.projects !== false);
    const enableExperience = await askYesNo(rl, 'Enable Work & Research Experience?', existingConfig.features?.workExperience !== false);
    const enableBlogs = await askYesNo(rl, 'Enable Blog posts?', existingConfig.features?.blogs !== false);
    const enableGames = await askYesNo(rl, 'Enable Games dropdown in navigation?', existingConfig.features?.games === true);
    const enableChatbot = await askYesNo(rl, 'Enable AI Chatbot widget?', existingConfig.features?.chatbot === true);

    // 4. Visual Theme
    console.log('\n--- 🎨 Visual Styling ---');
    const accentColor = await askQuestion(rl, 'Primary Accent Color (hex code)', existingConfig.theme?.accentColor || '#0d6efd');
    const gradientEnd = await askQuestion(rl, 'Gradient Secondary Color (hex code)', existingConfig.theme?.gradientEnd || '#00d2ff');

    rl.close();

    // Prepare new config object preserving non-interactive data
    const newConfig = {
      ...existingConfig,
      name,
      initials,
      title,
      homepageTitle: `${name} — ${title}`,
      institution,
      institutionUrl,
      siteUrl,
      email,
      bio: existingConfig.bio || `${name} is a ${title} at ${institution}.`,
      intro: existingConfig.intro || `I am a ${title} at **${institution}**.`,
      resume_contact: {
        ...(existingConfig.resume_contact || {}),
        website: siteUrl.replace(/^https?:\/\//, ''),
        website_url: siteUrl,
        email,
        github: github.replace(/^https?:\/\//, ''),
        linkedin: linkedin.replace(/^https?:\/\//, ''),
      },
      contactEmails: [email],
      contactText: `You can contact me at **${email.replace('@', ' AT ').replace(/\./g, ' DOT ')}** or simply fill out the form below.`,
      enableChatbot,
      features: {
        about: true,
        projects: enableProjects,
        publications: enablePublications,
        workExperience: enableExperience,
        blogs: enableBlogs,
        games: enableGames,
        chatbot: enableChatbot,
        researchGraph: enablePublications,
      },
      theme: {
        accentColor,
        gradientStart: accentColor,
        gradientEnd,
      },
      footerText: `This website was created with the open-source Next.js Academic Portfolio template.`,
      footerLinks: {
        ...(scholar ? { 'Google Scholar': scholar } : {}),
        ...(github ? { 'GitHub': github.startsWith('http') ? github : `https://${github}` } : {}),
        ...(linkedin ? { 'LinkedIn': linkedin.startsWith('http') ? linkedin : `https://${linkedin}` } : {}),
        'Website Source': 'https://github.com/kunpai/my-website',
      },
    };

    // Backup current config if exists
    if (fs.existsSync(CONFIG_PATH)) {
      fs.copyFileSync(CONFIG_PATH, BACKUP_PATH);
      console.log(`\n📦 Created backup of existing config at website.config.json.bak`);
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 4), 'utf8');
    console.log(`✅ Successfully wrote updated configuration to website.config.json!`);

    console.log('\n======================================================');
    console.log('   🎉 Setup Complete! Next Steps:                     ');
    console.log('======================================================');
    console.log('1. Edit your research, experience, and projects in:');
    console.log('     📁 public/jsons/ (education.json, projects.json, publications.json, etc.)');
    console.log('2. Edit your about page in:');
    console.log('     📄 public/about.md');
    console.log('3. Add blog posts in:');
    console.log('     📁 public/blogs/*.md');
    console.log('4. Run the local dev server:');
    console.log('     $ npm run dev\n');

  } catch (err) {
    rl.close();
    console.error('Setup failed:', err);
  }
}

runWizard();
