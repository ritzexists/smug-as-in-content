import React, { useState } from 'react';
import { X, Cloud, Key, Check, AlertCircle, Server, Shield } from 'lucide-react';
import { useMediaStore } from '../../store';

interface S3ConfigModalProps {
  onClose: () => void;
}

export function S3ConfigModal({ onClose }: S3ConfigModalProps) {
  const { getPluginSecret, setPluginSecret, toggleSync, activeSyncs } = useMediaStore();
  const [endpoint, setEndpoint] = useState(getPluginSecret('s3', 'endpoint') || '');
  const [region, setRegion] = useState(getPluginSecret('s3', 'region') || 'us-east-1');
  const [bucket, setBucket] = useState(getPluginSecret('s3', 'bucket') || '');
  const [accessKeyId, setAccessKeyId] = useState(getPluginSecret('s3', 'accessKeyId') || '');
  const [secretAccessKey, setSecretAccessKey] = useState(getPluginSecret('s3', 'secretAccessKey') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isActive = activeSyncs.includes('s3');

  const handleSave = async () => {
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      setError('Endpoint, Bucket, Access Key ID, and Secret Access Key are required.');
      return;
    }

    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, we'd use @aws-sdk/client-s3 to test the connection.
      // Since we are in a browser environment, we'd need to handle CORS.
      // For now, we'll simulate a successful connection test if the fields are filled.
      // We'll also save the secrets.
      
      setPluginSecret('s3', 'endpoint', endpoint);
      setPluginSecret('s3', 'region', region);
      setPluginSecret('s3', 'bucket', bucket);
      setPluginSecret('s3', 'accessKeyId', accessKeyId);
      setPluginSecret('s3', 'secretAccessKey', secretAccessKey);
      
      setSuccess('S3 Configuration saved!');
      if (!isActive) toggleSync('s3');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(`Connection failed: ${err.message}. Check your credentials and CORS settings.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    setPluginSecret('s3', 'endpoint', null);
    setPluginSecret('s3', 'region', null);
    setPluginSecret('s3', 'bucket', null);
    setPluginSecret('s3', 'accessKeyId', null);
    setPluginSecret('s3', 'secretAccessKey', null);
    if (isActive) toggleSync('s3');
    setSuccess('Disconnected from S3.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            S3 Compatible Storage
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Connect to any S3-compatible storage (AWS, DigitalOcean Spaces, Backblaze B2, MinIO, etc).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Endpoint URL</label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://s3.amazonaws.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="us-east-1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Bucket Name</label>
                  <input
                    type="text"
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                    placeholder="my-journal-backup"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Access Key ID</label>
                <input
                  type="text"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Secret Access Key</label>
                <input
                  type="password"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
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
              <Shield className="w-4 h-4" />
              {isTesting ? 'Saving...' : 'Save & Connect'}
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
