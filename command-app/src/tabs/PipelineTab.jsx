import { useState, useRef } from 'react';

const COL_LABELS = { prospecting: 'Prospecting', proposal: 'Proposal Sent', active: 'Active Client', closed: 'Closed' };
const HEALTH = {
  green: { label: 'Healthy', color: '#22C55E', cls: 'text-success bg-success/10' },
  yellow: { label: 'At Risk', color: '#EAB308', cls: 'text-warning bg-warning/10' },
  red: { label: 'Critical', color: '#EF4444', cls: 'text-danger bg-danger/10' },
};

export default function PipelineTab({ data, setData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [newCard, setNewCard] = useState({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' });
  const dragRef = useRef(null);

  const cards = data.pipeline.cards;
  const lost = cards.filter(c => c.lost);
  const active = cards.filter(c => !c.lost);

  const moveCard = (id, col) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.map(c => c.id === id ? { ...c, column: col } : c) } }));
  const updateCard = (id, u) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.map(c => c.id === id ? { ...c, ...u } : c) } }));
  const deleteCard = (id) => setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: d.pipeline.cards.filter(c => c.id !== id) } }));
  const markLost = (id) => { const r = prompt('Loss reason:'); if (r !== null) updateCard(id, { lost: true, lossReason: r }); };

  const addCard = () => {
    if (!newCard.name.trim()) return;
    setData(d => ({ ...d, pipeline: { ...d.pipeline, cards: [...d.pipeline.cards, {
      id: Date.now().toString(), ...newCard, name: newCard.name.trim(), value: parseFloat(newCard.value) || 0, notes: '', lost: false, lossReason: '',
    }] } }));
    setNewCard({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' });
    setShowAdd(false);
  };

  const totalPipeline = active.filter(c => c.column !== 'closed').reduce((s, c) => s + c.value, 0);

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="flex items-center justify-between mb-2 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Pipeline</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">Total: <span className="font-semibold text-text-primary">${totalPipeline.toLocaleString()}</span></span>
          <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">+ Deal</button>
        </div>
      </div>
      <p className="text-sm text-text-tertiary mb-6 max-w-6xl">{active.filter(c => c.column !== 'closed').length} active deals across {data.pipeline.columns.length} stages</p>

      {showAdd && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 max-w-md space-y-3">
          <input autoFocus value={newCard.name} onChange={(e) => setNewCard(n => ({ ...n, name: e.target.value }))} placeholder="Client name"
            className="w-full bg-transparent text-sm font-medium text-text-primary placeholder-text-tertiary focus:outline-none" />
          <input value={newCard.projectType} onChange={(e) => setNewCard(n => ({ ...n, projectType: e.target.value }))} placeholder="Project type"
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary" />
          <div className="flex gap-2">
            <input type="number" value={newCard.value} onChange={(e) => setNewCard(n => ({ ...n, value: e.target.value }))} placeholder="Value $"
              className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary" />
            <select value={newCard.health} onChange={(e) => setNewCard(n => ({ ...n, health: e.target.value }))}
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary">
              <option value="green">Green</option><option value="yellow">Yellow</option><option value="red">Red</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" value={newCard.followUp} onChange={(e) => setNewCard(n => ({ ...n, followUp: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary" />
            <select value={newCard.column} onChange={(e) => setNewCard(n => ({ ...n, column: e.target.value }))}
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary">
              {Object.entries(COL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-text-tertiary">Cancel</button>
            <button onClick={addCard} className="px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg">Add</button>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {data.pipeline.columns.map(col => {
          const colCards = active.filter(c => c.column === col);
          const colTotal = colCards.reduce((s, c) => s + c.value, 0);
          return (
            <div key={col} className="min-w-[280px] md:min-w-[300px] flex-1 max-w-[340px] snap-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('cardId'); if (id) moveCard(id, col); }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-secondary">{COL_LABELS[col]}</span>
                  <span className="text-xs text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded font-mono">{colCards.length}</span>
                </div>
                <span className="text-xs text-text-tertiary font-mono">${colTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2 min-h-[80px] bg-surface/50 rounded-lg p-2 border border-border-subtle">
                {colCards.map(card => {
                  const h = HEALTH[card.health];
                  return (
                    <div key={card.id} draggable
                      onDragStart={(e) => { dragRef.current = card.id; e.dataTransfer.setData('cardId', card.id); }}
                      className="bg-bg border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-text-tertiary/30 transition-colors">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-sm font-medium truncate flex-1">{card.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${h.cls}`}>{h.label}</span>
                      </div>
                      <p className="text-xs text-text-tertiary mb-2">{card.projectType}</p>
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="font-semibold text-text-primary">${card.value.toLocaleString()}</span>
                        {card.followUp && <span className="text-text-tertiary">Follow-up: {card.followUp}</span>}
                      </div>

                      {(card.notes || editingNotes === card.id) && (
                        <div className="p-2 bg-surface-2 rounded border border-border-subtle mb-2">
                          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium mb-1">Notes</p>
                          <textarea value={card.notes} onChange={(e) => updateCard(card.id, { notes: e.target.value })}
                            onFocus={() => setEditingNotes(card.id)} onBlur={() => setEditingNotes(null)} rows={2}
                            className="w-full bg-transparent text-xs text-text-secondary resize-none focus:outline-none" placeholder="Why they need attention..." />
                        </div>
                      )}

                      <div className="flex items-center gap-1 pt-1.5 border-t border-border-subtle">
                        <select value="" onChange={(e) => { if (e.target.value) moveCard(card.id, e.target.value); }}
                          className="bg-transparent text-[11px] text-text-tertiary focus:outline-none">
                          <option value="">Move...</option>
                          {data.pipeline.columns.filter(c => c !== col).map(c => <option key={c} value={c}>{COL_LABELS[c]}</option>)}
                        </select>
                        {!card.notes && editingNotes !== card.id && (
                          <button onClick={() => setEditingNotes(card.id)} className="text-[11px] text-text-tertiary hover:text-text-secondary px-1.5 py-0.5 rounded hover:bg-surface-2 transition-colors">Note</button>
                        )}
                        <div className="flex-1" />
                        <button onClick={() => markLost(card.id)} className="text-[11px] text-text-tertiary hover:text-danger px-1.5 py-0.5 rounded hover:bg-danger-soft transition-colors">Lost</button>
                        <button onClick={() => deleteCard(card.id)} className="text-text-tertiary hover:text-danger p-0.5 rounded hover:bg-danger-soft transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
        <div className="mt-6 max-w-2xl">
          <button onClick={() => setShowLost(!showLost)} className="flex items-center gap-2 text-xs text-text-tertiary font-medium uppercase tracking-wider mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showLost ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Lost ({lost.length})
          </button>
          {showLost && lost.map(card => (
            <div key={card.id} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg text-sm opacity-50">
              <span>{card.name}</span>
              <div className="flex items-center gap-3">
                {card.lossReason && <span className="text-xs text-text-tertiary">{card.lossReason}</span>}
                <span className="text-danger font-medium">${card.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
