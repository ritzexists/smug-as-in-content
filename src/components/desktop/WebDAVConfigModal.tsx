import React, { useState } from 'react';
import { X, Cloud, Key, Check, AlertCircle, Globe } from 'lucide-react';
import { useMediaStore } from '../../store';

interface WebDAVConfigModalProps {
  onClose: () => void;
  pluginId?: 'dav' | 'nextcloud';
  title?: string;
}

export function WebDAVConfigModal({ onClose, pluginId = 'dav', title = 'WebDAV' }: WebDAVConfigModalProps) {
  const { getPluginSecret, setPluginSecret, toggleSync, activeSyncs } = useMediaStore();
  const [url, setUrl] = useState(getPluginSecret(pluginId, 'url') || '');
  const [username, setUsername] = useState(getPluginSecret(pluginId, 'username') || '');
  const [password, setPassword] = useState(getPluginSecret(pluginId, 'password') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isActive = activeSyncs.includes(pluginId);

  const handleSave = async () => {
    if (!url || !username || !password) {
      setError('All fields are required.');
      return;
    }

    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation: try a PROPFIND or OPTIONS request
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
      });

      if (!response.ok && response.status !== 405) { // 405 might mean OPTIONS is disabled but server is there
        throw new Error(`Server responded with ${response.status}`);
      }

      setPluginSecret(pluginId, 'url', url);
      setPluginSecret(pluginId, 'username', username);
      setPluginSecret(pluginId, 'password', password);
      
      setSuccess('Configuration saved and verified!');
      if (!isActive) toggleSync(pluginId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(`Connection failed: ${err.message}. Check URL and credentials.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    setPluginSecret(pluginId, 'url', null);
    setPluginSecret(pluginId, 'username', null);
    setPluginSecret(pluginId, 'password', null);
    if (isActive) toggleSync(pluginId);
    setSuccess('Disconnected.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            {title} Configuration
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Enter your {title} server details. Use an App Password if available.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Server URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/remote.php/dav/files/user/"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Password / App Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
            >
              <Check className="w-4 h-4" />
              {isTesting ? 'Testing Connection...' : 'Save & Connect'}
            </button>
            
            {isActive && (
              <button onClick={handleDisconnect} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                Disconnect
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
