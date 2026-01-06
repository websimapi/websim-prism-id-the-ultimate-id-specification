import React, { useState } from 'https://esm.sh/react@18.2.0';
import { 
  Check, Search, AlertCircle 
} from 'https://esm.sh/lucide-react@0.263.1';
import { PrismID } from '../prism-id.js';

export function Validator() {
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