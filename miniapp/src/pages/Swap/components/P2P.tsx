import React from 'react';
import styles from '../style.module.scss';

const P2P: React.FC = () => {
  return (
    <div className={styles.p2pSection}>
      <h2 className={styles.p2pTitle}>P2P Trade</h2>
      <div className={styles.p2pContainer}>
        {/* Binance-like P2P UI mockup */}
        <div className={styles.p2pFilters}>
          <select className={styles.p2pSelect}><option>Buy</option><option>Sell</option></select>
          <select className={styles.p2pSelect}><option>USDT</option><option>ETH</option><option>BTC</option></select>
          <input className={styles.p2pInput} placeholder="Amount" />
          <button className={styles.p2pSearch}>Search</button>
        </div>
        <div className={styles.p2pTableWrapper}>
          <table className={styles.p2pTable}>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Asset</th>
                <th>Price</th>
                <th>Limits</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Example rows */}
              <tr>
                <td>user123</td>
                <td>USDT</td>
                <td>$1.00</td>
                <td>100 - 1000</td>
                <td>Bank Transfer</td>
                <td><button className={styles.p2pBuy}>Buy</button></td>
              </tr>
              <tr>
                <td>cryptoKing</td>
                <td>ETH</td>
                <td>$3200.00</td>
                <td>0.1 - 2</td>
                <td>PayPal</td>
                <td><button className={styles.p2pBuy}>Buy</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default P2P;
