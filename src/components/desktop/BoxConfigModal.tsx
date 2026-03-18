import React, { useState } from 'react';
import { X, Cloud, Key, Check, AlertCircle } from 'lucide-react';
import { useMediaStore } from '../../store';

interface BoxConfigModalProps {
  onClose: () => void;
}

export function BoxConfigModal({ onClose }: BoxConfigModalProps) {
  const { getPluginSecret, setPluginSecret, toggleSync, activeSyncs } = useMediaStore();
  const [clientId, setClientId] = useState(getPluginSecret('box', 'clientId') || '');
  const [clientSecret, setClientSecret] = useState(getPluginSecret('box', 'clientSecret') || '');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isActive = activeSyncs.includes('box');
  const hasTokens = !!getPluginSecret('box', 'refreshToken');

  const handleSaveSecrets = () => {
    setPluginSecret('box', 'clientId', clientId);
    setPluginSecret('box', 'clientSecret', clientSecret);
    setSuccess('Secrets saved. You can now authenticate.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAuth = () => {
    if (!clientId || !clientSecret) {
      setError('Please save Client ID and Client Secret first.');
      return;
    }

    setIsAuthenticating(true);
    setError('');

    const redirectUri = window.location.origin;
    const authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=box_auth`;

    const authWindow = window.open(authUrl, 'box_auth', 'width=600,height=700');

    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'BOX_AUTH_CODE') {
        const code = event.data.code;
        window.removeEventListener('message', messageListener);
        
        try {
          const response = await fetch('https://api.box.com/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              client_id: clientId,
              client_secret: clientSecret,
            }),
          });

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error_description || data.error);
          }

          setPluginSecret('box', 'accessToken', data.access_token);
          setPluginSecret('box', 'refreshToken', data.refresh_token);
          setPluginSecret('box', 'tokenExpiry', Date.now() + data.expires_in * 1000);

          setSuccess('Successfully authenticated with Box!');
          if (!isActive) toggleSync('box');
          setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
          setError(`Token exchange failed: ${err.message}`);
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    window.addEventListener('message', messageListener);

    // Since we don't have a real callback page that sends postMessage, 
    // we'll instruct the user to copy the code from the URL if the popup doesn't close.
    // Or better, we can poll the window location if it's same-origin (which it should be after redirect).
    const pollTimer = setInterval(() => {
      try {
        if (authWindow && authWindow.closed) {
          clearInterval(pollTimer);
          setIsAuthenticating(false);
          return;
        }

        if (authWindow && authWindow.location.origin === window.location.origin) {
          const url = new URL(authWindow.location.href);
          const code = url.searchParams.get('code');
          if (code) {
            window.postMessage({ type: 'BOX_AUTH_CODE', code }, window.location.origin);
            authWindow.close();
            clearInterval(pollTimer);
          }
        }
      } catch (e) {
        // Cross-origin error is expected while on Box's domain
      }
    }, 500);
  };

  const handleDisconnect = () => {
    setPluginSecret('box', 'accessToken', null);
    setPluginSecret('box', 'refreshToken', null);
    setPluginSecret('box', 'tokenExpiry', null);
    if (isActive) toggleSync('box');
    setSuccess('Disconnected from Box.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            Box Configuration
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Provide your Box OAuth credentials. Redirect URI should be: <code className="text-blue-400">{window.location.origin}</code>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Client Secret</label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button onClick={handleSaveSecrets} className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                <Key className="w-4 h-4" /> Save Secrets
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            {hasTokens ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                  <Check className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Authenticated with Box</p>
                </div>
                <button onClick={handleDisconnect} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                disabled={isAuthenticating || !clientId || !clientSecret}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
              >
                <Cloud className="w-4 h-4" />
                {isAuthenticating ? 'Authenticating...' : 'Authenticate with Box'}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
