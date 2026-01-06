import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { 
  Copy, RefreshCw, Check, ShieldCheck, Database, 
  Globe, Zap, LayoutGrid, Terminal, Cpu, Search, AlertCircle 
} from 'https://esm.sh/lucide-react@0.263.1';
import { PrismID } from './prism-id.js';

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

function Generator() {
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

function Validator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const handleValidate = (val) => {
    setInput(val);
    if (!val) {
      setResult(null);
      return;
    }
    const isValid = PrismID.isValid(val);
    const parsed = PrismID.parse(val);
    setResult({ isValid, parsed });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">ID Validator</h2>
        <p className="text-slate-400">Check if a string is a valid PRISM ID and analyze its structure.</p>
      </div>

      <div className="glass-panel p-8 rounded-xl space-y-6">
        <div className="relative">
           <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
           <input 
             type="text" 
             value={input}
             onChange={(e) => handleValidate(e.target.value)}
             className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-500/50 font-mono text-lg"
             placeholder="Paste ID here..."
           />
        </div>

        {result && (
          <div className={`rounded-lg border p-6 ${result.isValid ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.isValid ? (
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Check size={24} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle size={24} />
                </div>
              )}
              <div>
                <h3 className={`text-lg font-bold ${result.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {result.isValid ? 'Valid PRISM ID' : 'Invalid ID'}
                </h3>
                <p className="text-sm text-slate-400">
                  {result.isValid ? 'Checksum verified successfully.' : 'Checksum mismatch or invalid characters.'}
                </p>
              </div>
            </div>
            
            {result.parsed && (
               <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-mono border-t border-white/5 pt-4">
                 <div>
                   <span className="text-slate-500 block">Inferred Type</span>
                   <span className="text-white capitalize">{result.parsed.type}</span>
                 </div>
                 <div>
                   <span className="text-slate-500 block">Clean Length</span>
                   <span className="text-white">{result.parsed.length} chars</span>
                 </div>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Comparator() {
  const features = [
    { name: "Sortable", prism: true, uuid: false, ulid: true, nano: false },
    { name: "Human Readable", prism: true, uuid: false, ulid: false, nano: true },
    { name: "Type Prefixes", prism: true, uuid: false, ulid: false, nano: false },
    { name: "Distributed", prism: true, uuid: true, ulid: true, nano: true },
    { name: "No Special Chars", prism: true, uuid: true, ulid: true, nano: false },
    { name: "Collision Resistant", prism: true, uuid: true, ulid: true, nano: true },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-white">Why PRISM is Better</h2>
        <p className="text-slate-400">
          Comparing the Sexiest ID against legacy formats. Prism ID combines the best features of ULID, UUIDv7, and Stripe-like prefixes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "PRISM ID", example: "usr-k7ra-xov5-m9", score: 98, color: "text-green-400", border: "border-green-500/50" },
          { name: "UUID v4", example: "550e8400-e29b...", score: 60, color: "text-slate-400", border: "border-white/10" },
          { name: "ULID", example: "01ARZ3NDEKTSV...", score: 85, color: "text-blue-400", border: "border-blue-500/30" },
          { name: "NanoID", example: "V1StGXR8_Z5jd...", score: 75, color: "text-purple-400", border: "border-purple-500/30" },
        ].map(id => (
          <div key={id.name} className={`glass-panel p-6 rounded-xl border ${id.border} relative overflow-hidden group hover:-translate-y-1 transition-transform`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Cpu size={100} />
             </div>
             <h3 className={`text-xl font-bold ${id.color} mb-2`}>{id.name}</h3>
             <div className="font-mono text-xs text-slate-500 mb-4 truncate">{id.example}</div>
             
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Utility Score</span>
                 <span className="text-white font-bold">{id.score}/100</span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                 <div className={`h-full ${id.name === 'PRISM ID' ? 'bg-green-400' : 'bg-slate-600'}`} style={{width: `${id.score}%`}}></div>
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-slate-400 font-medium">Feature</th>
                <th className="p-4 text-green-400 font-bold bg-green-500/10 border-b-2 border-green-500">PRISM ID</th>
                <th className="p-4 text-slate-300 font-medium">UUID v4/v7</th>
                <th className="p-4 text-slate-300 font-medium">ULID</th>
                <th className="p-4 text-slate-300 font-medium">NanoID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map((f, i) => (
                <tr key={f.name} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-300 font-medium">{f.name}</td>
                  <td className="p-4 bg-green-500/5">
                    {f.prism ? <Check size={20} className="text-green-400" /> : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="p-4">
                    {f.uuid ? <Check size={20} className="text-slate-400" /> : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="p-4">
                    {f.ulid ? <Check size={20} className="text-slate-400" /> : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="p-4">
                    {f.nano ? <Check size={20} className="text-slate-400" /> : <span className="text-slate-600">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Specification() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-300 leading-relaxed pb-12">
      <div className="border-l-4 border-green-500 pl-6 py-2">
        <h2 className="text-3xl font-bold text-white mb-2">The Specification</h2>
        <p className="text-lg text-green-400 font-mono">Format: [PREFIX]-[TIME]-[ENTROPY]-[CHECK]</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-400"/>
            Character Set (Base31)
          </h3>
          <p className="mb-4 text-sm">
            Optimized for readability and typo-prevention.
            Removes ambiguous characters (0, 1, c, l, q) to ensure correct manual entry.
          </p>
          <div className="font-mono bg-black/50 p-4 rounded-lg text-green-400 break-all border border-white/5 text-center text-lg">
            23456789abdefghijkmnoprstuvwxyz
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-purple-400"/>
            Binary Layout
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Time (29-48 bits)</span>
              <span className="text-slate-500">Sortable precision</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Entropy (35-75 bits)</span>
              <span className="text-slate-500">CSPRNG randomness</span>
            </li>
            <li className="flex justify-between">
              <span>Checksum (5 bits)</span>
              <span className="text-slate-500">Luhn-31 algorithm</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-xl space-y-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe size={24} className="text-green-400"/>
            Why it works
        </h3>
        <p>
          PRISM ID uses a custom Base31 encoding that is <span className="text-white font-semibold">lexicographically sortable</span>. 
          The characters are chosen such that their ASCII values are in the same order as their numeric values (2-9 come before a-z). 
        </p>
        <p>
          This means you can store these IDs as standard text strings in any database (PostgreSQL, MySQL, MongoDB, Redis) and they will 
          automatically index in chronological order, without needing special UUID types.
        </p>
        <div className="mt-4 p-4 bg-black/40 rounded border border-white/10 font-mono text-xs text-slate-400">
            <div>ORDER BY id DESC</div>
            <div className="text-green-500">// Returns newest records first, automatically.</div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);