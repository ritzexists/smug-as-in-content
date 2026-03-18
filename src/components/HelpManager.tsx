import React from 'react';
import { HelpCircle, Info, ExternalLink, Github, Globe, MessageCircleQuestion, ChevronRight } from 'lucide-react';

export function HelpManager({ onStartTutorial }: { onStartTutorial: () => void }) {
  const faqs = [
    {
      q: "How do I sync my data?",
      a: "Go to the Plugins & Sync page and enable your preferred cloud provider (Google Drive, Box, etc.). Your data will be automatically replicated."
    },
    {
      q: "Can I import my existing history?",
      a: "Yes! Use the Data Backends in the Plugins page to connect services like YouTube, Netflix, or Goodreads to import your history."
    },
    {
      q: "Is my data private?",
      a: "Absolutely. All your journal entries are stored locally on your device. Cloud sync is optional and encrypted."
    },
    {
      q: "What are 'Universes'?",
      a: "Universes are a special category for tracking entire media franchises or cinematic universes as a single entity."
    }
  ];

  return (
    <div className="space-y-12">
      {/* Tutorial Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-3xl">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-400" />
            Need a quick tour?
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            If you're new here or just need a refresher, our interactive tutorial will guide you through the main features of the app.
          </p>
        </div>
        <button
          onClick={onStartTutorial}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 whitespace-nowrap"
        >
          Start Tutorial
        </button>
      </div>

      {/* External Links Bubbles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href="https://github.com/example/media-log" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <Github className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white">GitHub Repository</h4>
            <p className="text-xs text-zinc-500">View source and contribute</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400" />
        </a>
        <a 
          href="https://staticmcp.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <Globe className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white">StaticMCP</h4>
            <p className="text-xs text-zinc-500">Learn more about the platform</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400" />
        </a>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircleQuestion className="w-6 h-6 text-indigo-400" />
          <h4 className="text-2xl font-bold text-white">Frequently Asked Questions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl">
              <h5 className="font-bold text-indigo-400 mb-2">Q: {faq.q}</h5>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-6 h-6 text-indigo-400" />
          <h4 className="text-xl font-bold text-white">About the App</h4>
        </div>
        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>
            This Media Log is designed to be your personal, unified space for tracking your digital life. 
            It prioritizes your data ownership and provides a clean, distraction-free interface.
          </p>
          <p>
            Version: 1.2.0 (Stable)
          </p>
          <div className="flex flex-wrap gap-4 pt-6 border-t border-zinc-800">
            <a href="#" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
              Documentation <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
              Privacy Policy <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
              Terms of Service <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
