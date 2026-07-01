import { jsPDF } from 'jspdf';
import {
  candidateService,
  educationService,
  experienceService,
  projectService,
  skillService,
} from '../services/api';
import { buildCvLatex } from './cvLatexTemplate';

function getAchievementsStorageKey(accountId) {
  return `candidate_achievements_${accountId}`;
}

function safeArray(payload) {
  return Array.isArray(payload) ? payload : [];
}

function safeText(value, fallback = 'N/A') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function transliterateToAscii(input = '') {
  return String(input)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function englishText(value, fallback = 'N/A') {
  return transliterateToAscii(safeText(value, fallback));
}

function readAchievements(accountId) {
  try {
    const raw = localStorage.getItem(getAchievementsStorageKey(accountId));
    const parsed = raw ? JSON.parse(raw) : [];
    return safeArray(parsed);
  } catch (err) {
    console.error('Failed to read achievements from local storage:', err);
    return [];
  }
}

function addWrappedText(doc, text, x, y, width, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc, title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, 15, y);
  doc.setDrawColor(15, 98, 254);
  doc.line(15, y + 1.5, 195, y + 1.5);
  return y + 8;
}

async function fetchProfileData(accountId, fallbackEmail) {
  const [candidateRes, educationRes, experienceRes, skillRes, projectRes] =
    await Promise.allSettled([
      candidateService.getById(accountId),
      educationService.getByAccount(accountId),
      experienceService.getByAccount(accountId),
      skillService.getByAccount(accountId),
      projectService.getByAccount(accountId),
    ]);

  return {
    email: fallbackEmail || '',
    candidate: candidateRes.status === 'fulfilled' ? candidateRes.value.data : null,
    educations:
      educationRes.status === 'fulfilled' ? safeArray(educationRes.value.data) : [],
    experiences:
      experienceRes.status === 'fulfilled'
        ? safeArray(experienceRes.value.data)
        : [],
    skills: skillRes.status === 'fulfilled' ? safeArray(skillRes.value.data) : [],
    projects:
      projectRes.status === 'fulfilled' ? safeArray(projectRes.value.data) : [],
    achievements: readAchievements(accountId),
  };
}

export async function exportCandidateProfilePdf(accountId, fallbackEmail) {
  const profile = await fetchProfileData(accountId, fallbackEmail);
  const candidate = profile.candidate || {};
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(englishText(candidate.fullName, 'Candidate Profile'), 15, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y = addWrappedText(
    doc,
    `Email: ${englishText(profile.email || candidate.email)} | Phone: ${englishText(candidate.phoneNumber)} | Address: ${englishText(candidate.address)}`,
    15,
    y,
    180
  );

  y += 4;
  y = addSectionTitle(doc, 'Education', y);
  if (profile.educations.length === 0) {
    y = addWrappedText(doc, '- N/A', 18, y, 175);
  } else {
    profile.educations.forEach(item => {
        y = addWrappedText(
          doc,
          `- ${englishText(item.degree)} in ${englishText(item.major)} | ${englishText(item.schoolName)} (${englishText(item.graduationYear)})`,
          18,
          y,
          175
        );
    });
  }

  y += 2;
  y = addSectionTitle(doc, 'Work Experience', y);
  if (profile.experiences.length === 0) {
    y = addWrappedText(doc, '- N/A', 18, y, 175);
  } else {
    profile.experiences.forEach(item => {
        y = addWrappedText(
          doc,
          `- ${englishText(item.position)} at ${englishText(item.companyName)} (${englishText(item.duration)})`,
          18,
          y,
          175
        );
      if (item.jobDescription) {
        y = addWrappedText(doc, `  ${englishText(item.jobDescription, '')}`, 21, y, 172);
      }
    });
  }

  y += 2;
  y = addSectionTitle(doc, 'Projects', y);
  if (profile.projects.length === 0) {
    y = addWrappedText(doc, '- N/A', 18, y, 175);
  } else {
    profile.projects.forEach(item => {
      y = addWrappedText(
        doc,
        `- ${englishText(item.projectName)} (${englishText(item.role)})`,
        18,
        y,
        175
      );
      if (item.technologies) {
        y = addWrappedText(doc, `  Tech: ${safeText(item.technologies, '')}`, 21, y, 172);
      }
      if (item.demoLink) {
        y = addWrappedText(doc, `  Link: ${safeText(item.demoLink, '')}`, 21, y, 172);
      }
    });
  }

  y += 2;
  y = addSectionTitle(doc, 'Achievements', y);
  if (profile.achievements.length === 0) {
    y = addWrappedText(doc, '- N/A', 18, y, 175);
  } else {
    profile.achievements
      .slice()
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .forEach(item => {
        y = addWrappedText(
          doc,
          `- ${englishText(item.title)}${item.issuer ? ` | ${englishText(item.issuer, '')}` : ''}${item.year ? ` (${englishText(item.year, '')})` : ''}`,
          18,
          y,
          175
        );
        if (item.description) {
          y = addWrappedText(doc, `  ${safeText(item.description, '')}`, 21, y, 172);
        }
      });
  }

  y += 2;
  y = addSectionTitle(doc, 'Skills', y);
  const skillLine =
    profile.skills.length === 0
      ? 'N/A'
      : profile.skills
          .map(item => `${englishText(item.skillName)} (${englishText(item.proficiencyLevel)}/5)`)
          .join(', ');
  addWrappedText(doc, skillLine, 18, y, 175);

  const latexString = buildCvLatex(profile);
  doc.setProperties({
    title: `${safeText(candidate.fullName, 'candidate')}-cv`,
    subject: 'Candidate CV export',
    keywords: 'cv,resume,recruitment,latex',
    creator: 'Recruitment System',
  });

  // Keep the generated LaTeX for reuse/debugging without changing the PDF flow.
  localStorage.setItem('last_generated_cv_latex', latexString);

  const filenameBase = safeText(candidate.fullName, 'candidate')
    .toLowerCase()
    .replace(/\s+/g, '-');
  doc.save(`${filenameBase}-cv.pdf`);
}
