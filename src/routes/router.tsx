import { createBrowserRouter } from 'react-router';
import PageShell from '../components/layout/PageShell';
import DashboardPage from '../components/dashboard/DashboardPage';
import DrilldownPage from '../components/drilldown/DrilldownPage';

export const router = createBrowserRouter([
  {
    element: <PageShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'issue/:issueId', element: <DrilldownPage /> },
    ],
  },
]);
