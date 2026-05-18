import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Sidebar />
      <ChatArea />
    </main>
  );
}
