import React, { useState } from 'react';
import { useMediaStore } from '../store';
import { Download, Upload, Copy, Check, Lock, Key, RefreshCw, FolderOpen, Save } from 'lucide-react';
import CryptoJS from 'crypto-js';

export function SettingsManager() {
  const { 
    activeBackends, 
    activeScrobblers, 
    activeSyncs, 
    importSettings, 
    autoBackupEnabled, 
    toggleAutoBackup,
    categories,
    settingsLastModified,
    settingsLastExported,
    markSettingsExported
  } = useMediaStore();
  const [password, setPassword] = useState('');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getExportData = () => {
    return JSON.stringify({
      activeBackends,
      activeScrobblers,
      activeSyncs,
      autoBackupEnabled,
      categories,
      version: 1
    });
  };

  const handleExport = () => {
    if (!password) {
      setError('Password is required for export');
      return;
    }
    setError('');
    
    try {
      const data = getExportData();
      const encrypted = CryptoJS.AES.encrypt(data, password).toString();
      
      const blob = new Blob([encrypted], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smug-settings.enc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      markSettingsExported();
      setSuccess('Settings exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export settings');
    }
  };

  const handleCopy = () => {
    if (!password) {
      setError('Password is required to encrypt settings');
      return;
    }
    setError('');
    
    try {
      const data = getExportData();
      const encrypted = CryptoJS.AES.encrypt(data, password).toString();
      navigator.clipboard.writeText(encrypted);
      markSettingsExported();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy settings');
    }
  };

  const handleImport = () => {
    if (!password) {
      setError('Password is required for import');
      return;
    }
    if (!importText) {
      setError('Please paste the encrypted settings text');
      return;
    }
    setError('');
    
    try {
      const bytes = CryptoJS.AES.decrypt(importText, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid password or corrupted data');
      }
      
      const data = JSON.parse(decrypted);
      importSettings(data);
      setSuccess('Settings imported successfully');
      setImportText('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to import: Invalid password or corrupted data');
    }
  };

  return (
    <div className="space-y-8">
      {settingsLastModified > settingsLastExported && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-500 mb-1">Unsaved Settings Changes</h4>
            <p className="text-sm text-amber-500/80">
              You have made changes to your settings or categories since your last export. Please export your settings to ensure they are backed up.
            </p>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-indigo-400" /> Encrypted Settings Sync
        </h3>
        <p className="text-zinc-400 text-sm mb-6">
          Securely export and import your plugin configurations and sync settings. Your journal data is not included.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" /> Encryption Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Section */}
            <div className="space-y-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <h4 className="font-medium text-white">Export Settings</h4>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="space-y-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <h4 className="font-medium text-white">Import Settings</h4>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste encrypted settings here..."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm font-mono"
              />
              <button
                onClick={handleImport}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Upload className="w-4 h-4" /> Import Settings
              </button>
            </div>
          </div>

          {activeSyncs.length > 0 && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-indigo-400" /> Auto-Backup
              </h4>
              <div className="space-y-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={toggleAutoBackup}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <span className="block text-white font-medium">Store all changes</span>
                    <span className="block text-sm text-zinc-400">Automatically backup settings when changes occur</span>
                  </div>
                </label>

                <div className="flex gap-3 pt-4 border-t border-zinc-800/50">
                  <button
                    onClick={() => setSuccess('Backup location configured (Mock)')}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" /> Configure Location
                  </button>
                  <button
                    onClick={() => setSuccess('Manual backup completed (Mock)')}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" /> Manual Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
