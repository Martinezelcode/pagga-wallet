import React, { useState } from 'react';
import styles from './style.module.scss';

const assets = ['USDT', 'BTC', 'ETH', 'TON'];
const paymentMethods = ['Bank Transfer', 'PayPal', 'Revolut', 'Wise'];

const mockOrders = [
  {
    user: 'CryptoKing',
    asset: 'USDT',
    price: '1.00',
    limits: '100 - 1000',
    payment: 'Bank Transfer',
    type: 'Buy',
  },
  {
    user: 'BinancePro',
    asset: 'BTC',
    price: '65000.00',
    limits: '0.01 - 0.5',
    payment: 'PayPal',
    type: 'Sell',
  },
  {
    user: 'ETHMaster',
    asset: 'ETH',
    price: '3200.00',
    limits: '0.1 - 2',
    payment: 'Revolut',
    type: 'Buy',
  },
];

const P2P: React.FC = () => {
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [asset, setAsset] = useState('USDT');
  const [payment, setPayment] = useState('Bank Transfer');
  const [amount, setAmount] = useState('');

  return (
    <div className={styles.p2pPage}>
      <div className={styles.p2pHeader}>
        <h1 className={styles.p2pTitle}>P2P Trading</h1>
        <div className={styles.p2pTabs}>
          <button
            className={side === 'Buy' ? styles.activeTab : styles.tab}
            onClick={() => setSide('Buy')}
          >Buy</button>
          <button
            className={side === 'Sell' ? styles.activeTab : styles.tab}
            onClick={() => setSide('Sell')}
          >Sell</button>
        </div>
        <div className={styles.assetTabs}>
          {assets.map(a => (
            <button
              key={a}
              className={asset === a ? styles.activeAssetTab : styles.assetTab}
              onClick={() => setAsset(a)}
            >{a}</button>
          ))}
        </div>
        <div className={styles.p2pFilters}>
          <select value={payment} onChange={e => setPayment(e.target.value)} className={styles.p2pSelect}>
            {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            className={styles.p2pInput}
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <button className={styles.p2pSearch}>Search</button>
        </div>
      </div>
      <div className={styles.p2pTableWrapper}>
        <table className={styles.p2pTable}>
          <thead>
            <tr>
              <th>Trader</th>
              <th>Asset</th>
              <th>Price</th>
              <th>Limits</th>
              <th>Payment</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.filter(o => o.asset === asset && o.payment === payment && o.type === side).map((order, idx) => (
              <tr key={idx}>
                <td>{order.user}</td>
                <td>{order.asset}</td>
                <td>${order.price}</td>
                <td>{order.limits}</td>
                <td>{order.payment}</td>
                <td>{order.type}</td>
                <td><button className={styles.p2pAction}>{side}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* If no orders match, show a message */}
        {mockOrders.filter(o => o.asset === asset && o.payment === payment && o.type === side).length === 0 && (
          <div className={styles.p2pNoOrders}>No orders found for selected filters.</div>
        )}
      </div>
    </div>
  );
};

export default P2P;
