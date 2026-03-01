import { createBrowserRouter } from 'react-router';
import PageShell from '../components/layout/PageShell';
import DashboardPage from '../components/dashboard/DashboardPage';
import MapPage from '../components/map/MapPage';
import DrilldownPage from '../components/drilldown/DrilldownPage';

export const router = createBrowserRouter([
  {
    element: <PageShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'issue/:issueId', element: <DrilldownPage /> },
    ],
  },
]);
