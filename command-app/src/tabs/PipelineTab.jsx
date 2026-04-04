import { useState } from 'react';

const COL = { prospecting: 'Prospecting', proposal: 'Proposal Sent', active: 'Active Client', closed: 'Closed' };
const COL_ICON = { prospecting: '🔍', proposal: '📄', active: '🟢', closed: '✅' };
const HL = { green: { l: 'Healthy', c: 'text-emerald-600 bg-emerald-50' }, yellow: { l: 'At Risk', c: 'text-amber-600 bg-amber-50' }, red: { l: 'Critical', c: 'text-red-600 bg-red-50' } };

export default function PipelineTab({ data, setData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [editNotes, setEditNotes] = useState(null);
  const [nc, setNc] = useState({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' });

  const cards = data.pipeline.cards;
  const lost = cards.filter(c => c.lost);
  const active = cards.filter(c => !c.lost);
  const totalPipeline = active.filter(c => c.column !== 'closed').reduce((s, c) => s + c.value, 0);
  const closedTotal = active.filter(c => c.column === 'closed').reduce((s, c) => s + c.value, 0);

  const move = (id, col) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.map(c => c.id === id ? { ...c, column: col } : c) } }));
  const update = (id, u) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.map(c => c.id === id ? { ...c, ...u } : c) } }));
  const del = (id) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.filter(c => c.id !== id) } }));
  const markLost = (id) => { const r = prompt('Loss reason:'); if (r !== null) update(id, { lost: true, lossReason: r }); };
  const add = () => {
    if (!nc.name.trim()) return;
    setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: [...d.pipeline.cards, { id: Date.now().toString(), ...nc, name: nc.name.trim(), value: parseFloat(nc.value) || 0, notes: '', lost: false, lossReason: '' }] } }));
    setNc({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' }); setShowAdd(false);
  };

  return (
    <div className="p-6 md:p-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-[28px] font-semibold tracking-tight">Pipeline</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-text-secondary">Active: <span className="font-semibold text-text-primary">${totalPipeline.toLocaleString()}</span></span>
            <span className="text-text-secondary">Won: <span className="font-semibold text-success">${closedTotal.toLocaleString()}</span></span>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add deal
          </button>
        </div>
      </div>
      <p className="text-sm text-text-tertiary mb-6 flex-shrink-0">{active.filter(c => c.column !== 'closed').length} active deals across {data.pipeline.columns.length} stages</p>

      {showAdd && (
        <div className="card p-5 mb-5 flex-shrink-0">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]"><label className="text-xs text-text-secondary font-medium block mb-1.5">Client</label><input autoFocus value={nc.name} onChange={(e) => setNc(n => ({ ...n, name: e.target.value }))} placeholder="Client name" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div className="w-36"><label className="text-xs text-text-secondary font-medium block mb-1.5">Project</label><input value={nc.projectType} onChange={(e) => setNc(n => ({ ...n, projectType: e.target.value }))} placeholder="Type" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div className="w-24"><label className="text-xs text-text-secondary font-medium block mb-1.5">Value</label><input type="number" value={nc.value} onChange={(e) => setNc(n => ({ ...n, value: e.target.value }))} placeholder="$" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div><label className="text-xs text-text-secondary font-medium block mb-1.5">Health</label><select value={nc.health} onChange={(e) => setNc(n => ({ ...n, health: e.target.value }))} className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"><option value="green">Green</option><option value="yellow">Yellow</option><option value="red">Red</option></select></div>
            <div><label className="text-xs text-text-secondary font-medium block mb-1.5">Follow-up</label><input type="date" value={nc.followUp} onChange={(e) => setNc(n => ({ ...n, followUp: e.target.value }))} className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-text-secondary font-medium block mb-1.5">Stage</label><select value={nc.column} onChange={(e) => setNc(n => ({ ...n, column: e.target.value }))} className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">{Object.entries(COL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-2">Cancel</button><button onClick={add} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg shadow-sm">Add</button></div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-5 min-h-0 overflow-x-auto">
        {data.pipeline.columns.map(col => {
          const cc = active.filter(c => c.column === col);
          const colVal = cc.reduce((s, c) => s + c.value, 0);
          return (
            <div key={col} className="flex flex-col min-h-0 min-w-[260px]"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('cardId'); if (id) move(id, col); }}>
              <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{COL_ICON[col]}</span>
                  <span className="text-[13px] font-semibold text-text-primary">{COL[col]}</span>
                  <span className="text-[11px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded-md">{cc.length}</span>
                </div>
                <span className="text-[12px] text-text-tertiary font-medium">${colVal.toLocaleString()}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 bg-surface-2/50 rounded-xl p-2.5 border border-border-subtle">
                {cc.map(card => {
                  const h = HL[card.health];
                  return (
                    <div key={card.id} draggable onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
                      className="card p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-sm font-semibold">{card.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ml-2 flex-shrink-0 ${h.c}`}>{h.l}</span>
                      </div>
                      <p className="text-xs text-text-tertiary mb-2">{card.projectType}</p>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-text-primary">${card.value.toLocaleString()}</span>
                        {card.followUp && <span className="text-text-tertiary">{card.followUp}</span>}
                      </div>

                      {(card.notes || editNotes === card.id) && (
                        <div className="mt-2 p-2.5 bg-surface-2 rounded-lg border border-border-subtle text-xs">
                          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">Notes</p>
                          <textarea value={card.notes} onChange={(e) => update(card.id, { notes: e.target.value })}
                            onFocus={() => setEditNotes(card.id)} onBlur={() => setEditNotes(null)} rows={2}
                            className="w-full bg-transparent text-text-secondary resize-none focus:outline-none" placeholder="Why they need attention..." />
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border-subtle text-[11px]">
                        <select value="" onChange={(e) => { if (e.target.value) move(card.id, e.target.value); }}
                          className="bg-transparent text-text-tertiary focus:outline-none cursor-pointer">
                          <option value="">Move...</option>
                          {data.pipeline.columns.filter(c => c !== col).map(c => <option key={c} value={c}>{COL[c]}</option>)}
                        </select>
                        {!card.notes && editNotes !== card.id && <button onClick={() => setEditNotes(card.id)} className="text-text-tertiary hover:text-text-secondary px-1.5 py-0.5 rounded hover:bg-surface-2 transition-colors">+ Note</button>}
                        <div className="flex-1" />
                        <button onClick={() => markLost(card.id)} className="text-text-tertiary hover:text-danger px-1.5 py-0.5 rounded hover:bg-danger-soft opacity-0 group-hover:opacity-100 transition-all">Lost</button>
                        <button onClick={() => del(card.id)} className="text-text-tertiary hover:text-danger p-0.5 rounded hover:bg-danger-soft opacity-0 group-hover:opacity-100 transition-all">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {lost.length > 0 && (
        <div className="mt-4 flex-shrink-0">
          <button onClick={() => setShowLost(!showLost)} className="flex items-center gap-2 text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-2 hover:text-text-secondary transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showLost ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }}>
              <polyline points="9 18 15 12 9 6"/></svg>
            Lost Deals ({lost.length})
          </button>
          {showLost && <div className="card overflow-hidden"><table className="w-full"><tbody>
            {lost.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 opacity-50">
                <td className="py-2.5 px-4 text-sm">{c.name}</td>
                <td className="py-2.5 px-4 text-xs text-text-tertiary">{c.projectType}</td>
                <td className="py-2.5 px-4 text-xs text-text-tertiary">{c.lossReason}</td>
                <td className="py-2.5 px-4 text-sm text-danger font-medium text-right">${c.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
    </div>
  );
}
