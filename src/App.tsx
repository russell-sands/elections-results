import { RouterProvider } from 'react-router';
import { router } from './routes/router';
import { ElectionProvider } from './state/election-context';

export default function App() {
  return (
    <ElectionProvider>
      <RouterProvider router={router} />
    </ElectionProvider>
  );
}
