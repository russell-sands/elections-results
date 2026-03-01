import { NavLink } from 'react-router';
import { envConfig } from '../../config/env';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          {envConfig.logoUrl && (
            <img
              src={envConfig.logoUrl}
              alt={`${envConfig.jurisdictionName} logo`}
              className={styles.logo}
            />
          )}
          <div className={styles.titles}>
            <span className={styles.electionName}>{envConfig.electionName}</span>
            {envConfig.jurisdictionName && (
              <span className={styles.jurisdiction}>{envConfig.jurisdictionName}</span>
            )}
          </div>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Map
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
