import { useMediaQuery } from 'usehooks-ts';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';
import { SyncManager } from './components/SyncManager';

export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <SyncManager />
      {isDesktop ? <DesktopView /> : <MobileView />}
    </div>
  );
}
