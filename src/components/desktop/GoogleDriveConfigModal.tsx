import React, { useState, useEffect } from 'react';
import { X, Cloud, Key, Check, AlertCircle } from 'lucide-react';
import { useMediaStore } from '../../store';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleDriveConfigModalProps {
  onClose: () => void;
}

export function GoogleDriveConfigModal({ onClose }: GoogleDriveConfigModalProps) {
  const { getPluginSecret, setPluginSecret, toggleSync, activeSyncs } = useMediaStore();
  const [clientId, setClientId] = useState(getPluginSecret('google', 'clientId') || '');
  const [clientSecret, setClientSecret] = useState(getPluginSecret('google', 'clientSecret') || '');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isActive = activeSyncs.includes('google');
  const hasTokens = !!getPluginSecret('google', 'refreshToken');

  useEffect(() => {
    // Load Google Identity Services script
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSaveSecrets = () => {
    setPluginSecret('google', 'clientId', clientId);
    setPluginSecret('google', 'clientSecret', clientSecret);
    setSuccess('Secrets saved. You can now authenticate.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAuth = () => {
    if (!clientId || !clientSecret) {
      setError('Please save Client ID and Client Secret first.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setError('Google Identity Services failed to load. Please check your connection.');
      return;
    }

    setIsAuthenticating(true);
    setError('');

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.error) {
            setError(`Auth failed: ${response.error}`);
            setIsAuthenticating(false);
            return;
          }

          try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: response.code,
                grant_type: 'authorization_code',
                redirect_uri: window.location.origin,
              }),
            });

            const data = await tokenResponse.json();

            if (data.error) {
              throw new Error(data.error_description || data.error);
            }

            setPluginSecret('google', 'accessToken', data.access_token);
            if (data.refresh_token) {
              setPluginSecret('google', 'refreshToken', data.refresh_token);
            }
            setPluginSecret('google', 'tokenExpiry', Date.now() + data.expires_in * 1000);

            setSuccess('Successfully authenticated with Google Drive!');
            if (!isActive) {
              toggleSync('google');
            }
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            setError(`Token exchange failed: ${err.message}`);
          } finally {
            setIsAuthenticating(false);
          }
        },
      });

      client.requestCode();
    } catch (err: any) {
      setError(`Failed to initialize auth: ${err.message}`);
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    setPluginSecret('google', 'accessToken', null);
    setPluginSecret('google', 'refreshToken', null);
    setPluginSecret('google', 'tokenExpiry', null);
    if (isActive) {
      toggleSync('google');
    }
    setSuccess('Disconnected from Google Drive.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            Google Drive Configuration
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              To sync your journal with Google Drive, you need to provide your own OAuth credentials. 
              These secrets are stored locally and encrypted in your settings backup.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your Google Client ID"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter your Google Client Secret"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                onClick={handleSaveSecrets}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                <Key className="w-4 h-4" />
                Save Secrets
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            {hasTokens ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                  <Check className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Authenticated with Google Drive</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                disabled={isAuthenticating || !clientId || !clientSecret}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
              >
                <Cloud className="w-4 h-4" />
                {isAuthenticating ? 'Authenticating...' : 'Authenticate with Google'}
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
