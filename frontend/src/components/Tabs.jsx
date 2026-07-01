import React from 'react';
import ApplicationsList from './ApplicationsList';
import MarketTab from './MarketTab';
import { useAuth } from '../hooks/useAuth';

export default function Tabs() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState('profile');

  return (
    <section aria-label="Quick actions and insights">
      <nav className="tab-buttons" role="tablist">
        <button className={`tab-button ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} role="tab">Complete Profile</button>
        <button className={`tab-button ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')} role="tab">Applications</button>
        <button className={`tab-button ${tab === 'market' ? 'active' : ''}`} onClick={() => setTab('market')} role="tab">Market</button>
        <button className={`tab-button ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')} role="tab">Update Skills</button>
      </nav>

      <div>
        {tab === 'profile' && (
          <div role="tabpanel">
            <h3>Complete Your Profile</h3>
            <p>A complete profile increases your chances of being matched with jobs by 40%.</p>
          </div>
        )}

        {tab === 'applications' && (
          <div role="tabpanel">
            <h3>Your Applications</h3>
            <ApplicationsList candidateId={user?.accountId || user?.id} />
          </div>
        )}

        {tab === 'market' && (
          <div role="tabpanel">
            <h3>Market</h3>
            <p>Explore currently open roles curated for you.</p>
            <MarketTab />
          </div>
        )}

        {tab === 'skills' && (
          <div role="tabpanel">
            <h3>Update Your Skills</h3>
            <p>Highlight in-demand skills to improve your visibility to employers.</p>
          </div>
        )}
      </div>
    </section>
  );
}
