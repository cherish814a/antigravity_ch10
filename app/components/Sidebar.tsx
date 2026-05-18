"use client";

import React from 'react';
import styles from './Sidebar.module.css';
import { 
  Plus, 
  MessageSquare, 
  Bookmark, 
  TrendingUp, 
  Globe, 
  HelpCircle, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>IE</div>
          <div className={styles.logoText}>
            <h1>InsightEngine</h1>
            <span>Precision Review Analysis</span>
          </div>
        </div>

        <button className={styles.newChatBtn}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className={styles.productSelector}>
          <div className={styles.selectorContent}>
            <span>프리미엄 무선 이어폰 Pro</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className={styles.nav}>
          <div className={`${styles.navItem} ${styles.active}`}>
            <MessageSquare size={18} />
            <span>Chat History</span>
          </div>
          <div className={styles.navItem}>
            <Bookmark size={18} />
            <span>Saved Analysis</span>
          </div>
          <div className={styles.navItem}>
            <TrendingUp size={18} />
            <span>Market Trends</span>
          </div>
          <div className={styles.navItem}>
            <Globe size={18} />
            <span>Global Analytics</span>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomItem}>
          <HelpCircle size={18} />
          <span>Support</span>
        </div>
        <div className={styles.bottomItem}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
