import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { 
  candidateService, 
  employerService, 
  jobApplicationService, 
  assessmentAssignmentService,
  jobPostService,
  examService,
  educationService,
  experienceService,
  skillService,
  projectService
} from '../../services/api';
import { invitationService } from '../../services/invitationService';
import { exportCandidateProfilePdf } from '../../utils/cvExport';
import { generateId } from '../../utils/idGenerator';
import '../../styles/Dashboard.css';

const parseEducationMajor = (majorStr) => {
  if (majorStr && majorStr.includes('||')) {
    const parts = majorStr.split('||');
    return {
      major: parts[0]?.trim() || '',
      gpa: parts[1]?.trim() || '',
      startYear: parts[2]?.trim() || '',
      description: parts[3]?.trim() || ''
    };
  }
  return {
    major: majorStr || '',
    gpa: '',
    startYear: '',
    description: ''
  };
};

const serializeEducationMajor = (major, gpa, startYear, description) => {
  return `${major || ''} || ${gpa || ''} || ${startYear || ''} || ${description || ''}`;
};

const parseExperienceDuration = (durationStr) => {
  if (durationStr && durationStr.includes('||')) {
    const parts = durationStr.split('||');
    return {
      startDate: parts[0]?.trim() || '',
      endDate: parts[1]?.trim() || '',
      employmentType: parts[2]?.trim() || '',
      location: parts[3]?.trim() || '',
      isCurrent: parts[4] === 'true'
    };
  }
  const parts = durationStr ? durationStr.split('-') : [];
  return {
    startDate: parts[0]?.trim() || '',
    endDate: parts[1]?.trim() || '',
    employmentType: 'Full-time',
    location: '',
    isCurrent: durationStr ? durationStr.toLowerCase().includes('present') : false
  };
};

const serializeExperienceDuration = (startDate, endDate, employmentType, location, isCurrent) => {
  return `${startDate || ''} || ${endDate || ''} || ${employmentType || ''} || ${location || ''} || ${isCurrent}`;
};

export default function Profile() {
  const { user, email } = useAuth();
  const { showToast } = useToast();
  
  const accountId = useMemo(() => user?.accountId || user?.id, [user]);
  const isEmployer = user?.userType === 'EMPLOYER';

  // State definitions
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    avatarUrl: '',
    jobSeekingStatus: 'SEEKING_JOB',
    companyName: '',
    companySize: 0,
    website: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic Bio & Headline for Candidate (stored in localStorage for persistence)
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [careerObjective, setCareerObjective] = useState('');
  const [jobPreferences, setJobPreferences] = useState('');

  // Qualifications data states
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // Password / Security states
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    emailAlerts: true,
    publicProfile: true
  });

  // Statistics & Overview States
  const [stats, setStats] = useState({
    totalApps: 0,
    pendingApps: 0,
    completedTests: 0,
    activeJobsCount: 0,
    assessmentsCreated: 0
  });
  const [history, setHistory] = useState([]);

  // Avatar and Resume states
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Modal dialog states
  const [activeModal, setActiveModal] = useState(null); // 'personal' | 'experience' | 'education' | 'skill' | 'project' | 'certification' | 'security'
  const [modalData, setModalData] = useState(null);

  // Navigation tab for the settings panel
  const [settingsTab, setSettingsTab] = useState('profile'); // profile | account
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Inline editing states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    avatarUrl: '',
    jobSeekingStatus: 'SEEKING_JOB',
    companyName: '',
    companySize: 0,
    website: '',
    description: '',
    headline: '',
    bio: '',
    careerObjective: '',
    jobPreferences: ''
  });
  const [editImageError, setEditImageError] = useState(false);
  const [editImageLoading, setEditImageLoading] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const currentTags = editForm.jobPreferences
      ? editForm.jobPreferences.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];
    if (!currentTags.includes(trimmed)) {
      const updated = [...currentTags, trimmed].join(', ');
      setEditForm({ ...editForm, jobPreferences: updated });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentTags = editForm.jobPreferences
      ? editForm.jobPreferences.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];
    const updated = currentTags.filter(t => t !== tagToRemove).join(', ');
    setEditForm({ ...editForm, jobPreferences: updated });
  };

  const handleStartEdit = () => {
    setEditForm({
      email: form.email,
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      address: form.address,
      avatarUrl: form.avatarUrl,
      jobSeekingStatus: form.jobSeekingStatus,
      companyName: form.companyName,
      companySize: form.companySize,
      website: form.website,
      description: form.description,
      headline: headline,
      bio: bio,
      careerObjective: careerObjective,
      jobPreferences: jobPreferences
    });
    setEditImageError(false);
    setEditImageLoading(false);
    setIsEditingPersonal(true);
    setActiveSubTab('edit');
  };

  const handleUpdateProfileInline = async (e) => {
    e.preventDefault();

    const formData = editForm;
    const displayedEmail = editForm.email;
    const emailBeingValidated = editForm.email ? editForm.email.trim() : '';

    // Verify Save Button State
    const isValid = true; // Assuming valid since not explicitly tracked
    const isDirty = true; // Assuming dirty since not explicitly tracked
    const disabled = saving; // Form disabled state
    const formState = editForm;
    console.log({
      isValid,
      isDirty,
      disabled,
      formState
    });

    console.log("Submitting profile form");
    console.log(formData);
    console.log("Displayed Email:", displayedEmail);
    console.log("Form Email:", formData.email);
    console.log("Validation Email:", emailBeingValidated);

    if (isEmployer) {
      if (!editForm.companyName || editForm.companyName.trim() === '') {
        showToast('Company Name cannot be blank', 'error');
        return;
      }
    } else {
      if (!editForm.fullName || editForm.fullName.trim() === '') {
        showToast('Full Name cannot be blank', 'error');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+(?:\.[^\s@]+)*$/;
    const trimmedEmail = emailBeingValidated;
    
    console.log("Profile form state:", editForm);
    console.log("Email field value:", editForm.email);
    console.log("Validation input:", trimmedEmail);

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (editForm.avatarUrl && editForm.avatarUrl.trim() !== '') {
      const urlPattern = /^https?:\/\/\S+/i;
      if (!urlPattern.test(editForm.avatarUrl)) {
        showToast('The provided URL does not point directly to an image file. Please use a direct image URL.', 'error');
        return;
      }
      if (editImageError) {
        showToast('The provided URL does not point directly to an image file. Please use a direct image URL.', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = isEmployer
        ? {
            email: trimmedEmail,
            companyName: editForm.companyName,
            companySize: parseInt(editForm.companySize, 10) || 0,
            website: editForm.website,
            address: editForm.address,
            description: editForm.description,
            avatarUrl: editForm.avatarUrl
          }
        : {
            email: trimmedEmail,
            fullName: editForm.fullName,
            phoneNumber: editForm.phoneNumber,
            address: editForm.address,
            avatarUrl: editForm.avatarUrl,
            jobSeekingStatus: editForm.jobSeekingStatus
          };

      console.log("Profile update payload:", payload);

      if (isEmployer) {
        await employerService.update(accountId, payload);
      } else {
        await candidateService.update(accountId, payload);
        localStorage.setItem(`headline_${accountId}`, editForm.headline);
        localStorage.setItem(`bio_${accountId}`, editForm.bio);
        localStorage.setItem(`careerObjective_${accountId}`, editForm.careerObjective);
        localStorage.setItem(`jobPreferences_${accountId}`, editForm.jobPreferences);
        setCareerObjective(editForm.careerObjective);
        setJobPreferences(editForm.jobPreferences);
      }
      showToast('Profile updated successfully!', 'success');
      setIsEditingPersonal(false);
      setActiveSubTab('overview');
      loadProfileData();
    } catch (err) {
      console.error('Failed to save profile details', err);
      showToast('Failed to save profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      loadProfileData();
      loadActivityData();
      loadQualificationsData();
    }
  }, [accountId]);

  useEffect(() => {
    setImageError(false);
    if (form.avatarUrl && form.avatarUrl.trim() !== '') {
      setImageLoading(true);
    } else {
      setImageLoading(false);
    }
  }, [form.avatarUrl]);

  useEffect(() => {
    if (!editForm.avatarUrl || editForm.avatarUrl.trim() === '') {
      setEditImageError(false);
      setEditImageLoading(false);
      return;
    }

    const urlPattern = /^https?:\/\/\S+/i;
    if (!urlPattern.test(editForm.avatarUrl)) {
      setEditImageError(true);
      setEditImageLoading(false);
      return;
    }

    setEditImageLoading(true);
    setEditImageError(false);

    const img = new Image();
    let isMounted = true;

    img.onload = () => {
      if (isMounted) {
        setEditImageError(false);
        setEditImageLoading(false);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setEditImageError(true);
        setEditImageLoading(false);
      }
    };

    img.src = editForm.avatarUrl;

    return () => {
      isMounted = false;
    };
  }, [editForm.avatarUrl]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = isEmployer
        ? await employerService.getById(accountId)
        : await candidateService.getById(accountId);
      
      if (response.data) {
        setForm({
          email: response.data.email || email || '',
          fullName: response.data.fullName || '',
          phoneNumber: response.data.phoneNumber || '',
          address: response.data.address || '',
          avatarUrl: response.data.avatarUrl || '',
          jobSeekingStatus: response.data.jobSeekingStatus || 'SEEKING_JOB',
          companyName: response.data.companyName || '',
          companySize: response.data.companySize || 0,
          website: response.data.website || '',
          description: response.data.description || ''
        });

        // Load custom bio & headline for Candidate
        if (!isEmployer) {
          const storedHeadline = localStorage.getItem(`headline_${accountId}`);
          const storedBio = localStorage.getItem(`bio_${accountId}`);
          const storedObjective = localStorage.getItem(`careerObjective_${accountId}`);
          const storedPreferences = localStorage.getItem(`jobPreferences_${accountId}`);
          setHeadline(storedHeadline || 'Software Engineer seeking new opportunities');
          setBio(storedBio || 'No summary provided yet. Click Edit Profile to add an About Me biography.');
          setCareerObjective(storedObjective || 'To leverage my skills in building scalable, user-centric web applications and drive technical excellence in a collaborative team environment.');
          setJobPreferences(storedPreferences || 'Full-time, Remote, Senior Software Engineer');
        }
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
      showToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityData = async () => {
    try {
      if (isEmployer) {
        const [jobsRes, examsRes] = await Promise.all([
          jobPostService.getByEmployer(accountId),
          examService.getByEmployer(accountId)
        ]);
        const jobs = jobsRes.data || [];
        setStats({
          activeJobsCount: jobs.filter(j => j.status === 'OPEN').length,
          assessmentsCreated: (examsRes.data || []).length
        });
      } else {
        const [appsRes, resultsRes] = await Promise.all([
          jobApplicationService.getByCandidate(accountId),
          assessmentAssignmentService.getByCandidate(accountId)
        ]);
        const apps = appsRes.data || [];
        const results = (resultsRes.data || []).filter(a => a.status === 'Submitted');
        setStats({
          totalApps: apps.length,
          pendingApps: apps.filter(a => a.status === 'PENDING' || a.status === 'SUBMITTED').length,
          completedTests: results.length
        });
        setHistory(results);
      }
    } catch (err) {
      console.error('Failed to load activity statistics', err);
    }
  };

  const loadQualificationsData = async () => {
    if (isEmployer) return;
    try {
      const [eduRes, expRes, skillRes, projRes] = await Promise.all([
        educationService.getByAccount(accountId),
        experienceService.getByAccount(accountId),
        skillService.getByAccount(accountId),
        projectService.getByAccount(accountId)
      ]);
      setEducations(eduRes.data || []);
      setExperiences(expRes.data || []);
      setSkills(skillRes.data || []);
      setProjects(projRes.data || []);

      // Load certifications from localStorage
      const certKey = `candidate_achievements_${accountId}`;
      const storedCerts = localStorage.getItem(certKey);
      setCertifications(storedCerts ? JSON.parse(storedCerts) : []);

      // Load resume details
      const storedResume = localStorage.getItem(`resume_${accountId}`);
      setResumeFile(storedResume ? JSON.parse(storedResume) : null);
    } catch (err) {
      console.error('Failed to load qualifications data', err);
    }
  };

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };



  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please fill out all password fields', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Password updated successfully! (Simulation)', 'success');
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setActiveModal(null);
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportCandidateProfilePdf(accountId, email);
      showToast('CV PDF generated successfully!', 'success');
    } catch (err) {
      console.error('CV PDF generation error:', err);
      showToast('Failed to generate PDF. Try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // CRUD Operations handlers for Education
  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.schoolName || !modalData.major || !modalData.degree) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    try {
      const serializedMajor = serializeEducationMajor(
        modalData.major,
        modalData.gpa,
        modalData.startYear,
        modalData.description
      );
      
      const payload = {
        schoolName: modalData.schoolName,
        degree: modalData.degree,
        major: serializedMajor,
        graduationYear: parseInt(modalData.graduationYear, 10) || new Date().getFullYear(),
        accountId
      };

      if (modalData.educationId) {
        await educationService.update(accountId, modalData.educationId, {
          ...payload,
          educationId: modalData.educationId
        });
        showToast('Education record updated!', 'success');
      } else {
        await educationService.create({
          ...payload,
          educationId: generateId(),
          accountId
        });
        showToast('Education record added!', 'success');
      }
      setActiveModal(null);
      loadQualificationsData();
    } catch (err) {
      showToast('Failed to save education record', 'error');
    }
  };

  const handleEducationDelete = async (eduId) => {
    if (window.confirm('Delete this education record?')) {
      try {
        await educationService.delete(accountId, eduId);
        showToast('Education record removed', 'info');
        loadQualificationsData();
      } catch (err) {
        showToast('Failed to delete education record', 'error');
      }
    }
  };

  // CRUD Operations handlers for Experience
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.companyName || !modalData.position) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    try {
      const serializedDuration = serializeExperienceDuration(
        modalData.startDate,
        modalData.endDate,
        modalData.employmentType,
        modalData.location,
        modalData.isCurrent
      );

      const payload = {
        companyName: modalData.companyName,
        position: modalData.position,
        duration: serializedDuration,
        jobDescription: modalData.jobDescription || '',
        accountId
      };

      if (modalData.experienceId) {
        await experienceService.update(accountId, modalData.experienceId, {
          ...payload,
          experienceId: modalData.experienceId
        });
        showToast('Experience record updated!', 'success');
      } else {
        await experienceService.create({
          ...payload,
          experienceId: generateId(),
          accountId
        });
        showToast('Experience record added!', 'success');
      }
      setActiveModal(null);
      loadQualificationsData();
    } catch (err) {
      showToast('Failed to save experience record', 'error');
    }
  };

  const handleExperienceDelete = async (expId) => {
    if (window.confirm('Delete this experience record?')) {
      try {
        await experienceService.delete(accountId, expId);
        showToast('Experience record removed', 'info');
        loadQualificationsData();
      } catch (err) {
        showToast('Failed to delete experience record', 'error');
      }
    }
  };

  // CRUD Operations handlers for Skills
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.skillName && (!modalData.tags || modalData.tags.length === 0)) {
      showToast('Please specify at least one skill', 'warning');
      return;
    }
    try {
      if (modalData.skillId) {
        await skillService.update(accountId, modalData.skillId, {
          skillName: modalData.skillName,
          proficiencyLevel: modalData.proficiencyLevel || 3,
          skillId: modalData.skillId,
          accountId
        });
        showToast('Skill updated!', 'success');
      } else {
        const tags = modalData.tags && modalData.tags.length > 0 ? modalData.tags : [modalData.skillName];
        await Promise.all(tags.map(tag => 
          skillService.create({
            skillName: tag,
            proficiencyLevel: modalData.proficiencyLevel || 3,
            skillId: generateId(),
            accountId
          })
        ));
        showToast(`${tags.length} skill(s) added!`, 'success');
      }
      setActiveModal(null);
      loadQualificationsData();
    } catch (err) {
      showToast('Failed to save skill record', 'error');
    }
  };

  const handleSkillDelete = async (skillId) => {
    if (window.confirm('Delete this skill?')) {
      try {
        await skillService.delete(accountId, skillId);
        showToast('Skill removed', 'info');
        loadQualificationsData();
      } catch (err) {
        showToast('Failed to delete skill', 'error');
      }
    }
  };

  // CRUD Operations handlers for Projects
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.projectName || !modalData.role) {
      showToast('Please fill in required fields', 'warning');
      return;
    }
    try {
      if (modalData.projectId) {
        await projectService.update(accountId, modalData.projectId, {
          ...modalData,
          accountId
        });
        showToast('Project updated!', 'success');
      } else {
        await projectService.create({
          ...modalData,
          projectId: generateId(),
          accountId
        });
        showToast('Project added!', 'success');
      }
      setActiveModal(null);
      loadQualificationsData();
    } catch (err) {
      showToast('Failed to save project record', 'error');
    }
  };

  const handleProjectDelete = async (projId) => {
    if (window.confirm('Delete this project?')) {
      try {
        await projectService.delete(accountId, projId);
        showToast('Project removed', 'info');
        loadQualificationsData();
      } catch (err) {
        showToast('Failed to delete project', 'error');
      }
    }
  };

  // CRUD Operations handlers for Certifications
  const handleCertificationSubmit = (e) => {
    e.preventDefault();
    if (!modalData.title || !modalData.year) {
      showToast('Title and year are required', 'warning');
      return;
    }

    const payload = {
      achievementId: modalData.achievementId || generateId(),
      title: modalData.title.trim(),
      issuer: modalData.issuer ? modalData.issuer.trim() : '',
      year: Number(modalData.year),
      description: modalData.description ? modalData.description.trim() : ''
    };

    const nextCerts = modalData.achievementId
      ? certifications.map(c => c.achievementId === modalData.achievementId ? payload : c)
      : [...certifications, payload];

    localStorage.setItem(`candidate_achievements_${accountId}`, JSON.stringify(nextCerts));
    setCertifications(nextCerts);
    showToast('Certification saved!', 'success');
    setActiveModal(null);
  };

  const handleCertificationDelete = (certId) => {
    if (window.confirm('Delete this certification?')) {
      const nextCerts = certifications.filter(c => c.achievementId !== certId);
      localStorage.setItem(`candidate_achievements_${accountId}`, JSON.stringify(nextCerts));
      setCertifications(nextCerts);
      showToast('Certification removed', 'info');
    }
  };

  const displayInitials = (isEmployer ? form.companyName : form.fullName || 'U').charAt(0).toUpperCase();

  const getProficiencyLabel = (val) => {
    switch (val) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Intermediate';
    }
  };

  return (
    <div className="dashboard-container">
      <style>{`
        /* Profile Header Cover style integrated into platform context */
        .as-profile-cover-card {
          background: #ffffff;
          border: 1px solid #ececec;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
          margin-bottom: 2rem;
          position: relative;
        }
        .as-profile-header-content {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }
        @media (max-width: 768px) {
          .as-profile-header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
          }
        }
        
        .as-avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .as-avatar-display {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #ffffff;
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
          color: #ffffff;
          font-size: 3rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .as-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }


        .as-header-info {
          flex: 1;
          margin-bottom: 0.5rem;
        }
        .as-header-info h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }
        .as-header-headline {
          font-size: 1rem;
          color: #4b5563;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
        }
        .as-header-meta-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .as-header-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .as-header-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-self: center;
        }
        @media (max-width: 768px) {
          .as-header-actions {
            width: 100%;
            flex-direction: row;
            justify-content: center;
          }
        }

        /* Two-Column layout for summary panel vs content lists */
        .as-profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .as-profile-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Platform unified card style */
        .as-card {
          background: #ffffff;
          border: 1px solid #ececec;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
          margin-bottom: 1.5rem;
        }
        .as-card-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1.25rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.75rem;
        }
        .as-card-title span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Skill badges & labels */
        .as-skills-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .as-skill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .as-skill-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #334155;
        }
        .as-skill-level {
          font-size: 0.75rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #475569;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        /* Timelines & lists inside main card content */
        .as-timeline {
          position: relative;
          padding-left: 1.5rem;
          border-left: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .as-timeline-item {
          position: relative;
        }
        .as-timeline-dot {
          position: absolute;
          left: -1.95rem;
          top: 0.25rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #64748b;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 3px #cbd5e1;
        }
        .as-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .as-item-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .as-item-subtitle {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin: 0.15rem 0 0.25rem 0;
        }
        .as-item-meta {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .as-item-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #475569;
          margin: 0;
          white-space: pre-line;
        }
        
        /* Modal Window styling */
        .as-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .as-modal {
          background: #ffffff;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          animation: modalSlideUp 0.3s ease-out;
        }
        @keyframes modalSlideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .as-modal-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .as-modal-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .as-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
        }
        .as-modal-body {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }
        .as-modal-footer {
          border-top: 1px solid #e2e8f0;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .as-btn-primary {
          background: #0f62fe;
          color: #ffffff;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .as-btn-primary:hover {
          background: #0b4fc2;
        }
        .as-btn-secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .as-btn-secondary:hover {
          background: #e2e8f0;
        }
        .as-btn-icon {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .as-btn-icon:hover {
          color: #0f62fe;
          background: #f1f5f9;
        }
        .as-btn-danger {
          color: #ef4444;
        }
        .as-btn-danger:hover {
          color: #b91c1c;
          background: #fee2e2;
        }

        /* Empty State */
        .as-empty-box {
          text-align: center;
          padding: 2rem 1rem;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          color: #64748b;
          font-size: 0.85rem;
        }
        .as-empty-box span {
          font-size: 1.75rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        /* Settings structure style */
        .as-settings-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .as-settings-info h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.15rem 0;
        }
        .as-settings-info p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        /* Enterprise Form Controls & Labels Styling */
        .as-form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          align-items: stretch;
          width: 100%;
        }
        .as-form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.15rem;
          display: inline-block;
          text-align: left;
        }
        .as-form-group label span.as-label-helper {
          display: block;
          font-size: 0.75rem;
          font-weight: 400;
          color: #64748b;
          margin-top: 0.15rem;
        }
        .as-input-txt {
          box-sizing: border-box;
          width: 100%;
          height: 46px;
          padding: 0.75rem 1rem;
          font-family: inherit;
          font-size: 0.925rem;
          font-weight: 500;
          color: #0f172a;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .as-input-txt::placeholder {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 400;
        }
        .as-input-txt:focus {
          border-color: #0f62fe;
          box-shadow: 0 0 0 4px rgba(15, 98, 254, 0.12);
          outline: none;
        }
        .as-input-txt:hover:not(:focus) {
          border-color: #94a3b8;
        }
        
        /* Textarea customization */
        textarea.as-input-txt {
          min-height: 140px;
          height: auto;
          resize: vertical;
          line-height: 1.5;
        }
        
        /* Select dropdown customization */
        select.as-input-txt {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.1em;
          padding-right: 2.5rem;
          cursor: pointer;
        }
        select.as-input-txt:focus {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f62fe' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        }

        /* Form Grid and Sections */
        .as-form-section-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          margin: 1.5rem 0 0.75rem 0;
          padding-bottom: 0.35rem;
          border-bottom: 1.5px solid #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .as-form-section-title:first-of-type {
          margin-top: 0;
        }
        .as-form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .as-form-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        /* Skill tag input */
        .as-skills-tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          min-height: 46px;
          background: #ffffff;
          align-items: center;
        }
        .as-skill-tag {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          color: #1d4ed8;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #bfdbfe;
        }
        .as-skill-tag-remove {
          background: none;
          border: none;
          color: #3b82f6;
          margin-left: 0.35rem;
          cursor: pointer;
          font-weight: bold;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
        }
        .as-skill-tag-remove:hover {
          color: #1d4ed8;
        }

        /* Experience Timeline Preview */
        .as-timeline-preview-card {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px dashed #cbd5e1;
        }

        /* Modern Document Grid and Card */
        .as-document-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-top: 1rem;
        }
        .as-document-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        .as-document-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Loading Profile Dashboard...</h2>
          <div className="avatar-spinner" style={{ margin: '2rem auto' }}></div>
        </div>
      ) : (
        <>
            {/* Header section Cover / Always rendered now */}
            <div className="as-profile-cover-card">
              <div className="as-profile-header-content">
                
                <div className="as-avatar-container">
                  <div className="as-avatar-display">
                    {form.avatarUrl && form.avatarUrl.trim() !== '' && !imageError ? (
                      <img 
                        src={form.avatarUrl} 
                        alt={form.fullName || form.companyName} 
                        className="as-avatar-image"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      displayInitials
                    )}
                  </div>
                </div>

                <div className="as-header-info">
                  <h1>{isEmployer ? form.companyName : form.fullName || 'User Profile'}</h1>
                  <p className="as-header-headline">
                    {isEmployer ? `Recruiter Profile` : headline}
                  </p>
                  <ul className="as-header-meta-list">
                    <li className="as-header-meta-item">
                      <span>📧</span> {form.email}
                    </li>
                    {form.phoneNumber && (
                      <li className="as-header-meta-item">
                        <span>📞</span> {form.phoneNumber}
                      </li>
                    )}
                    {form.address && (
                      <li className="as-header-meta-item">
                        <span>📍</span> {form.address}
                      </li>
                    )}
                    {!isEmployer && (
                      <li className="as-header-meta-item">
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          background: form.jobSeekingStatus === 'SEEKING_JOB' ? '#d1fae5' : '#f1f5f9',
                          color: form.jobSeekingStatus === 'SEEKING_JOB' ? '#065f46' : '#475569',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {form.jobSeekingStatus === 'SEEKING_JOB' ? 'Seeking Opportunities' : 'Not Open to Job Seek'}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="as-header-actions">
                  <button 
                    className="as-btn-primary" 
                    onClick={handleStartEdit}
                  >
                    ✏️ Edit Profile
                  </button>
                  {!isEmployer && (
                    <button 
                      className="as-btn-secondary" 
                      onClick={handleExportPdf}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Generating...' : '📄 Download CV'}
                    </button>
                  )}
                  <button 
                    className="as-btn-secondary"
                    onClick={() => setActiveSubTab('settings')}
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </div>

          {/* Sub-Tab Navigation Bar */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: '#f8fafc',
            padding: '0.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {(isEmployer 
              ? [
                  { id: 'overview', label: '👁️ Overview' },
                  { id: 'edit', label: '✏️ Edit Profile' },
                  { id: 'settings', label: '⚙️ Account Settings' }
                ]
              : [
                  { id: 'overview', label: '👁️ Overview' },
                  { id: 'edit', label: '✏️ Edit Profile' },
                  { id: 'experience', label: '💼 Experience' },
                  { id: 'education', label: '🎓 Education' },
                  { id: 'certifications', label: '🏆 Certifications' },
                  { id: 'documents', label: '📁 Documents' },
                  { id: 'settings', label: '⚙️ Account Settings' }
                ]
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'edit') {
                    handleStartEdit();
                  } else {
                    setActiveSubTab(tab.id);
                  }
                }}
                style={{
                  background: activeSubTab === tab.id ? '#0f62fe' : 'transparent',
                  color: activeSubTab === tab.id ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: activeSubTab === tab.id ? '0 4px 6px -1px rgba(15, 98, 254, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conditional Sub-Tab Rendering */}
          {activeSubTab === 'overview' && (
            <div className="as-profile-grid">
              
              {/* Left Content Summary Panel */}
              <div className="as-profile-summary-panel">
                
                {/* Contact Card */}
                <div className="as-card">
                  <h3 className="as-card-title">
                    <span>📞 Contact Information</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>EMAIL ADDRESS</label>
                      <span style={{ fontWeight: 600 }}>{form.email}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PHONE NUMBER</label>
                      <span style={{ fontWeight: 600 }}>{form.phoneNumber || 'Not Provided'}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>LOCATION</label>
                      <span style={{ fontWeight: 600 }}>{form.address || 'Not Provided'}</span>
                    </div>
                    {isEmployer && form.website && (
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>WEBSITE</label>
                        <a 
                          href={form.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            color: '#0f62fe', 
                            fontWeight: 600, 
                            display: 'block', 
                            wordBreak: 'break-all', 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap', 
                            maxWidth: '100%' 
                          }}
                        >
                          {form.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills summary for Candidate */}
                {!isEmployer && (
                  <div className="as-card">
                    <h3 className="as-card-title">
                      <span>⚡ Key Skills</span>
                      <button 
                        className="as-btn-icon" 
                        title="Add Skill"
                        onClick={() => {
                          setModalData({ skillName: '', proficiencyLevel: 3 });
                          setActiveModal('skill');
                        }}
                      >
                        ➕
                      </button>
                    </h3>
                    {skills.length === 0 ? (
                      <div className="as-empty-box" style={{ padding: '1rem' }}>No skills cataloged</div>
                    ) : (
                      <div className="as-skills-container">
                        {skills.map(s => (
                          <div key={s.skillId} className="as-skill-item">
                            <span className="as-skill-name">{s.skillName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="as-skill-level">{getProficiencyLabel(s.proficiencyLevel)}</span>
                              <button className="as-btn-icon as-btn-danger" onClick={() => handleSkillDelete(s.skillId)}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Card */}
                {!isEmployer && (
                  <div className="as-card">
                    <h3 className="as-card-title">
                      <span>📁 Documents & CV</span>
                    </h3>
                    {resumeFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '1.5rem' }}>📄</span>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{resumeFile.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{resumeFile.size}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="as-btn-secondary" 
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                            onClick={() => showToast(`Simulated download: ${resumeFile.name}`, 'success')}
                          >
                            Download
                          </button>
                          <button 
                            className="as-btn-secondary" 
                            style={{ color: '#ef4444', padding: '0.4rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              localStorage.removeItem(`resume_${accountId}`);
                              setResumeFile(null);
                              showToast('Resume removed', 'info');
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>Upload your resume document (PDF/DOCX)</p>
                        <label className="as-btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem', cursor: 'pointer' }}>
                          {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const ext = file.name.split('.').pop()?.toLowerCase();
                              if (!['pdf', 'doc', 'docx'].includes(ext)) {
                                showToast('Format must be PDF, DOC, or DOCX', 'error');
                                return;
                              }
                              setUploadingResume(true);
                              setTimeout(() => {
                                const payload = {
                                  name: file.name,
                                  size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                  uploadedAt: new Date().toLocaleDateString()
                                };
                                localStorage.setItem(`resume_${accountId}`, JSON.stringify(payload));
                                setResumeFile(payload);
                                setUploadingResume(false);
                                showToast('Resume uploaded!', 'success');
                              }, 1000);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Statistics Overview Card */}
                <div className="as-card">
                  <h3 className="as-card-title">
                    <span>📈 Stats Overview</span>
                  </h3>
                  {isEmployer ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{stats.activeJobsCount}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ACTIVE JOBS</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{stats.assessmentsCreated}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ASSESSMENTS</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{stats.totalApps}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>APPLICATIONS</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{stats.pendingApps}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>PENDING</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{stats.completedTests}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>EXAMS</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Main Content Area - Content Sections */}
              <div className="as-profile-content-sections">

                {/* About Section */}
                <div className="as-card">
                  <h3 className="as-card-title">
                    <span>👤 About & Biography</span>
                  </h3>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {isEmployer ? form.description || 'No company overview description provided.' : bio}
                  </p>
                </div>

                {/* Recruiter Activity / Submissions */}
                {!isEmployer && history.length > 0 && (
                  <div className="as-card">
                    <h3 className="as-card-title">
                      <span>📝 Completed Assessment Records</span>
                    </h3>
                    <div className="as-table-container">
                      <table className="as-table">
                        <thead>
                          <tr>
                            <th>Exam Title</th>
                            <th>Duration</th>
                            <th>Performance Score</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map(h => (
                            <tr key={h.assignmentId}>
                              <td style={{ fontWeight: 'bold' }}>{h.assessment?.title || 'Candidate Assessment'}</td>
                              <td>{h.assessment?.durationMinutes || 0} minutes</td>
                              <td style={{ color: '#10b981', fontWeight: 'bold' }}>{h.score}%</td>
                              <td>
                                <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  Graded
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {activeSubTab === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <form onSubmit={handleUpdateProfileInline} style={{ position: 'relative' }}>
                
                {/* 1. Personal Information Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                    👤 {isEmployer ? 'Company Information' : 'Personal Information'}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {isEmployer ? (
                      <>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Company Name *</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.companyName} 
                            onChange={e => setEditForm({...editForm, companyName: e.target.value})} 
                            required 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Company Size (Employees)</label>
                          <input 
                            type="number" 
                            className="as-input-txt" 
                            value={editForm.companySize} 
                            onChange={e => setEditForm({...editForm, companySize: parseInt(e.target.value, 10) || 0})} 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Website URL</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.website} 
                            onChange={e => setEditForm({...editForm, website: e.target.value})} 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>HQ Address</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.address} 
                            onChange={e => setEditForm({...editForm, address: e.target.value})} 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Full Name *</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.fullName} 
                            onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
                            required 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Professional Title / Headline</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.headline} 
                            onChange={e => setEditForm({...editForm, headline: e.target.value})} 
                            placeholder="e.g. Senior Software Architect"
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Phone Number</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.phoneNumber} 
                            onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} 
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div className="as-form-group">
                          <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Location / Address</label>
                          <input 
                            className="as-input-txt" 
                            value={editForm.address} 
                            onChange={e => setEditForm({...editForm, address: e.target.value})} 
                            placeholder="e.g. San Francisco, CA"
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </>
                    )}
                    <div className="as-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Contact Email Address *</label>
                      <input 
                        type="email" 
                        className="as-input-txt" 
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})} 
                        required 
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Profile Summary Card (About Me) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                    📝 {isEmployer ? 'Company Description' : 'Profile Summary'}
                  </h3>
                  <div className="as-form-group">
                    <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                      {isEmployer ? 'Describe your company mission and workspace...' : 'About Me (Write a brief summary of your background, experience, and what you are looking for)'}
                    </label>
                    <textarea 
                      className="as-input-txt" 
                      rows="6" 
                      value={isEmployer ? editForm.description : editForm.bio} 
                      onChange={e => isEmployer ? setEditForm({...editForm, description: e.target.value}) : setEditForm({...editForm, bio: e.target.value})}
                      placeholder={isEmployer ? "Company mission, vision, tech stack..." : "e.g. I am a passionate Software Engineer with 5+ years of experience..."}
                      style={{ padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', lineHeight: '1.5', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* 3. Avatar Settings Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                    🖼️ Avatar Settings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    
                    {/* Centered Large Circular Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Avatar Preview</span>
                      <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        border: '3px solid #0f62fe',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8fafc',
                        boxShadow: '0 10px 15px -3px rgba(15, 98, 254, 0.1)',
                        overflow: 'hidden'
                      }}>
                        {editForm.avatarUrl && editForm.avatarUrl.trim() !== '' && !editImageError ? (
                          <img 
                            src={editForm.avatarUrl} 
                            alt="Live Avatar Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: '#64748b'
                          }}>
                            {(isEmployer ? editForm.companyName : editForm.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {editForm.avatarUrl && editForm.avatarUrl.trim() !== '' && editImageError && (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600, textAlign: 'center', maxWidth: '300px' }}>
                          ⚠️ The provided URL does not point directly to an image file. Please use a direct image URL.
                        </span>
                      )}
                    </div>

                    {/* Avatar URL Input Field */}
                    <div className="as-form-group" style={{ width: '100%', maxWidth: '600px' }}>
                      <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Avatar Image URL</label>
                      <input 
                        type="url" 
                        className="as-input-txt" 
                        value={editForm.avatarUrl} 
                        onChange={e => {
                          setEditImageError(false);
                          setEditImageLoading(true);
                          setEditForm({...editForm, avatarUrl: e.target.value});
                        }}
                        placeholder="https://images.unsplash.com/... or other valid image URL"
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                      />
                      <small style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                        Supports common image formats (PNG, JPG, JPEG, WEBP, GIF, SVG).
                      </small>
                    </div>

                  </div>
                </div>

                {/* 5. Career Preferences Card (Candidate Only) */}
                {!isEmployer && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '3rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                      💼 Career Preferences
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Seeking Status Selectable Chips */}
                      <div className="as-form-group">
                        <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Seeking Status</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {[
                            { value: 'SEEKING_JOB', label: 'Actively Looking' },
                            { value: 'EMPLOYED', label: 'Open to Opportunities' },
                            { value: 'PAUSED', label: 'Not Looking' }
                          ].map(option => {
                            const isSelected = editForm.jobSeekingStatus === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setEditForm({ ...editForm, jobSeekingStatus: option.value })}
                                style={{
                                  padding: '0.75rem 1.5rem',
                                  borderRadius: '8px',
                                  border: isSelected ? '2px solid #0f62fe' : '1px solid #cbd5e1',
                                  background: isSelected ? '#eff6ff' : '#ffffff',
                                  color: isSelected ? '#0f62fe' : '#475569',
                                  fontWeight: isSelected ? '700' : '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 4px 6px -1px rgba(15, 98, 254, 0.1)' : 'none'
                                }}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Career Objective Textarea with Character Counter */}
                      <div className="as-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Career Objective</label>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Describe your career goals, preferred role, and professional aspirations.
                        </span>
                        <textarea 
                          className="as-input-txt" 
                          rows="6" 
                          value={editForm.careerObjective} 
                          onChange={e => setEditForm({...editForm, careerObjective: e.target.value})}
                          placeholder="e.g., A passionate Senior Software Engineer looking to leverage React and Node.js expertise..."
                          style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            width: '100%', 
                            lineHeight: '1.6', 
                            fontFamily: 'inherit',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.95rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {editForm.careerObjective ? editForm.careerObjective.length : 0} characters
                          </span>
                        </div>
                      </div>

                      {/* Job Preferences Tag Input */}
                      <div className="as-form-group">
                        <label style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Job Preferences</label>
                        
                        {/* Display existing tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {(editForm.jobPreferences ? editForm.jobPreferences.split(',').map(t => t.trim()).filter(t => t.length > 0) : []).map((tag, idx) => (
                            <span 
                              key={idx} 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#94a3b8',
                                  marginLeft: '0.4rem',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0'
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add preference input */}
                        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
                          <input 
                            type="text"
                            className="as-input-txt" 
                            value={newTagInput} 
                            onChange={e => setNewTagInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag(newTagInput);
                              }
                            }}
                            placeholder="Add Preference (e.g. Remote, Full-time)"
                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', flex: 1, fontSize: '0.9rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTag(newTagInput)}
                            className="as-btn-secondary"
                            style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            + Add Preference
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Sticky Action Bar */}
                <div style={{
                  position: 'sticky',
                  bottom: '0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderTop: '1px solid #e2e8f0',
                  padding: '1rem 2rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  zIndex: '100',
                  boxShadow: '0 -10px 15px -3px rgba(0,0,0,0.05), 0 -4px 6px -2px rgba(0,0,0,0.05)',
                  margin: '0 -2rem -2rem -2rem',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px'
                }}>
                  <button 
                    type="button" 
                    className="as-btn-secondary" 
                    onClick={() => {
                      setIsEditingPersonal(false);
                      setActiveSubTab('overview');
                    }}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="as-btn-primary" 
                    disabled={saving}
                    onClick={() => console.log("Save Changes clicked")}
                    style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', borderRadius: '8px' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {activeSubTab === 'experience' && !isEmployer && (
            <div className="as-card">
              <h3 className="as-card-title">
                <span>💼 Professional Experience</span>
                <button 
                  className="as-btn-primary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setModalData({ 
                      companyName: '', 
                      position: '', 
                      duration: '', 
                      jobDescription: '',
                      startDate: '',
                      endDate: '',
                      employmentType: 'Full-time',
                      location: '',
                      isCurrent: false
                    });
                    setActiveModal('experience');
                  }}
                >
                  ➕ Add Experience
                </button>
              </h3>
              {experiences.length === 0 ? (
                <div className="as-empty-box">
                  <span>💼</span>
                  No work experiences registered yet.
                </div>
              ) : (
                <div className="as-timeline">
                  {experiences.map(exp => {
                    const parsed = parseExperienceDuration(exp.duration);
                    return (
                      <div key={exp.experienceId} className="as-timeline-item">
                        <div className="as-timeline-dot"></div>
                        <div className="as-item-header">
                          <div>
                            <h4 className="as-item-title">{exp.position} <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>{parsed.employmentType}</span></h4>
                            <h5 className="as-item-subtitle">{exp.companyName} {parsed.location && `• ${parsed.location}`}</h5>
                            <div className="as-item-meta">⏳ {parsed.startDate} - {parsed.isCurrent ? 'Present' : parsed.endDate}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="as-btn-icon" onClick={() => {
                              setModalData({ 
                                ...exp,
                                startDate: parsed.startDate,
                                endDate: parsed.endDate,
                                employmentType: parsed.employmentType,
                                location: parsed.location,
                                isCurrent: parsed.isCurrent
                              });
                              setActiveModal('experience');
                            }}>✏️</button>
                            <button className="as-btn-icon as-btn-danger" onClick={() => handleExperienceDelete(exp.experienceId)}>🗑️</button>
                          </div>
                        </div>
                        {exp.jobDescription && <p className="as-item-desc">{exp.jobDescription}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'education' && !isEmployer && (
            <div className="as-card">
              <h3 className="as-card-title">
                <span>🎓 Education Details</span>
                <button 
                  className="as-btn-primary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setModalData({ 
                      schoolName: '', 
                      major: '', 
                      degree: '', 
                      graduationYear: new Date().getFullYear(),
                      startYear: '',
                      gpa: '',
                      description: ''
                    });
                    setActiveModal('education');
                  }}
                >
                  ➕ Add Education
                </button>
              </h3>
              {educations.length === 0 ? (
                <div className="as-empty-box">
                  <span>🎓</span>
                  No educational credentials provided.
                </div>
              ) : (
                <div className="as-timeline">
                  {educations.map(edu => {
                    const parsed = parseEducationMajor(edu.major);
                    return (
                      <div key={edu.educationId} className="as-timeline-item">
                        <div className="as-timeline-dot" style={{ background: '#64748b', boxShadow: '0 0 0 3px #e2e8f0' }}></div>
                        <div className="as-item-header">
                          <div>
                            <h4 className="as-item-title">{edu.degree} in {parsed.major} {parsed.gpa && <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#047857', background: '#d1fae5', padding: '0.15rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>GPA: {parsed.gpa}</span>}</h4>
                            <h5 className="as-item-subtitle">{edu.schoolName}</h5>
                            <div className="as-item-meta">📅 {parsed.startYear ? `${parsed.startYear} - ` : ''}{edu.graduationYear}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="as-btn-icon" onClick={() => {
                              setModalData({ 
                                ...edu,
                                major: parsed.major,
                                startYear: parsed.startYear,
                                gpa: parsed.gpa,
                                description: parsed.description
                              });
                              setActiveModal('education');
                            }}>✏️</button>
                            <button className="as-btn-icon as-btn-danger" onClick={() => handleEducationDelete(edu.educationId)}>🗑️</button>
                          </div>
                        </div>
                        {parsed.description && <p className="as-item-desc" style={{ marginTop: '0.5rem' }}>{parsed.description}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'certifications' && !isEmployer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Certifications Card */}
              <div className="as-card">
                <h3 className="as-card-title">
                  <span>🏆 Certifications & Achievements</span>
                  <button 
                    className="as-btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setModalData({ title: '', issuer: '', year: new Date().getFullYear(), description: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' });
                      setActiveModal('certification');
                    }}
                  >
                    ➕ Add Certification
                  </button>
                </h3>
                {certifications.length === 0 ? (
                  <div className="as-empty-box">
                    <span>🏆</span>
                    No achievements or certifications listed.
                  </div>
                ) : (
                  <div className="as-timeline">
                    {certifications.map(cert => (
                      <div key={cert.achievementId} className="as-timeline-item">
                        <div className="as-timeline-dot" style={{ background: '#64748b', boxShadow: '0 0 0 3px #e2e8f0' }}></div>
                        <div className="as-item-header">
                          <div>
                            <h4 className="as-item-title">{cert.title} {cert.credentialId && <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#4b5563', background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>ID: {cert.credentialId}</span>}</h4>
                            {cert.issuer && <h5 className="as-item-subtitle">Issued by {cert.issuer}</h5>}
                            <div className="as-item-meta">📅 Issued: {cert.issueDate || cert.year} {cert.expirationDate ? `• Expires: ${cert.expirationDate}` : ''}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="as-btn-icon" onClick={() => {
                              setModalData({ ...cert });
                              setActiveModal('certification');
                            }}>✏️</button>
                            <button className="as-btn-icon as-btn-danger" onClick={() => handleCertificationDelete(cert.achievementId)}>🗑️</button>
                          </div>
                        </div>
                        {cert.description && <p className="as-item-desc">{cert.description}</p>}
                        {cert.credentialUrl && (
                          <a 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'inline-block', fontSize: '0.85rem', color: '#0f62fe', fontWeight: 700, textDecoration: 'none', marginTop: '0.5rem' }}
                          >
                            🔗 View Credential
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects Card */}
              <div className="as-card">
                <h3 className="as-card-title">
                  <span>🛠️ Key Projects</span>
                  <button 
                    className="as-btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setModalData({ projectName: '', role: '', technologies: '', demoLink: '', projectDescription: '' });
                      setActiveModal('project');
                    }}
                  >
                    ➕ Add Project
                  </button>
                </h3>
                {projects.length === 0 ? (
                  <div className="as-empty-box">
                    <span>🛠️</span>
                    No portfolio projects added yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {projects.map(p => (
                      <div key={p.projectId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontWeight: 'bold' }}>{p.projectName}</h4>
                            <div style={{ display: 'flex' }}>
                              <button className="as-btn-icon" onClick={() => {
                                setModalData({ ...p });
                                setActiveModal('project');
                              }}>✏️</button>
                              <button className="as-btn-icon as-btn-danger" onClick={() => handleProjectDelete(p.projectId)}>🗑️</button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Role: {p.role}</div>
                          {p.jobDescription && <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>{p.jobDescription}</p>}
                          {p.technologies && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                              {p.technologies.split(',').map((t, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 500 }}>
                                  {t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {p.demoLink && (
                          <a 
                            href={p.demoLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'inline-block', fontSize: '0.85rem', color: '#0f62fe', fontWeight: 700, textDecoration: 'none' }}
                          >
                            🔗 View Live Demo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'documents' && !isEmployer && (
            <div className="as-card">
              <h3 className="as-card-title">
                <span>📁 Documents & CV</span>
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>Upload and manage your resume documents for job applications.</p>
                {!resumeFile && (
                  <label className="as-btn-primary" style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', padding: '0.6rem 1.5rem' }}>
                    {uploadingResume ? 'Uploading...' : '➕ Upload New Resume'}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (!['pdf', 'doc', 'docx'].includes(ext)) {
                          showToast('Format must be PDF, DOC, or DOCX', 'error');
                          return;
                        }
                        setUploadingResume(true);
                        setTimeout(() => {
                          const payload = {
                            name: file.name,
                            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                            uploadedAt: new Date().toLocaleDateString()
                          };
                          localStorage.setItem(`resume_${accountId}`, JSON.stringify(payload));
                          setResumeFile(payload);
                          setUploadingResume(false);
                          showToast('Resume uploaded successfully!', 'success');
                        }, 1000);
                      }}
                    />
                  </label>
                )}
              </div>

              {resumeFile ? (
                <div className="as-document-grid">
                  <div className="as-document-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>📄</span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{resumeFile.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Size: {resumeFile.size} • Uploaded: {resumeFile.uploadedAt || '2026-06-05'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <button 
                        className="as-btn-secondary" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        onClick={() => showToast(`Simulating: Viewing ${resumeFile.name}`, 'info')}
                      >
                        👁️ View
                      </button>
                      <button 
                        className="as-btn-secondary" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        onClick={() => showToast(`Simulated download: ${resumeFile.name}`, 'success')}
                      >
                        📥 Download
                      </button>
                      <button 
                        className="as-btn-secondary as-btn-danger" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document?')) {
                            localStorage.removeItem(`resume_${accountId}`);
                            setResumeFile(null);
                            showToast('Resume removed', 'info');
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="as-empty-box" style={{ padding: '3rem 1rem' }}>
                  <span>📁</span>
                  No documents uploaded yet. Upload a resume to get started.
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'settings' && (
            <div className="as-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                ⚙️ Account Settings & Security
              </h3>
              
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', fontWeight: settingsTab === 'profile' ? 'bold' : 'normal', color: settingsTab === 'profile' ? '#0f62fe' : '#64748b', cursor: 'pointer', borderBottom: settingsTab === 'profile' ? '2px solid #0f62fe' : 'none', padding: '0.25rem' }}
                  onClick={() => setSettingsTab('profile')}
                >
                  ⚙️ Security Preferences
                </button>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', fontWeight: settingsTab === 'account' ? 'bold' : 'normal', color: settingsTab === 'account' ? '#0f62fe' : '#64748b', cursor: 'pointer', borderBottom: settingsTab === 'account' ? '2px solid #0f62fe' : 'none', padding: '0.25rem' }}
                  onClick={() => setSettingsTab('account')}
                >
                  🔒 Change Password
                </button>
              </div>

              {settingsTab === 'profile' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Account Username</h4>
                      <p>Your primary account access identifier.</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>{email || 'None'}</span>
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Secure login with a secondary authorization device.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.twoFactor}
                      onChange={(e) => setSecuritySettings({...securitySettings, twoFactor: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Email Notifications</h4>
                      <p>Receive live recruitment updates at your contact email.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.emailAlerts}
                      onChange={(e) => setSecuritySettings({...securitySettings, emailAlerts: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Public Visibility</h4>
                      <p>Allow hiring recruiters to search and read details from your qualifications profile.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.publicProfile}
                      onChange={(e) => setSecuritySettings({...securitySettings, publicProfile: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="as-form-group">
                      <label>Current Password</label>
                      <input 
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <div className="as-form-group">
                      <label>New Password</label>
                      <input 
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <button type="submit" className="as-btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* ================= MODAL WINDOWS ================= */}





      {/* 3. Add/Edit Experience Modal */}
      {activeModal === 'experience' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>{modalData.experienceId ? 'Edit Experience' : 'Add Experience'}</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleExperienceSubmit}>
              <div className="as-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div className="as-form-section-title">💼 Employment Information</div>
                  
                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Job Title *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.position} 
                        onChange={e => setModalData({ ...modalData, position: e.target.value })} 
                        placeholder="e.g. Senior Software Engineer"
                        required 
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Company / Organization *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.companyName} 
                        onChange={e => setModalData({ ...modalData, companyName: e.target.value })} 
                        placeholder="e.g. Google"
                        required 
                      />
                    </div>
                  </div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Employment Type</label>
                      <select
                        className="as-input-txt"
                        value={modalData.employmentType}
                        onChange={e => setModalData({ ...modalData, employmentType: e.target.value })}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="as-form-group">
                      <label>Location</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.location} 
                        onChange={e => setModalData({ ...modalData, location: e.target.value })} 
                        placeholder="e.g. Mountain View, CA / Remote"
                      />
                    </div>
                  </div>

                  <div className="as-form-section-title">📅 Role Timeline</div>
                  
                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Start Date *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.startDate} 
                        onChange={e => setModalData({ ...modalData, startDate: e.target.value })} 
                        placeholder="e.g. Jan 2024"
                        required 
                      />
                    </div>
                    <div className="as-form-group" style={{ opacity: modalData.isCurrent ? 0.5 : 1 }}>
                      <label>End Date</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.endDate} 
                        onChange={e => setModalData({ ...modalData, endDate: e.target.value })} 
                        placeholder="e.g. Present / Dec 2025"
                        disabled={modalData.isCurrent}
                      />
                    </div>
                  </div>

                  <div className="as-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={modalData.isCurrent}
                        onChange={e => setModalData({ ...modalData, isCurrent: e.target.checked })}
                      />
                      I am currently working in this role
                    </label>
                  </div>

                  <div className="as-form-section-title">📝 Description</div>
                  <div className="as-form-group">
                    <label>Job Description & Key Contributions</label>
                    <textarea 
                      className="as-input-txt" 
                      rows="4" 
                      value={modalData.jobDescription} 
                      onChange={e => setModalData({ ...modalData, jobDescription: e.target.value })} 
                      placeholder="Describe your responsibilities, technologies used, and key achievements..."
                    />
                  </div>

                  {/* Live Preview Card */}
                  <div className="as-timeline-preview-card">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Live Timeline Preview</div>
                    <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '1.25rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-6px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {modalData.position || 'Job Title'} 
                        <span style={{ fontWeight: 'normal', fontSize: '0.75rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.5rem' }}>
                          {modalData.employmentType || 'Full-time'}
                        </span>
                      </h4>
                      <h5 style={{ margin: '0.15rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                        {modalData.companyName || 'Company'} {modalData.location && `• ${modalData.location}`}
                      </h5>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        📅 {modalData.startDate || 'Start Date'} - {modalData.isCurrent ? 'Present' : (modalData.endDate || 'End Date')}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="as-modal-footer">
                <button type="button" className="as-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="as-btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add/Edit Education Modal */}
      {activeModal === 'education' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>{modalData.educationId ? 'Edit Education' : 'Add Education'}</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleEducationSubmit}>
              <div className="as-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div className="as-form-section-title">🎓 Academic Information</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Degree / Qualification *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.degree} 
                        onChange={e => setModalData({ ...modalData, degree: e.target.value })} 
                        placeholder="e.g. Bachelor of Science"
                        required 
                      />
                    </div>
                    <div className="as-form-group">
                      <label>School / Institution Name *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.schoolName} 
                        onChange={e => setModalData({ ...modalData, schoolName: e.target.value })} 
                        placeholder="e.g. Stanford University"
                        required 
                      />
                    </div>
                  </div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Major / Field of Study *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.major} 
                        onChange={e => setModalData({ ...modalData, major: e.target.value })} 
                        placeholder="e.g. Computer Science"
                        required 
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Graduation Year *</label>
                      <input 
                        type="number" 
                        className="as-input-txt" 
                        value={modalData.graduationYear} 
                        onChange={e => setModalData({ ...modalData, graduationYear: parseInt(e.target.value, 10) || new Date().getFullYear() })} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="as-form-section-title">✨ Additional Details</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Start Year</label>
                      <input 
                        type="number"
                        className="as-input-txt" 
                        value={modalData.startYear} 
                        onChange={e => setModalData({ ...modalData, startYear: e.target.value })} 
                        placeholder="e.g. 2020"
                      />
                    </div>
                    <div className="as-form-group">
                      <label>GPA / Grade</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.gpa} 
                        onChange={e => setModalData({ ...modalData, gpa: e.target.value })} 
                        placeholder="e.g. 3.8 / 4.0"
                      />
                    </div>
                  </div>

                  <div className="as-form-group">
                    <label>Description / Honors & Awards</label>
                    <textarea 
                      className="as-input-txt" 
                      rows="3" 
                      value={modalData.description} 
                      onChange={e => setModalData({ ...modalData, description: e.target.value })} 
                      placeholder="List honors, awards, extracurricular activities, or relevant coursework..."
                    />
                  </div>

                </div>
              </div>
              <div className="as-modal-footer">
                <button type="button" className="as-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="as-btn-primary">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add/Edit Skill Modal */}
      {activeModal === 'skill' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>{modalData.skillId ? 'Edit Skill' : 'Add Skills'}</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleSkillSubmit}>
              <div className="as-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {modalData.skillId ? (
                    <div className="as-form-group">
                      <label>Skill Name *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.skillName} 
                        onChange={e => setModalData({ ...modalData, skillName: e.target.value })} 
                        required 
                      />
                    </div>
                  ) : (
                    <div className="as-form-group">
                      <label>Skill Tags (Press Enter or click Add to add multiple skills) *</label>
                      <div className="as-skills-tag-container" style={{ marginBottom: '0.75rem' }}>
                        {(modalData.tags || []).map((tag, idx) => (
                          <span key={idx} className="as-skill-tag">
                            {tag}
                            <button
                              type="button"
                              className="as-skill-tag-remove"
                              onClick={() => {
                                const nextTags = (modalData.tags || []).filter(t => t !== tag);
                                setModalData({ ...modalData, tags: nextTags });
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder={ (modalData.tags || []).length === 0 ? "e.g. React, Java, Git..." : "Add more..." }
                          style={{ border: 'none', outline: 'none', flex: 1, padding: '0.25rem', fontSize: '0.95rem' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (val && !(modalData.tags || []).includes(val)) {
                                setModalData({ ...modalData, tags: [...(modalData.tags || []), val] });
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="as-form-group">
                    <label>Proficiency Level</label>
                    <select 
                      className="as-input-txt" 
                      value={modalData.proficiencyLevel}
                      onChange={e => setModalData({ ...modalData, proficiencyLevel: parseInt(e.target.value, 10) })}
                    >
                      <option value={1}>Beginner (Level 1)</option>
                      <option value={2}>Elementary (Level 2)</option>
                      <option value={3}>Intermediate (Level 3)</option>
                      <option value={4}>Advanced (Level 4)</option>
                      <option value={5}>Expert (Level 5)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="as-modal-footer">
                <button type="button" className="as-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="as-btn-primary">Save Skill(s)</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add/Edit Project Modal */}
      {activeModal === 'project' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>{modalData.projectId ? 'Edit Project' : 'Add Project'}</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleProjectSubmit}>
              <div className="as-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div className="as-form-section-title">🛠️ Project Details</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Project Name *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.projectName} 
                        onChange={e => setModalData({ ...modalData, projectName: e.target.value })} 
                        placeholder="e.g. E-Commerce Platform"
                        required 
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Role / Position in Project *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.role} 
                        onChange={e => setModalData({ ...modalData, role: e.target.value })} 
                        placeholder="e.g. Lead Frontend Architect"
                        required 
                      />
                    </div>
                  </div>

                  <div className="as-form-section-title">🔗 Technologies & Links</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Technologies Used (Comma separated)</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.technologies} 
                        onChange={e => setModalData({ ...modalData, technologies: e.target.value })} 
                        placeholder="e.g. React, Node.js, Tailwind CSS"
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Live Demo / Repository URL</label>
                      <input 
                        type="url"
                        className="as-input-txt" 
                        value={modalData.demoLink} 
                        onChange={e => setModalData({ ...modalData, demoLink: e.target.value })} 
                        placeholder="https://github.com/yourproject"
                      />
                    </div>
                  </div>

                  <div className="as-form-section-title">📝 Project Description</div>
                  <div className="as-form-group">
                    <label>Description</label>
                    <textarea 
                      className="as-input-txt" 
                      rows="3" 
                      value={modalData.jobDescription} 
                      onChange={e => setModalData({ ...modalData, jobDescription: e.target.value })} 
                      placeholder="Briefly describe the project, core problem solved, and technical architecture..."
                    />
                  </div>

                </div>
              </div>
              <div className="as-modal-footer">
                <button type="button" className="as-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="as-btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Add/Edit Certification Modal */}
      {activeModal === 'certification' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>{modalData.achievementId ? 'Edit Certification' : 'Add Certification'}</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleCertificationSubmit}>
              <div className="as-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div className="as-form-section-title">🏆 Certification Info</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Certification Name *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.title} 
                        onChange={e => setModalData({ ...modalData, title: e.target.value })} 
                        placeholder="e.g. AWS Certified Solutions Architect"
                        required 
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Issuing Organization *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.issuer} 
                        onChange={e => setModalData({ ...modalData, issuer: e.target.value })} 
                        placeholder="e.g. Amazon Web Services (AWS)"
                        required
                      />
                    </div>
                  </div>

                  <div className="as-form-section-title">📅 Credential Details</div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Issue Date *</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.issueDate || modalData.year} 
                        onChange={e => setModalData({ ...modalData, issueDate: e.target.value, year: parseInt(e.target.value, 10) || new Date().getFullYear() })} 
                        placeholder="e.g. Jan 2024"
                        required
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Expiration Date</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.expirationDate} 
                        onChange={e => setModalData({ ...modalData, expirationDate: e.target.value })} 
                        placeholder="e.g. Jan 2027 / No Expiration"
                      />
                    </div>
                  </div>

                  <div className="as-form-grid-2">
                    <div className="as-form-group">
                      <label>Credential ID</label>
                      <input 
                        className="as-input-txt" 
                        value={modalData.credentialId} 
                        onChange={e => setModalData({ ...modalData, credentialId: e.target.value })} 
                        placeholder="e.g. AWS-12345"
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Credential URL</label>
                      <input 
                        type="url"
                        className="as-input-txt" 
                        value={modalData.credentialUrl} 
                        onChange={e => setModalData({ ...modalData, credentialUrl: e.target.value })} 
                        placeholder="https://credly.com/credentials/..."
                      />
                    </div>
                  </div>

                  <div className="as-form-group">
                    <label>Certification Description</label>
                    <textarea 
                      className="as-input-txt" 
                      rows="3"
                      value={modalData.description} 
                      onChange={e => setModalData({ ...modalData, description: e.target.value })} 
                      placeholder="Brief summary of skills validated by this credential..."
                    />
                  </div>

                </div>
              </div>
              <div className="as-modal-footer">
                <button type="button" className="as-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="as-btn-primary">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Settings & Account Settings Modal */}
      {activeModal === 'security' && (
        <div className="as-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="as-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>Account Settings & Security</h3>
              <button className="as-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="as-modal-body">
              {/* Tab Navigation inside Modal */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', fontWeight: settingsTab === 'profile' ? 'bold' : 'normal', color: settingsTab === 'profile' ? '#0f62fe' : '#64748b', cursor: 'pointer', borderBottom: settingsTab === 'profile' ? '2px solid #0f62fe' : 'none', padding: '0.25rem' }}
                  onClick={() => setSettingsTab('profile')}
                >
                  ⚙️ Security Preferences
                </button>
                <button 
                  style={{ background: 'none', border: 'none', fontWeight: settingsTab === 'account' ? 'bold' : 'normal', color: settingsTab === 'account' ? '#0f62fe' : '#64748b', cursor: 'pointer', borderBottom: settingsTab === 'account' ? '2px solid #0f62fe' : 'none', padding: '0.25rem' }}
                  onClick={() => setSettingsTab('account')}
                >
                  🔒 Change Password
                </button>
              </div>

              {settingsTab === 'profile' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Account Username</h4>
                      <p>Your primary account access identifier.</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>{email || 'None'}</span>
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Secure login with a secondary authorization device.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.twoFactor}
                      onChange={(e) => setSecuritySettings({...securitySettings, twoFactor: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Email Notifications</h4>
                      <p>Receive live recruitment updates at your contact email.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.emailAlerts}
                      onChange={(e) => setSecuritySettings({...securitySettings, emailAlerts: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="as-settings-row">
                    <div className="as-settings-info">
                      <h4>Public Visibility</h4>
                      <p>Allow hiring recruiters to search and read details from your qualifications profile.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securitySettings.publicProfile}
                      onChange={(e) => setSecuritySettings({...securitySettings, publicProfile: e.target.checked})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="as-form-group">
                      <label>Current Password</label>
                      <input 
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <div className="as-form-group">
                      <label>New Password</label>
                      <input 
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <div className="as-form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="as-input-txt"
                        required
                      />
                    </div>
                    <button type="submit" className="as-btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="as-modal-footer">
              <button className="as-btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}