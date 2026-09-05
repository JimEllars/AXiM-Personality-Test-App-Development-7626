import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiArrowUpRight } = FiIcons;

function AppHeader() {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="https://axim.us.com"
        aria-label="AXiM home"
        rel="noreferrer"
      >
        <span className="brand-mark">A</span>
        <span>AXiM</span>
      </a>

      <div className="header-section">
        <span className="header-dot" />
        Personal Development
      </div>

      <a
        className="header-link"
        href="https://axim.us.com"
        rel="noreferrer"
      >
        AXiM.us.com
        <SafeIcon icon={FiArrowUpRight} />
      </a>
    </header>
  );
}

export default AppHeader;