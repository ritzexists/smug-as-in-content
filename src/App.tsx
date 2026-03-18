import { useMediaQuery } from 'usehooks-ts';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';

export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      {isDesktop ? <DesktopView /> : <MobileView />}
    </div>
  );
}
