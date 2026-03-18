import React, { useState } from 'react';
import { X, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMediaStore } from '../../store';
import { fetchFromS3 } from '../../services/s3Sync';

export function OpenDataImportModal({ pluginId, onClose }: { pluginId: string, onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const { addItem, activePublicBackends, togglePublicBackend, getPluginSecret } = useMediaStore();

  const pluginNames: Record<string, string> = {
    openlibrary: 'Open Library',
    listenbrainz: 'ListenBrainz',
    mal: 'MyAnimeList',
    vimeo: 'Vimeo',
    goodreads: 'Goodreads RSS',
    s3: 'S3 Compatible'
  };

  const handleImport = async () => {
    if (pluginId !== 's3' && !username.trim()) {
      setError('Please enter a username or ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessCount(null);

    try {
      let count = 0;

      if (pluginId === 's3') {
        const endpoint = getPluginSecret('s3', 'endpoint');
        const region = getPluginSecret('s3', 'region');
        const bucket = getPluginSecret('s3', 'bucket');
        const accessKeyId = getPluginSecret('s3', 'accessKeyId');
        const secretAccessKey = getPluginSecret('s3', 'secretAccessKey');

        if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
          throw new Error('S3 not configured. Please configure it in the Sync tab.');
        }

        const data = await fetchFromS3({
          endpoint,
          region: region || 'us-east-1',
          bucket,
          accessKeyId,
          secretAccessKey,
        });

        for (const item of data) {
          addItem(item);
          count++;
        }
      } else if (pluginId === 'openlibrary') {
        const res = await fetch(`https://openlibrary.org/people/${username}/books/already-read.json`);
        if (!res.ok) throw new Error('User not found or list is private');
        const data = await res.json();
        
        for (const entry of data.entries || []) {
          addItem({
            title: entry.work?.title || 'Unknown Book',
            type: 'book',
            source: 'openlibrary',
            creator: entry.work?.author_names?.[0] || 'Unknown Author',
            rating: 0,
            consumedDate: entry.logged_date ? new Date(entry.logged_date).toISOString() : new Date().toISOString(),
            externalId: entry.work?.key
          });
          count++;
        }
      } else if (pluginId === 'listenbrainz') {
        const res = await fetch(`https://api.listenbrainz.org/1/user/${username}/listens?count=50`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        
        for (const listen of data.payload?.listens || []) {
          addItem({
            title: listen.track_metadata?.track_name || 'Unknown Track',
            type: 'music',
            source: 'listenbrainz',
            creator: listen.track_metadata?.artist_name || 'Unknown Artist',
            rating: 0,
            consumedDate: listen.listened_at ? new Date(listen.listened_at * 1000).toISOString() : new Date().toISOString(),
          });
          count++;
        }
      } else if (pluginId === 'mal') {
        const res = await fetch(`https://api.jikan.moe/v4/users/${username}/animelist`);
        if (!res.ok) throw new Error('User not found or list is private');
        const data = await res.json();
        
        for (const entry of data.data || []) {
          addItem({
            title: entry.anime?.title || 'Unknown Anime',
            type: 'tv',
            source: 'mal',
            posterUrl: entry.anime?.images?.jpg?.image_url,
            rating: entry.score > 0 ? entry.score : 0,
            consumedDate: new Date().toISOString(),
            externalId: entry.anime?.mal_id?.toString()
          });
          count++;
        }
      } else if (pluginId === 'vimeo') {
        const res = await fetch(`https://vimeo.com/api/v2/${username}/likes.json`);
        if (!res.ok) throw new Error('User not found or list is private');
        const data = await res.json();
        
        for (const video of data || []) {
          addItem({
            title: video.title || 'Unknown Video',
            type: 'vid',
            source: 'vimeo',
            creator: video.user_name || 'Unknown Creator',
            posterUrl: video.thumbnail_large,
            rating: 0,
            consumedDate: video.liked_on ? new Date(video.liked_on).toISOString() : new Date().toISOString(),
            externalId: video.id?.toString()
          });
          count++;
        }
      } else if (pluginId === 'goodreads') {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.goodreads.com/review/list_rss/${username}?shelf=read`)}`);
        if (!res.ok) throw new Error('Failed to fetch Goodreads RSS');
        const data = await res.json();
        
        if (!data.contents) throw new Error('User not found or list is private');
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const items = xmlDoc.querySelectorAll("item");
        
        if (items.length === 0) throw new Error('No books found or invalid user ID');
        
        items.forEach(item => {
          const title = item.querySelector("title")?.textContent || 'Unknown Book';
          const authorName = item.querySelector("author_name")?.textContent || 'Unknown Author';
          const userRating = parseInt(item.querySelector("user_rating")?.textContent || '0', 10);
          const userReadAt = item.querySelector("user_read_at")?.textContent;
          const bookImage = item.querySelector("book_large_image_url")?.textContent;
          const bookId = item.querySelector("book_id")?.textContent;
          
          addItem({
            title: title,
            type: 'book',
            source: 'goodreads',
            creator: authorName,
            posterUrl: bookImage,
            rating: userRating > 0 ? userRating * 2 : 0,
            consumedDate: userReadAt && userReadAt.trim() !== '' ? new Date(userReadAt).toISOString() : new Date().toISOString(),
            externalId: bookId || undefined
          });
          count++;
        });
      }

      setSuccessCount(count);
      if (!activePublicBackends.includes(pluginId)) {
        togglePublicBackend(pluginId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import from {pluginNames[pluginId]}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {successCount !== null ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Import Successful!</h3>
                <p className="text-zinc-400 mt-1">Successfully imported {successCount} items to your journal.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-zinc-400 text-sm">
                Enter your public {pluginNames[pluginId]} username to import your public data. No login required.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., john_doe"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
          {successCount !== null ? (
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={isLoading || !username.trim()}
                className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isLoading ? 'Importing...' : 'Import Data'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
