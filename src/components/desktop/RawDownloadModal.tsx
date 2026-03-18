import React, { useState } from 'react';
import { X, Download, Lock, Unlock } from 'lucide-react';
import { useMediaStore } from '../../store';
import { strToU8, zipSync } from 'fflate';
import CryptoJS from 'crypto-js';

export function RawDownloadModal({ onClose }: { onClose: () => void }) {
  const { items } = useMediaStore();
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      // 1. Prepare data
      const data = JSON.stringify(items, null, 2);
      let finalData = data;
      let filename = 'journal.json';

      // 2. Encrypt if requested
      if (encrypt && password) {
        finalData = CryptoJS.AES.encrypt(data, password).toString();
        filename = 'journal.enc';
      }

      // 3. Compress using fflate
      const zipped = zipSync({
        [filename]: strToU8(finalData)
      });

      // 4. Trigger download
      const blob = new Blob([zipped], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smug-journal-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to create backup.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Raw Download Backup</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-zinc-400 text-sm">
            Download your entire media journal as a compressed ZIP file. Settings are not included.
          </p>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full transition-colors relative ${encrypt ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${encrypt ? 'translate-x-4' : ''}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={encrypt} 
                onChange={(e) => setEncrypt(e.target.checked)} 
              />
              <span className="text-zinc-300 font-medium flex items-center gap-2">
                {encrypt ? <Lock className="w-4 h-4 text-indigo-400" /> : <Unlock className="w-4 h-4 text-zinc-500" />}
                Encrypt Backup
              </span>
            </label>

            {encrypt && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-zinc-400">Encryption Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-xs text-amber-500/80">
                  Warning: If you lose this password, your backup cannot be recovered.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading || (encrypt && !password)}
            className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Processing...' : 'Download ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
}
