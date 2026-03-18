import React, { useState, useEffect } from 'react';
import { useMediaStore } from '../../store';
import { X, Save, Trash2, Star, Image as ImageIcon, Share2 } from 'lucide-react';
import { MediaItem, MediaType } from '../../types';

export function ReviewEditor({ itemId, onClose }: { itemId: string | null, onClose: () => void }) {
  const { items, addItem, updateItem, deleteItem, categories } = useMediaStore();
  const existingItem = itemId ? items.find(i => i.id === itemId) : null;

  const [formData, setFormData] = useState<Partial<MediaItem>>({
    title: '',
    type: 'movie',
    rating: 5,
    review: '',
    consumedDate: new Date().toISOString().split('T')[0],
    source: 'manual',
    creator: '',
    posterUrl: ''
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (existingItem) {
      setFormData({
        ...existingItem,
        consumedDate: existingItem.consumedDate.split('T')[0]
      });
      setTagInput(existingItem.tags?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        type: 'movie',
        rating: 5,
        review: '',
        consumedDate: new Date().toISOString().split('T')[0],
        source: 'manual',
        creator: '',
        posterUrl: '',
        tags: []
      });
      setTagInput('');
    }
  }, [existingItem, itemId]);

  const handleSave = () => {
    if (!formData.title) return;
    
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    
    const itemToSave = {
      ...formData,
      tags,
      consumedDate: new Date(formData.consumedDate!).toISOString(),
    } as Omit<MediaItem, 'id'>;

    if (existingItem) {
      updateItem(existingItem.id, itemToSave);
    } else {
      addItem(itemToSave);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingItem) {
      if (window.confirm('Are you sure you want to delete this entry?')) {
        deleteItem(existingItem.id);
        onClose();
      }
    }
  };

  return (
    <div id="desktop-editor" className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
        <h3 className="font-bold text-lg">{existingItem ? 'Edit Entry' : 'New Entry'}</h3>
        <div className="flex items-center gap-2">
          {existingItem && (
            <>
              <button onClick={() => alert('Sharing to Bluesky/Mastodon...')} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. The Matrix"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as MediaType})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
              >
                <option value="movie">Film</option>
                <option value="movies">Movie</option>
                <option value="universe">Universe</option>
                <option value="tv">TV Show</option>
                <option value="book">Book</option>
                <option value="comic">Comic</option>
                <option value="game">Game</option>
                <option value="music">Music</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Category</label>
              <select 
                value={formData.category || ''}
                onChange={e => setFormData({...formData, category: e.target.value || undefined})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
              >
                <option value="">None</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Date Consumed</label>
            <input 
              type="date" 
              value={formData.consumedDate}
              onChange={e => setFormData({...formData, consumedDate: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Creator / Author / Director</label>
            <input 
              type="text" 
              value={formData.creator || ''}
              onChange={e => setFormData({...formData, creator: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
              placeholder="e.g. Wachowski Sisters"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Poster URL</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={formData.posterUrl || ''}
                onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="https://..."
              />
              <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {formData.posterUrl ? (
                  <img src={formData.posterUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <ImageIcon className="w-4 h-4 text-zinc-600" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
              placeholder="e.g. sci-fi, action, 90s"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
              <span>Rating</span>
              <span className="text-yellow-400 font-bold">{formData.rating}/10</span>
            </label>
            <input 
              type="range" 
              min="0" max="10" step="0.5"
              value={formData.rating}
              onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
              className="w-full accent-indigo-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Review</label>
            <textarea 
              value={formData.review || ''}
              onChange={e => setFormData({...formData, review: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none min-h-[200px] resize-y leading-relaxed"
              placeholder="Write your thoughts here..."
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur sticky bottom-0">
        <button 
          onClick={handleSave}
          disabled={!formData.title}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Save className="w-5 h-5" />
          Save Entry
        </button>
      </div>
    </div>
  );
}
