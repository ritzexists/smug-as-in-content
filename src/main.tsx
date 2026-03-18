import * as util from 'util';

// Polyfill util.debuglog for ssh2 compatibility in the browser
if (typeof (util as any).debuglog !== 'function') {
  (util as any).debuglog = () => () => {};
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
