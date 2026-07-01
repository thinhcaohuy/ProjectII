import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobPostService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { JobPostStatus } from '../../types/enums';
import { JobPostDTO } from '../../types/dto';
import JobPostForm from './JobPostForm';
import BackHeader from '../../components/BackHeader';
import '../../styles/Form.css';

export default function PostJob() {
  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    description: '',
    requiredSkills: '',
    salary: '',
    location: '',
    applicationDeadline: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobDTO = new JobPostDTO({
        ...formData,
        salary: parseFloat(formData.salary),
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : null,
        status: JobPostStatus.OPEN,
        employerId: user?.accountId || user?.id
      });

      await jobPostService.create(user?.accountId || user?.id, jobDTO);
      showToast('Job posting created successfully!', 'success');
      navigate('/employer');
    } catch (err) {
      console.error('Error posting job:', err);
      showToast('Failed to post job', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <BackHeader to="/employer" text="Back to Dashboard" title="Post a Job" />
      <JobPostForm
        formData={formData}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
