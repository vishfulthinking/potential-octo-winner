import Link from 'next/link';
import prisma from '@/lib/prisma';
import '../profile.css'; // We copied this over

export default async function CandidateProfile({ params }) {
  const { id } = await params;
  
  const candidate = await prisma.candidate.findUnique({
    where: { id }
  });

  if (!candidate) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Profile Not Found</h2>
        <Link href="/dashboard" className="back-link">← Back to Search</Link>
      </div>
    );
  }

  // Parse other details JSON if available
  let otherDetails = {};
  try {
    otherDetails = JSON.parse(candidate.otherDetailsJson || '{}');
  } catch (e) {
    console.error("Failed to parse other details", e);
  }

  const name = candidate.title || 'E-commerce Candidate';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <Link href="/dashboard" className="back-link">← Back to Search</Link>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <img src={avatarUrl} alt={name} className="profile-avatar" />
          <h1 className="profile-name">{name}</h1>
          <h2 className="profile-title">{otherDetails.job_title || candidate.title}</h2>
          
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-label">Rate</span>
              <span className="stat-value">{candidate.rateRaw || 'Negotiable'}</span>
            </div>
            {otherDetails.hours_per_day && (
              <div className="stat-box">
                <span className="stat-label">Hours</span>
                <span className="stat-value">{otherDetails.hours_per_day}h/day</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3>Demographics</h3>
            <ul>
              <li><strong>Age:</strong> {otherDetails.age || 'N/A'}</li>
              <li><strong>Gender:</strong> {otherDetails.gender || 'N/A'}</li>
              <li><strong>Location:</strong> {otherDetails.address || 'N/A'}</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Platform Info</h3>
            <ul>
              {otherDetails.member_since && (
                <li><strong>Member Since:</strong> {otherDetails.member_since}</li>
              )}
              <li><strong>Last Active:</strong> {candidate.lastActive || 'Recently'}</li>
              {otherDetails.id_proof_score && (
                <li><strong>ID Proof:</strong> {otherDetails.id_proof_score} Score</li>
              )}
            </ul>
          </div>
          
          {candidate.profileUrl && (
            <a href={candidate.profileUrl} target="_blank" rel="noreferrer" className="primary-btn">View Full Profile on OLJ</a>
          )}
        </aside>

        <section className="profile-main">
          <div className="main-card">
            <h3>About</h3>
            <p className="about-text">{candidate.description || "No description provided."}</p>
          </div>

          {otherDetails.education && (
            <div className="main-card">
              <h3>Education</h3>
              <p className="education-text">{otherDetails.education}</p>
            </div>
          )}

          <div className="main-card">
            <h3>Top Skills</h3>
            <div className="skills-grid">
              {otherDetails.top_skills && otherDetails.top_skills.length > 0 ? (
                otherDetails.top_skills.map((skill, idx) => (
                  <div key={idx} className="skill-box">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-stars">{'★'.repeat(skill.stars)}{'☆'.repeat(5 - skill.stars)}</span>
                    </div>
                    <div className="skill-cat">{skill.category}</div>
                    <div className="skill-exp">{skill.description}</div>
                  </div>
                ))
              ) : (
                candidate.skills ? (
                  candidate.skills.split(',').map((skill, idx) => (
                    <div key={idx} className="skill-box">
                      <div className="skill-header">
                        <span className="skill-name">{skill.trim()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No skills listed.</p>
                )
              )}
            </div>
          </div>

          {otherDetails.tests && otherDetails.tests.length > 0 && (
            <div className="main-card">
              <h3>Tests & Assessments</h3>
              <div className="tests-list">
                {otherDetails.tests.map((test, idx) => (
                  <div key={idx} className="test-box">
                    <h4>{test.test}</h4>
                    {test.scores && (
                      <ul className="test-scores">
                        {Object.entries(test.scores).map(([k, v]) => (
                          <li key={k}><strong>{k}:</strong> {v}</li>
                        ))}
                      </ul>
                    )}
                    {test.level && <p className="test-level">{test.level}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
