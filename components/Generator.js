import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import { 
  Copy, RefreshCw, Check, Zap, Terminal 
} from 'https://esm.sh/lucide-react@0.263.1';
import { PrismID } from '../prism-id.js';

export function Generator() {
  const [config, setConfig] = useState({
    type: 'standard',
    prefix: 'usr',
    count: 3
  });
  const [ids, setIds] = useState([]);
  const [lastCopied, setLastCopied] = useState(null);

  useEffect(() => {
    // Try to get username for prefix
    if (window.websim && window.websim.getCreatedBy) {
      window.websim.getCreatedBy().then(u => {
         if (u && u.username) {
           const p = u.username.slice(0, 3).toLowerCase().replace(/[^a-z0-9]/g, '');
           if(p) setConfig(prev => ({...prev, prefix: p}));
         }
      });
    }
  }, []);

  const generate = () => {
    const newIds = Array(config.count).fill(0).map(() => 
      PrismID.generate(config.type, config.prefix)
    );
    setIds(newIds);
  };

  useEffect(() => {
    generate();
  }, [config]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setLastCopied(index);
    if (window.confetti) {
      window.confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#00ff9d', '#00b8ff'],
        disableForReducedMotion: true,
        zIndex: 1000
      });
    }
    setTimeout(() => setLastCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-xl space-y-6 border-t-4 border-t-green-500">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-green-400" />
            Configuration
          </h2>
          
          <div className="space-y-3">
            <label className="text-sm text-slate-400 font-medium">Format Size</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PrismID.CONFIG).map(type => (
                <button
                  key={type}
                  onClick={() => setConfig({...config, type})}
                  className={`px-3 py-2 rounded-lg text-sm font-mono border text-left transition-all relative overflow-hidden ${
                    config.type === type 
                      ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                      : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className="font-bold relative z-10">{PrismID.CONFIG[type].name}</div>
                  <div className="text-xs opacity-60 relative z-10">{PrismID.CONFIG[type].bits} bits</div>
                  {config.type === type && <div className="absolute inset-0 bg-green-500/10 blur-sm"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400 font-medium">Type Prefix</label>
            <div className="relative">
              <input 
                type="text" 
                value={config.prefix}
                onChange={(e) => setConfig({...config, prefix: e.target.value.toLowerCase()})}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500/50 font-mono transition-colors"
                placeholder="e.g. ord, usr, pay"
                maxLength={8}
              />
              <div className="absolute right-3 top-2.5 text-xs text-slate-500">Optional</div>
            </div>
          </div>
          
          <div className="space-y-3">
             <label className="text-sm text-slate-400 font-medium">Quantity: {config.count}</label>
             <input 
               type="range" 
               min="1" 
               max="10" 
               value={config.count} 
               onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
               className="w-full accent-green-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
             />
          </div>

          <button 
            onClick={generate}
            className="w-full btn-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RefreshCw size={18} />
            Regenerate IDs
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Structure Analysis</h3>
          <div className="space-y-4 text-sm font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-white/5">
              <span className="text-slate-500">Time Sortable</span>
              <span className={PrismID.CONFIG[config.type].layout.time > 0 ? "text-blue-400" : "text-slate-600"}>
                {PrismID.CONFIG[config.type].layout.time > 0 ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/5">
              <span className="text-slate-500">Random Bits</span>
              <span className="text-purple-400">
                {PrismID.CONFIG[config.type].layout.rand * 5} bits
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-white/5">
              <span className="text-slate-500">Checksum</span>
              <span className={PrismID.CONFIG[config.type].layout.check > 0 ? "text-green-400" : "text-slate-600"}>
                {PrismID.CONFIG[config.type].layout.check > 0 ? 'Luhn-31' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {ids.map((id, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-black/40 border border-white/10 rounded-xl p-6 flex items-center justify-between hover:border-white/20 transition-all">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-2xl md:text-3xl text-white tracking-wide overflow-hidden text-ellipsis whitespace-nowrap">
                  {id.split('-').map((part, i, arr) => (
                    <span key={i} className={
                      i === 0 && config.prefix ? "text-slate-500" :
                      i === arr.length - 1 && PrismID.CONFIG[config.type].layout.check > 0 ? "text-green-400" : "text-white"
                    }>
                      {part}{i < arr.length - 1 && <span className="text-slate-700">-</span>}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-xs text-slate-500 font-mono">
                  <span>len: {id.length}</span>
                  {PrismID.CONFIG[config.type].layout.check > 0 && 
                    <span className="flex items-center gap-1"><Check size={12} className="text-green-500"/> Valid Checksum</span>
                  }
                </div>
              </div>
              
              <button 
                onClick={() => copyToClipboard(id, idx)}
                className="ml-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors group-hover:text-white"
                title="Copy to clipboard"
              >
                {lastCopied === idx ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <Terminal size={18} />
            Developer Usage
          </h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto border border-white/5">
            <div className="flex gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
            </div>
            <p className="text-slate-500">// Install</p>
            <p className="mb-2">$ npm install prism-id</p>
            <p className="text-slate-500">// Usage</p>
            <p><span className="text-purple-400">import</span> {'{ PrismID }'} <span className="text-purple-400">from</span> 'prism-id';</p>
            <p className="mt-2"><span className="text-blue-400">const</span> id = PrismID.<span className="text-yellow-300">generate</span>('<span className="text-green-300">{config.type}</span>', '<span className="text-green-300">{config.prefix}</span>');</p>
            <p className="text-slate-500 mt-1">// Output: "{ids[0]}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}