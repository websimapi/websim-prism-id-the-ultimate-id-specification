import React from 'https://esm.sh/react@18.2.0';
import { 
  ShieldCheck, Globe, LayoutGrid 
} from 'https://esm.sh/lucide-react@0.263.1';

export function Specification() {
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