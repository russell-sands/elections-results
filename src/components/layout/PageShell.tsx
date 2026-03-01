import { Outlet } from 'react-router';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import styles from './PageShell.module.css';

export default function PageShell() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
