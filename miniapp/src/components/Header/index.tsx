import React, { useState } from 'react';
import styles from './style.module.scss';
import Logo from '@assets/icons/eth.icon.svg';

interface HeaderProps {
  onToggleTheme: () => void;
  isLight: boolean;
  onConnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleTheme, isLight, onConnectWallet }) => {
  const [search, setSearch] = useState('');
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <img src={Logo} className={styles.logo} alt="Pagga Logo" />
        <span className={styles.brand}>Pagga</span>
      </div>
      <div className={styles.searchSection}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search tokens or transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.actionsSection}>
        <button className={styles.walletButton} onClick={onConnectWallet}>
          Connect Wallet
        </button>
        <button className={styles.themeToggle} onClick={onToggleTheme}>
          {isLight ? '🌞' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
