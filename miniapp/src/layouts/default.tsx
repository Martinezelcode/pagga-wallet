import React, { useState, useEffect } from 'react';
import FooterNav from '@components/FooterNav';
import SidebarNav from '@components/SidebarNav';
import Header from '@components/Header';
import styles from './style.module.scss';
import cx from 'classnames';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance, useSwitchChain, useChains } from 'wagmi';
import { useLocalWallet } from '@/providers/LocalWalletProvider';
import NetworkSelector from '@components/NetworkSelector';
import UnlockWalletModal from '@components/UnlockWalletModal';
import WalletCreationModal from '@components/WalletCreationModal';
import WalletInfo from '@components/WalletInfo';

interface IProps {
  children: React.ReactNode;
  className?: string;
}


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const MainLayout: React.FC<IProps> = ({ children, className }) => {
  const { logout, authenticated } = usePrivy();
  const { chain, address } = useAccount();
  const chains = useChains();
  const { data: balance } = useBalance({ address });
  const { status, switchChain } = useSwitchChain();
  const { localWallets, activeWallet, unlockWallet } = useLocalWallet();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  const handleLogout = async () => {
    await logout();
  };

  const handleWalletSelection = (walletAddress: string) => {
    setSelectedWallet(walletAddress);
    setShowUnlockModal(true);
  };

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  const isWrongNetwork = chain?.id !== chains.find(c => c.id === chain?.id)?.id;

  // Effect to handle initial wallet state
  useEffect(() => {
    if (localWallets.length > 0 && !activeWallet) {
      // If there are wallets but none active, show unlock modal for the first wallet
      setSelectedWallet(localWallets[0].address);
      setShowUnlockModal(true);
    }
  }, [localWallets, activeWallet]);

  // Handle wallet creation success
  const handleWalletCreated = (walletAddress: string) => {
    setShowWalletModal(false);
    setSelectedWallet(walletAddress);
    setShowUnlockModal(true);
  };

  // Handle wallet unlock success
  const handleUnlockSuccess = async (walletAddress: string, password: string) => {
    try {
      const success = await unlockWallet(walletAddress, password);
      if (success) {
        setShowUnlockModal(false);
        setSelectedWallet('');
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
    }
  };


  const isMobile = useIsMobile();
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  return (
    <div className={cx(styles['main-layout'], className)}>
      {!isMobile && <SidebarNav />}
      <Header
        onToggleTheme={() => setIsLight(l => !l)}
        isLight={isLight}
        onConnectWallet={() => setShowWalletModal(true)}
      />

      <div className={styles['main-layout__content']}>
        {children}
      </div>

      {isMobile && <FooterNav />}

      {showWalletModal && (
        <WalletCreationModal
          onClose={() => setShowWalletModal(false)}
          onSuccess={handleWalletCreated}
        />
      )}

      {showUnlockModal && (
        <UnlockWalletModal
          walletAddress={selectedWallet}
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedWallet('');
          }}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  );
};

export default MainLayout;
