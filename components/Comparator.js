import React from 'https://esm.sh/react@18.2.0';
import { 
  Check, Cpu 
} from 'https://esm.sh/lucide-react@0.263.1';

export function Comparator() {
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