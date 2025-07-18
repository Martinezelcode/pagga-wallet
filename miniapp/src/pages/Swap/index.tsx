import React, { useState } from 'react'
import Swap from './components/Swap'
import WalletMenu from '@components/WalletMenu'
import styles from './style.module.scss'
import Provider from './components/Provider'
import P2P from './components/P2P'

const SwapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'p2p'>('p2p');
  return (
    <div className={styles['swap-page']}>
      <WalletMenu />
      <div className={styles.swapTabs}>
        <button
          className={styles.activeTab}
          onClick={() => setActiveTab('p2p')}
        >
          P2P
        </button>
      </div>
      <P2P />
      <Provider />
    </div>
  )
}

export default SwapPage