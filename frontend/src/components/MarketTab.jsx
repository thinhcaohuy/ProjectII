import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobPostService } from '../services/api';
import JobItem from './JobItem';

export default function MarketTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await jobPostService.getAll();
        if (!mounted) return;
        const openJobs = (res.data || []).filter(j => j.status === 'OPEN');
        setJobs(openJobs.slice(0, 8));
      } catch (err) {
        console.error('Failed to load market jobs', err);
        setError('Unable to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading market...</p>;
  if (error) return <p className="error">{error}</p>;
  if (jobs.length === 0) return <p className="empty-state">No open jobs available at this time</p>;

  return (
    <div className="market-list">
      {jobs.map(j => (
        <JobItem key={j.jobPostId || j.id} job={j} compact />
      ))}
    </div>
  );
}
