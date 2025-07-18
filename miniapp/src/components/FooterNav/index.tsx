import React from 'react';
import styles from './style.module.scss';
import { Link } from 'react-router-dom';
import { SwapIcon } from '@assets/icons';
import activityIcon from '@assets/icons/scan.icon.svg';
import settingsIcon from '@assets/icons/share.icon.svg';
import profileIcon from '@assets/icons/evaa.icon.svg';

const FooterNav: React.FC = () => (
  <nav className={styles.footerNav}>
    <Link to="/swap" className={styles.navItem}><SwapIcon width={24} height={24} /><span>Swap</span></Link>
    <Link to="/activity" className={styles.navItem}><img src={activityIcon} width={24} height={24} alt="Activity" /><span>Activity</span></Link>
    <Link to="/settings" className={styles.navItem}><img src={settingsIcon} width={24} height={24} alt="Settings" /><span>Settings</span></Link>
    <Link to="/profile" className={styles.navItem}><img src={profileIcon} width={24} height={24} alt="Profile" /><span>Profile</span></Link>
  </nav>
);

export default FooterNav;
