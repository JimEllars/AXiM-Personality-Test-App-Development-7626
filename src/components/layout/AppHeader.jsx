import React, { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePersonalityStore } from '../../store/usePersonalityStore';

const { FiArrowUpRight, FiUser } = FiIcons;

function AppHeader() {
  const [user, setUser] = useState(null);
  const setDemographics = usePersonalityStore((state) => state.setDemographics);

  useEffect(() => {
    // Check for passport SSO token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Mock validating token and fetching profile
      localStorage.setItem('axim_passport_token', token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedToken = localStorage.getItem('axim_passport_token');

    if (storedToken) {
      // Mock authenticated user data
      const mockUser = {
        name: 'AXiM User',
        email: 'user@axim.us.com',
        age: '30'
      };

      setUser(mockUser);

      // Pre-populate demographic screener fields
      setDemographics({
        age: mockUser.age,
        // Since we know them, we can assume some defaults or leave region for them
      });
    }
  }, [setDemographics]);

  return (
    <header className="site-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eaeaea' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a
          className="brand"
          href="https://axim.us.com"
          aria-label="AXiM home"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
        >
          <span className="brand-mark" style={{ background: '#000', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>A</span>
          <span>AXiM</span>
        </a>

        <div className="header-section" style={{ color: '#666' }}>
          <span className="header-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', marginRight: '0.5rem' }} />
          Personal Development
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SafeIcon icon={FiUser} />
            </div>
            <span>{user.name}</span>
          </div>
        ) : (
          <a
            className="header-link"
            href={`https://passport.axim.us.com/login?redirect=${encodeURIComponent(window.location.href)}`}
            rel="noreferrer"
            style={{ textDecoration: 'none', color: '#0066cc' }}
          >
            Login via Passport
          </a>
        )}
        <a
          className="header-link"
          href="https://axim.us.com"
          rel="noreferrer"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
        >
          AXiM.us.com
          <SafeIcon icon={FiArrowUpRight} />
        </a>
      </div>
    </header>
  );
}

export default AppHeader;
