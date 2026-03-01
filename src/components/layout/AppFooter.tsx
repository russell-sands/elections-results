import { envConfig } from '../../config/env';
import styles from './AppFooter.module.css';

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      {envConfig.jurisdictionName && <span>{envConfig.jurisdictionName} &middot; </span>}
      Final election results &middot; All data is public record
    </footer>
  );
}
