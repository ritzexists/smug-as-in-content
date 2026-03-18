import React, { useState } from 'react';
import { X, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMediaStore } from '../../store';

export function OpenDataModal({ pluginId, onClose }: { pluginId: string, onClose: () => void }) {
  const { addItem, toggleBackend } = useMediaStore();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  const getInstructions = () => {
    switch(pluginId) {
      case 'goodreads': return "Enter your Goodreads RSS URL (e.g., https://www.goodreads.com/review/list_rss/...).";
      case 'imdb': return "Enter your IMDb List Export CSV URL or Ratings Export CSV URL.";
      case 'vimeo': return "Enter a Vimeo Channel or User RSS URL (e.g., https://vimeo.com/channels/staffpicks/videos/rss).";
      case 'youtube': return "Enter a YouTube Channel RSS URL (e.g., https://www.youtube.com/feeds/videos.xml?channel_id=...).";
      case 'trakt': return "Enter your Trakt.tv History RSS URL (e.g., https://trakt.tv/users/username/history.atom).";
      default: return "Enter the data URL.";
    }
  };

  const getTitle = () => {
    switch(pluginId) {
      case 'goodreads': return "Goodreads RSS Import";
      case 'imdb': return "IMDb CSV Import";
      case 'vimeo': return "Vimeo RSS Import";
      case 'youtube': return "YouTube RSS Import";
      case 'trakt': return "Trakt.tv RSS Import";
      default: return "Open Data Import";
    }
  };

  const handleImport = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessCount(0);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const contents = data.contents;

      if (!contents) throw new Error("No data received or URL is invalid.");

      let itemsToAdd: any[] = [];

      if (pluginId === 'goodreads') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(contents, "text/xml");
        const items = xml.querySelectorAll('item');
        items.forEach(item => {
          const title = item.querySelector('title')?.textContent || 'Unknown';
          const creator = item.querySelector('author_name')?.textContent || '';
          const imageUrl = item.querySelector('book_image_url')?.textContent || '';
          const userRating = parseInt(item.querySelector('user_rating')?.textContent || '0');
          const readAt = item.querySelector('user_read_at')?.textContent;
          
          itemsToAdd.push({
            title,
            creator,
            posterUrl: imageUrl,
            rating: userRating * 2,
            type: 'book',
            source: 'goodreads',
            category: readAt ? 'Completed' : 'Plan to Read',
            consumedDate: readAt ? new Date(readAt).toISOString() : new Date().toISOString()
          });
        });
      } else if (pluginId === 'imdb') {
        const lines = contents.split('\n');
        if (lines.length < 2) throw new Error("Invalid CSV format");
        const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
        for(let i=1; i<lines.length; i++) {
          if(!lines[i].trim()) continue;
          const row = [];
          let inQuotes = false;
          let current = '';
          for(let char of lines[i]) {
            if(char === '"') inQuotes = !inQuotes;
            else if(char === ',' && !inQuotes) { row.push(current.trim()); current = ''; }
            else current += char;
          }
          row.push(current.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h: string, idx: number) => obj[h] = row[idx]);
          
          const title = obj['Title'] || 'Unknown';
          const type = obj['Title Type']?.includes('tv') ? 'tv' : 'movie';
          const rating = obj['Your Rating'] ? parseInt(obj['Your Rating']) : 0;
          
          itemsToAdd.push({
            title,
            creator: obj['Directors'] || '',
            type,
            source: 'imdb',
            rating: rating, // IMDb is 1-10, our rating is 1-10
            category: rating > 0 ? 'Completed' : 'Plan to Watch',
            consumedDate: obj['Date Rated'] ? new Date(obj['Date Rated']).toISOString() : new Date().toISOString()
          });
        }
      } else if (pluginId === 'vimeo') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(contents, "text/xml");
        const items = xml.querySelectorAll('item');
        items.forEach(item => {
          const title = item.querySelector('title')?.textContent || 'Unknown';
          const creator = item.getElementsByTagNameNS('*', 'creator')[0]?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent;
          
          itemsToAdd.push({
            title,
            creator,
            type: 'video',
            source: 'vimeo',
            category: 'Completed',
            rating: 0,
            consumedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
          });
        });
      } else if (pluginId === 'youtube') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(contents, "text/xml");
        const entries = xml.querySelectorAll('entry');
        entries.forEach(entry => {
          const title = entry.querySelector('title')?.textContent || 'Unknown';
          const creator = entry.querySelector('author name')?.textContent || '';
          const published = entry.querySelector('published')?.textContent;
          const thumbnail = entry.getElementsByTagNameNS('*', 'thumbnail')[0]?.getAttribute('url') || '';
          
          itemsToAdd.push({
            title,
            creator,
            posterUrl: thumbnail,
            type: 'video',
            source: 'youtube',
            category: 'Completed',
            rating: 0,
            consumedDate: published ? new Date(published).toISOString() : new Date().toISOString()
          });
        });
      } else if (pluginId === 'trakt') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(contents, "text/xml");
        const entries = xml.querySelectorAll('entry');
        entries.forEach(entry => {
          const title = entry.querySelector('title')?.textContent || 'Unknown';
          const published = entry.querySelector('published')?.textContent;
          
          // Trakt titles usually look like "Watched Movie Title" or "Watched Show Title 1x01"
          let cleanTitle = title.replace(/^Watched\s+/i, '');
          let type: 'movie' | 'tv' = 'movie';
          if (cleanTitle.match(/\d+x\d+/)) {
            type = 'tv';
          }
          
          itemsToAdd.push({
            title: cleanTitle,
            creator: '',
            type,
            source: 'trakt',
            category: 'Completed',
            rating: 0,
            consumedDate: published ? new Date(published).toISOString() : new Date().toISOString()
          });
        });
      }

      if (itemsToAdd.length === 0) throw new Error("No items found to import. Check the URL format.");

      itemsToAdd.forEach(item => addItem(item));
      setSuccessCount(itemsToAdd.length);
      toggleBackend(pluginId); // Mark as connected
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to import data. Please check the URL.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {successCount > 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Import Successful!</h3>
                <p className="text-zinc-400 mt-1">Added {successCount} items to your journal.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-zinc-400 text-sm">
                {getInstructions()}
              </p>

              <div className="space-y-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
          {successCount > 0 ? (
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
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
                disabled={isLoading || !url}
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
