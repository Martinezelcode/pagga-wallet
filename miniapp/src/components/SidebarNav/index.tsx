import React from 'react';
import styles from './style.module.scss';
import { Link, useLocation } from 'react-router-dom';
import { SwapIcon } from '@assets/icons';
import activityIcon from '@assets/icons/scan.icon.svg';
import settingsIcon from '@assets/icons/share.icon.svg';
import profileIcon from '@assets/icons/evaa.icon.svg';

const navLinks = [
  { to: '/swap', label: 'Swap', icon: <SwapIcon width={24} height={24} /> },
  { to: '/p2p', label: 'P2P', icon: <img src={activityIcon} width={24} height={24} alt="P2P" /> },
  { to: '/activity', label: 'Activity', icon: <img src={activityIcon} width={24} height={24} alt="Activity" /> },
  { to: '/settings', label: 'Settings', icon: <img src={settingsIcon} width={24} height={24} alt="Settings" /> },
  { to: '/profile', label: 'Profile', icon: <img src={profileIcon} width={24} height={24} alt="Profile" /> },
];

const SidebarNav: React.FC = () => {
  const location = useLocation();
  return (
    <aside className={styles.sidebarNav}>
      <div className={styles.logo}>Pagga</div>
      <nav className={styles.navList}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={
              location.pathname.startsWith(link.to)
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            {link.icon}
            <span className={styles.label}>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarNav;
