#!/usr/bin/env python3
import os
import json
import re
import subprocess
import shutil

# Resolve absolute paths relative to project root (where this script's parent directory resides)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(ROOT_DIR, "public", "jsons")
LATEX_SRC_DIR = os.path.join(ROOT_DIR, "public", "latex_src")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
TEMPLATE_PATH = os.path.join(ROOT_DIR, "scripts", "resume_template.tex")
CONFIG_PATH = os.path.join(ROOT_DIR, "website.config.json")

def load_json(filename):
    path = os.path.join(JSON_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def tex_escape(text):
    if not isinstance(text, str):
        return text
    
    # 1. Escape '&' if not already escaped
    text = re.sub(r'(?<!\\)&', r'\&', text)
    # 2. Escape '%' if not already escaped
    text = re.sub(r'(?<!\\)%', r'\%', text)
    # 3. Escape '_' if not already escaped
    text = re.sub(r'(?<!\\)_', r'\_', text)
    
    # 4. Handle '$' (keep math mode like $...$ intact, escape others)
    parts = re.split(r'(\$.*?\$)', text)
    for i in range(len(parts)):
        # If it doesn't look like a math block, escape raw '$' signs
        if not (parts[i].startswith('$') and parts[i].endswith('$')):
            parts[i] = re.sub(r'(?<!\\)\$', r'\$', parts[i])
    text = "".join(parts)
    
    # Note: We do NOT escape '{' and '}' because they are widely used in LaTeX markup in descriptions.
    return text

def markdown_links_to_latex(text):
    if not isinstance(text, str):
        return text
    # Strip leading bullet/dash if present
    if text.strip().startswith("- "):
        text = text.strip()[2:]
    
    # Regex for markdown link: [text](url)
    pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    matches = list(re.finditer(pattern, text))
    
    last_idx = 0
    result = []
    for match in matches:
        start, end = match.span()
        # Escape preceding text
        result.append(tex_escape(text[last_idx:start]))
        
        link_text = match.group(1)
        url = match.group(2)
        
        # Format as LaTeX href
        result.append(rf"\href{{{url}}}{{{tex_escape(link_text)}}}")
        last_idx = end
        
    result.append(tex_escape(text[last_idx:]))
    return "".join(result)

def format_author_name(name):
    # Underline user "Kunal Pai" or "Kunal Suresh Pai"
    is_user = "Kunal" in name and "Pai" in name
    
    parts = name.strip().split()
    if len(parts) >= 2:
        last = parts[-1]
        first = parts[0]
        middle = parts[1:-1]
        initials = first[0] + "".join(m[0] for m in middle)
        formatted = f"{last}, {'.'.join(initials)}."
    else:
        formatted = name
        
    if is_user:
        return rf"\underline{{{formatted}}}"
    return formatted

def resolve_publication_link(pub):
    # 1. Check for resume_link override
    if "resume_link" in pub and pub["resume_link"]:
        return pub["resume_link"]
    
    # 2. Check for DOI URL from bibtex
    if "bibtex" in pub and pub["bibtex"]:
        doi_match = re.search(r'doi\s*=\s*\{([^}]+)\}', pub["bibtex"])
        if doi_match:
            doi = doi_match.group(1).strip()
            if not doi.startswith("http"):
                return f"https://doi.org/{doi}"
            return doi
            
    # 3. Check for publication link
    links = pub.get("links", {})
    for key in ["View Publication", "View Pre-Print", "View Source", "View Artifact"]:
        if key in links and links[key]:
            return links[key]
            
    return None

def format_date_range(start, end):
    # Use double hyphens for ranges (en-dash in LaTeX)
    date_str = f"{start} -- {end}"
    date_str = date_str.replace(" - ", " -- ")
    return date_str

def generate_education_section(items, is_short):
    lines = []
    lines.append(r"\section{Education}")
    lines.append(r"{\normalsize")
    lines.append(r"\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt]")
    
    for item in items:
        # Check visibility
        show = item.get("show_in_resume_short", True) if is_short else item.get("show_in_resume", True)
        if not show:
            continue
            
        degree = item.get("resume_degree", f"{item.get('degree')}, {item.get('major')}")
        uni = item.get("university")
        
        # GPA formatting
        gpa_val = item.get("gpa", "")
        if "resume_gpa" in item:
            gpa_str = f" (GPA: \\textbf{{{item['resume_gpa']}}})"
        elif gpa_val:
            gpa_str = f" (GPA: \\textbf{{{gpa_val}/4.0}})"
        else:
            gpa_str = ""
            
        end_date = item.get("resume_end", item.get("end"))
        if end_date == "Ongoing":
            end_date = f"Expected: {item.get('end')}"
            
        details = item.get("resume_details", "")
        
        # Escape fields
        degree = tex_escape(degree)
        uni = tex_escape(uni)
        details = tex_escape(details)
        end_date = tex_escape(end_date)
        
        lines.append(rf"  \item \textbf{{{degree}}}, {uni}{gpa_str}{details} \hfill {end_date}")
        
    lines.append(r"\end{itemize}")
    lines.append(r"}")
    return "\n".join(lines)

def generate_skills_section(skills_data, is_short):
    lines = []
    lines.append(r"\section{Relevant Skills}")
    lines.append(r"{\normalsize")
    lines.append(r"\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt]")
    
    resume_skills = skills_data.get("resume_skills", {})
    long_overrides = resume_skills.get("resume_skills_long_override", {})
    
    for category, skills in resume_skills.items():
        if category == "resume_skills_long_override":
            continue
            
        # Check for override if long resume
        display_skills = skills
        if not is_short and category in long_overrides:
            display_skills = long_overrides[category]
            
        skills_str = ", ".join(display_skills)
        lines.append(rf"  \item \textbf{{{tex_escape(category)}}}: {tex_escape(skills_str)}")
        
    lines.append(r"\end{itemize}")
    lines.append(r"}")
    return "\n".join(lines)

def generate_experience_section(experiences, is_short):
    lines = []
    lines.append(r"\section{Work Experience}")
    lines.append(r"{\normalsize")
    lines.append(r"\resumeSubHeadingList")
    
    for exp in experiences:
        show = exp.get("show_in_resume_short", False) if is_short else exp.get("show_in_resume", True)
        if not show:
            continue
            
        title = exp.get("title")
        org = exp.get("resume_organization", exp.get("organization"))
        date_str = format_date_range(exp.get("start"), exp.get("end"))
        
        # Format header strings
        title_formatted = rf"{tex_escape(title)}, \textit{{{tex_escape(org)}}}"
        date_formatted = tex_escape(date_str)
        
        # Choose heading command
        # Short resume ALWAYS uses resumeSubheadingSmall for work experience
        # Long resume can use 4-arg resumeSubheading if resume_type and resume_skills are provided
        t_type = exp.get("resume_type")
        t_skills = exp.get("resume_skills")
        
        if not is_short and t_type and t_skills:
            lines.append(rf"  \resumeSubheading{{{title_formatted}}}{{{date_formatted}}}{{{tex_escape(t_type)}}}{{{tex_escape(t_skills)}}}")
        else:
            lines.append(rf"  \resumeSubheadingSmall{{{title_formatted}}}{{{date_formatted}}}")
            
        # Description bullet points
        desc_list = []
        if is_short and "resume_short_description" in exp:
            desc_list = exp["resume_short_description"]
        elif not is_short and "resume_description" in exp:
            desc_list = exp["resume_description"]
        else:
            desc_list = [p.strip() for p in exp.get("description", "").split("\n") if p.strip()]
            
        lines.append(r"  \resumeJustifiedList")
        for bullet in desc_list:
            lines.append(rf"    \resumeItem{{{tex_escape(bullet)}}}")
        lines.append(r"  \end{itemize}")
        
    lines.append(r"\resumeSubHeadingListEnd")
    lines.append(r"}")
    return "\n".join(lines)

def generate_publications_section(publications, is_short):
    lines = []
    # Title selection
    title = "Publications (Selected)" if is_short else "Publications (Selected)"
    lines.append(rf"\section{{{title}}}")
    lines.append(r"{\normalsize")
    lines.append(r"\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt]")
    
    for pub in publications:
        show = pub.get("show_in_resume_short", False) if is_short else pub.get("show_in_resume", True)
        if not show:
            continue
            
        pub_title = pub.get("title")
        url = resolve_publication_link(pub)
        
        # Title hyperlink
        if url:
            title_str = rf"\href{{{url}}}{{\textbf{{{tex_escape(pub_title)}}}}}"
        else:
            title_str = rf"\textbf{{{tex_escape(pub_title)}}}"

        spotlight_str = ""
        if pub.get("badge") or pub.get("spotlight"):
            spotlight_str = r" \,\textbf{\textsc{[Spotlight]}}"
            
        # Format authors
        authors = pub.get("authors", [])
        authors_formatted = [format_author_name(a) for a in authors]
        if len(authors) <= 4:
            if len(authors) == 1:
                authors_str = authors_formatted[0]
            elif len(authors) == 2:
                authors_str = rf"{authors_formatted[0]} \& {authors_formatted[1]}"
            else:
                authors_str = ", ".join(authors_formatted[:-1]) + rf" \& {authors_formatted[-1]}"
        else:
            authors_str = ", ".join(authors_formatted[:3]) + ", et. al."
            
        venue = pub.get("conference", "")
        
        # Output list item
        lines.append(rf"  \resumeItem{{{title_str}{spotlight_str}, {authors_str}, \textit{{{tex_escape(venue)}}}}}")
        
    lines.append(r"\end{itemize}")
    lines.append(r"}")
    return "\n".join(lines)

def generate_projects_section(projects, is_short):
    lines = []
    lines.append(r"\section{Project Experience}")
    lines.append(r"{\normalsize")
    lines.append(r"\resumeSubHeadingList")
    
    for proj in projects:
        show = proj.get("show_in_resume_short", False) if is_short else proj.get("show_in_resume", True)
        if not show:
            continue
            
        title = proj.get("resume_title", proj.get("title"))
        
        # Link check
        url = proj.get("resume_link")
        if not url:
            links = proj.get("links", {})
            for key in ["GitHub", "Website", "Poster", "Paper"]:
                if key in links and links[key]:
                    url = links[key]
                    break
                    
        if url:
            title_str = rf"\href{{{url}}}{{{tex_escape(title)}}}"
        else:
            title_str = tex_escape(title)
            
        date_str = format_date_range(proj.get("start"), proj.get("end"))
        date_formatted = tex_escape(date_str)
        
        # Project Type and Skills
        t_type = proj.get("resume_type_short" if is_short and "resume_type_short" in proj else "resume_type")
        t_skills = proj.get("resume_skills")
        
        if t_type and t_skills:
            lines.append(rf"  \resumeSubheading{{{title_str}}}{{{date_formatted}}}{{{tex_escape(t_type)}}}{{{tex_escape(t_skills)}}}")
        else:
            lines.append(rf"  \resumeSubheadingSmall{{{title_str}}}{{{date_formatted}}}")
            
        # Description points
        desc_list = []
        if is_short and "resume_short_description" in proj:
            desc_list = proj["resume_short_description"]
        elif not is_short and "resume_description" in proj:
            desc_list = proj["resume_description"]
        else:
            desc_list = [p.strip() for p in proj.get("description", "").split("\n") if p.strip()]
            
        lines.append(r"  \resumeJustifiedList")
        for bullet in desc_list:
            lines.append(rf"    \resumeItem{{{tex_escape(bullet)}}}")
        lines.append(r"  \end{itemize}")
        
    lines.append(r"\resumeSubHeadingListEnd")
    lines.append(r"}")
    return "\n".join(lines)

def generate_awards_section(awards):
    lines = []
    lines.append(r"\section{Awards and Honors}")
    lines.append(r"{\normalsize")
    lines.append(r"\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt]")
    
    # Group identical awards
    groups = {}
    for award in awards:
        if not award.get("show_in_resume", True):
            continue
        key = (award["title"], award["awarder"])
        if key not in groups:
            groups[key] = []
        groups[key].append(award["date"])
        
    for (title, awarder), dates in groups.items():
        # Sort dates or format range hyphens
        formatted_dates = []
        for d in dates:
            d_formatted = d.replace("-", "--")
            formatted_dates.append(d_formatted)
        date_str = ", ".join(formatted_dates)
        
        lines.append(rf"  \item \textbf{{{tex_escape(title)}}}, {tex_escape(awarder)} \hfill {tex_escape(date_str)}")
        
    lines.append(r"\end{itemize}")
    lines.append(r"}")
    return "\n".join(lines)

def generate_service_section(services):
    lines = []
    lines.append(r"\section{Service}")
    lines.append(r"{\normalsize")
    lines.append(r"\begin{itemize}[leftmargin=0.15in, label=\textbullet, itemsep=0pt]")
    
    for svc in services:
        formatted = markdown_links_to_latex(svc)
        parts = formatted.split(",", 1)
        if len(parts) == 2:
            formatted = rf"\textbf{{{parts[0]}}},{parts[1]}"
        lines.append(rf"  \item {formatted}")
        
    lines.append(r"\end{itemize}")
    lines.append(r"}")
    return "\n".join(lines)

def compile_pdf(tex_path, output_pdf_name):
    # Runs pdflatex or latexmk on the generated tex file and copies the output PDF
    basename = os.path.basename(tex_path)
    jobname = os.path.splitext(basename)[0]
    
    print(f"Compiling {basename}...")
    
    # Try using pdflatex (supported widely)
    cmd = ["pdflatex", "-interaction=nonstopmode", "-output-directory", LATEX_SRC_DIR, tex_path]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print(f"Successfully compiled {basename} to PDF.")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Failed to compile with pdflatex: {e}")
        # print stdout/stderr to help debug
        if hasattr(e, 'stdout') and e.stdout:
            print("Output:")
            print(e.stdout.decode('utf-8', errors='ignore'))
        return False
        
    # Copy PDF to target directory
    generated_pdf_path = os.path.join(LATEX_SRC_DIR, f"{jobname}.pdf")
    dest_pdf_path = os.path.join(PUBLIC_DIR, output_pdf_name)
    
    if os.path.exists(generated_pdf_path):
        shutil.copy2(generated_pdf_path, dest_pdf_path)
        print(f"Copied compiled PDF to {dest_pdf_path}")
        return True
    else:
        print(f"Compiled PDF not found at {generated_pdf_path}")
        return False

def main():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Error: LaTeX template not found at {TEMPLATE_PATH}")
        return
        
    # Load config and templates
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()
        
    # Load JSON databases
    education_data = load_json("education.json")
    skills_data = load_json("skills.json")
    work_experience_data = load_json("work-experience.json")
    publications_data = load_json("publications.json")
    projects_data = load_json("projects.json")
    awards_data = load_json("awards.json")
    service_data = load_json("service.json")
    
    # Replace header contact details
    resume_contact = config.get("resume_contact", {})
    header_name = config.get("name", "Kunal Pai")
    header_phone = resume_contact.get("phone", "")
    header_email = resume_contact.get("email", "")
    header_linkedin = resume_contact.get("linkedin", "")
    header_github = resume_contact.get("github", "")
    header_website = resume_contact.get("website", "")
    
    # Prepare base template replacements
    base_template = template
    base_template = base_template.replace("<<NAME>>", header_name)
    base_template = base_template.replace("<<PHONE>>", header_phone)
    base_template = base_template.replace("<<EMAIL>>", header_email)
    base_template = base_template.replace("<<LINKEDIN>>", header_linkedin)
    base_template = base_template.replace("<<GITHUB>>", header_github)
    base_template = base_template.replace("<<WEBSITE>>", header_website)
    
    # Target PDF names (strip leading / from config resume paths)
    long_pdf_name = config.get("resume", "2 copy.pdf").lstrip("/")
    short_pdf_name = config.get("resume_short", "2.pdf").lstrip("/")
    
    # Target TeX names
    long_tex_name = os.path.splitext(long_pdf_name)[0] + ".tex"
    short_tex_name = os.path.splitext(short_pdf_name)[0] + ".tex"
    
    # Make sure latex_src output directory exists
    os.makedirs(LATEX_SRC_DIR, exist_ok=True)
    
    # Generate 1: Short Resume
    short_sections = [
        generate_education_section(education_data, is_short=True),
        generate_skills_section(skills_data, is_short=True),
        generate_experience_section(work_experience_data, is_short=True),
        generate_publications_section(publications_data, is_short=True),
        generate_projects_section(projects_data, is_short=True)
    ]
    short_tex_content = base_template.replace("<<SECTIONS>>", "\n\n".join(short_sections))
    short_tex_path = os.path.join(LATEX_SRC_DIR, short_tex_name)
    with open(short_tex_path, "w", encoding="utf-8") as f:
        f.write(short_tex_content)
    print(f"Generated {short_tex_path}")
    
    # Generate 2: Long Resume (CV)
    long_sections = [
        generate_education_section(education_data, is_short=False),
        generate_skills_section(skills_data, is_short=False),
        generate_experience_section(work_experience_data, is_short=False),
        generate_publications_section(publications_data, is_short=False),
        generate_projects_section(projects_data, is_short=False),
        generate_awards_section(awards_data),
        generate_service_section(service_data)
    ]
    long_tex_content = base_template.replace("<<SECTIONS>>", "\n\n".join(long_sections))
    long_tex_path = os.path.join(LATEX_SRC_DIR, long_tex_name)
    with open(long_tex_path, "w", encoding="utf-8") as f:
        f.write(long_tex_content)
    print(f"Generated {long_tex_path}")
    
    # Compile both resumes
    compile_pdf(short_tex_path, short_pdf_name)
    compile_pdf(long_tex_path, long_pdf_name)

if __name__ == "__main__":
    main()
