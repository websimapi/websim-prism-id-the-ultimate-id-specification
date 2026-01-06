import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { Generator } from './components/Generator.js';
import { Validator } from './components/Validator.js';
import { Comparator } from './components/Comparator.js';
import { Specification } from './components/Specification.js';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  
  return (
    <div className="min-h-screen flex flex-col pb-12">
      <header className="border-b border-white/5 p-6 sticky top-0 z-50 glass-panel">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-green-500/20">
              P
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                PRISM ID <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-green-400 font-mono border border-green-500/20">v2.0</span>
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest hidden md:block">Universal • Sortable • Sexy</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {['generate', 'validate', 'compare', 'spec'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto p-6">
        {activeTab === 'generate' && <Generator />}
        {activeTab === 'validate' && <Validator />}
        {activeTab === 'compare' && <Comparator />}
        {activeTab === 'spec' && <Specification />}
      </main>
    </div>
  );
}

// removed function Generator() {} - moved to components/Generator.js

// removed function Validator() {} - moved to components/Validator.js

// removed function Comparator() {} - moved to components/Comparator.js

// removed function Specification() {} - moved to components/Specification.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);