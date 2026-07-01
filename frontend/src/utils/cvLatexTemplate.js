function escapeLatex(value = '') {
  return String(value)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function transliterateToAscii(input = '') {
  // Normalize and remove diacritics, handle common Vietnamese 'đ' character
  return String(input)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function escapeLatexAscii(value = '') {
  return escapeLatex(transliterateToAscii(value));
}

function normalizeList(list) {
  return Array.isArray(list) ? list : [];
}

function renderAchievements(achievements) {
  const safe = normalizeList(achievements);
  if (safe.length === 0) {
    return '\\item N/A';
  }

  return safe
    .slice()
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
    .map(item => {
      const title = escapeLatex(item.title || 'Untitled achievement');
      const issuer = item.issuer ? `, ${escapeLatex(item.issuer)}` : '';
      const year = item.year ? ` \\hfill \\textbf{${escapeLatex(item.year)}}` : '';
      const desc = item.description
        ? `\\\\
\\textit{${escapeLatex(item.description)}}`
        : '';
      return `\\item ${title}${issuer}${year}${desc}`;
    })
    .join('\\n');
}

function renderEducation(educations) {
  const safe = normalizeList(educations);
  if (safe.length === 0) {
    return '\\textbf{N/A}';
  }

  return safe
    .slice()
    .sort((a, b) => Number(b.graduationYear || 0) - Number(a.graduationYear || 0))
    .map(item => {
      const degree = escapeLatex(item.degree || 'Degree');
      const major = escapeLatex(item.major || 'Major');
      const school = escapeLatex(item.schoolName || 'School');
      const year = item.graduationYear ? escapeLatex(item.graduationYear) : 'N/A';
      return `\\textbf{${degree} in ${major}} \\\\
${school} \\hfill \\textbf{${year}}`;
    })
    .join('\\n\\n');
}

function renderExperience(experiences) {
  const safe = normalizeList(experiences);
  if (safe.length === 0) {
    return '\\item N/A';
  }

  return safe
    .map(item => {
      const position = escapeLatex(item.position || 'Position');
      const company = escapeLatex(item.companyName || 'Company');
      const duration = escapeLatex(item.duration || 'N/A');
      const desc = item.jobDescription
        ? `\\\\
      ${escapeLatex(item.jobDescription)}`
        : '';

      return `\\item \\textbf{${position}} -- ${company} \\hfill \\textbf{${duration}}${desc}`;
    })
    .join('\\n');
}

function renderProjects(projects) {
  const safe = normalizeList(projects);
  if (safe.length === 0) {
    return '\\item N/A';
  }

  return safe
    .map(item => {
      const name = escapeLatex(item.projectName || 'Project');
      const role = escapeLatex(item.role || 'Role');
      const tech = item.technologies
        ? `\\\\
Technologies: ${escapeLatex(item.technologies)}`
        : '';
      const link = item.demoLink
        ? `\\\\
Link: \\url{${item.demoLink}}`
        : '';
      return `\\item \\textbf{${name}} (${role})${tech}${link}`;
    })
    .join('\\n');
}

function renderSkills(skills) {
  const safe = normalizeList(skills);
  if (safe.length === 0) {
    return 'N/A';
  }

  return safe
    .map(item => {
      const name = escapeLatex(item.skillName || 'Skill');
      const level = Number(item.proficiencyLevel || 0);
      return `${name} (Level ${level}/5)`;
    })
    .join(', ');
}

export function buildCvLatex(data) {
  const fullName = escapeLatexAscii(data?.candidate?.fullName || 'Candidate Name');
  const email = escapeLatexAscii(data?.email || data?.candidate?.email || 'candidate@example.com');
  const phone = escapeLatexAscii(data?.candidate?.phoneNumber || 'N/A');
  const address = escapeLatexAscii(data?.candidate?.address || 'N/A');

  const educationSection = renderEducation(data?.educations);
  const experienceSection = renderExperience(data?.experiences);
  const projectsSection = renderProjects(data?.projects);
  const achievementsSection = renderAchievements(data?.achievements);
  const skillsLine = renderSkills(data?.skills);

  return `\\documentclass[11pt,a4paper]{article}

\\usepackage[english]{babel}
\\usepackage[left=0.7in,right=0.7in,top=1in,bottom=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{titlesec}
\\usepackage[colorlinks=true, urlcolor=blue]{hyperref}

\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{1.2em}{0.6em}

\\setlist[itemize]{leftmargin=*, itemsep=0.3em}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{${fullName}}} \\\
Address: ${address}
\\end{center}

\\vspace{-0.5em}

\\section*{CONTACT INFORMATION}
{\\small
\\noindent
Email: ${email} \\;---\\;
Phone: ${phone}
}

\\section*{EDUCATION}
${educationSection}

\\section*{WORK EXPERIENCE}
\\begin{itemize}
${experienceSection}
\\end{itemize}

\\section*{PROJECTS}
\\begin{itemize}
${projectsSection}
\\end{itemize}

\\section*{ACHIEVEMENTS}
\\begin{itemize}
${achievementsSection}
\\end{itemize}

\\section*{SKILLS}
${skillsLine}

\\end{document}`;
}
