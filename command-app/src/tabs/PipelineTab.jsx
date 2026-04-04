import { useState, useRef } from 'react';

const COLUMN_LABELS = {
  prospecting: 'Prospecting',
  proposal: 'Proposal Sent',
  active: 'Active Client',
  closed: 'Closed',
};

const COLUMN_COLORS = {
  prospecting: { dot: 'bg-text-tertiary', bg: 'bg-text-tertiary/5' },
  proposal: { dot: 'bg-warning', bg: 'bg-warning/5' },
  active: { dot: 'bg-accent', bg: 'bg-accent/5' },
  closed: { dot: 'bg-success', bg: 'bg-success/5' },
};

const HEALTH_STYLES = {
  green: { color: '#30D158', bg: 'bg-success/10', text: 'text-success', label: 'Healthy' },
  yellow: { color: '#FFD60A', bg: 'bg-warning/10', text: 'text-warning', label: 'At Risk' },
  red: { color: '#FF453A', bg: 'bg-danger/10', text: 'text-danger', label: 'Critical' },
};

export default function PipelineTab({ data, setData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [newCard, setNewCard] = useState({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' });
  const dragCard = useRef(null);

  const cards = data.pipeline.cards;
  const lostCards = cards.filter(c => c.lost);
  const activeCards = cards.filter(c => !c.lost);

  const closedTotal = activeCards
    .filter(c => c.column === 'closed')
    .reduce((s, c) => s + c.value, 0);

  const moveCard = (cardId, toColumn) => {
    setData(d => ({
      ...d,
      pipeline: {
        ...d.pipeline,
        cards: d.pipeline.cards.map(c => c.id === cardId ? { ...c, column: toColumn } : c)
      }
    }));
  };

  const updateCard = (cardId, updates) => {
    setData(d => ({
      ...d,
      pipeline: {
        ...d.pipeline,
        cards: d.pipeline.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
      }
    }));
  };

  const markLost = (cardId) => {
    const reason = prompt('Loss reason:');
    if (reason !== null) {
      updateCard(cardId, { lost: true, lossReason: reason });
    }
  };

  const addCard = () => {
    if (!newCard.name.trim()) return;
    const card = {
      id: Date.now().toString(),
      ...newCard,
      name: newCard.name.trim(),
      value: parseFloat(newCard.value) || 0,
      notes: '',
      lost: false,
      lossReason: '',
    };
    setData(d => ({
      ...d,
      pipeline: { ...d.pipeline, cards: [...d.pipeline.cards, card] }
    }));
    setNewCard({ name: '', projectType: '', value: '', followUp: '', health: 'green', column: 'prospecting' });
    setShowAdd(false);
  };

  const deleteCard = (cardId) => {
    setData(d => ({
      ...d,
      pipeline: { ...d.pipeline, cards: d.pipeline.cards.filter(c => c.id !== cardId) }
    }));
  };

  return (
    <div className="pt-14 pb-8">
      <div className="flex items-center justify-between mb-6 px-5 max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold tracking-tight">Pipeline</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-accent text-white text-[12px] font-bold rounded-xl hover:bg-accent/85 transition shadow-[0_2px_8px_rgba(0,102,255,0.25)] active:scale-95"
        >
          + Deal
        </button>
      </div>

      {showAdd && (
        <div className="mx-5 mb-6 max-w-lg mx-auto">
          <div className="card card-glow p-4 space-y-3">
            <input
              autoFocus
              value={newCard.name}
              onChange={(e) => setNewCard(n => ({ ...n, name: e.target.value }))}
              placeholder="Client name"
              className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none font-medium"
            />
            <input
              value={newCard.projectType}
              onChange={(e) => setNewCard(n => ({ ...n, projectType: e.target.value }))}
              placeholder="Project type"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newCard.value}
                onChange={(e) => setNewCard(n => ({ ...n, value: e.target.value }))}
                placeholder="Value $"
                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary"
              />
              <select
                value={newCard.health}
                onChange={(e) => setNewCard(n => ({ ...n, health: e.target.value }))}
                className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
              >
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={newCard.followUp}
                onChange={(e) => setNewCard(n => ({ ...n, followUp: e.target.value }))}
                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
              />
              <select
                value={newCard.column}
                onChange={(e) => setNewCard(n => ({ ...n, column: e.target.value }))}
                className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
              >
                {Object.entries(COLUMN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 text-[13px] text-text-tertiary font-medium rounded-lg hover:bg-surface-2 transition">Cancel</button>
              <button onClick={addCard} className="flex-1 py-2 bg-accent text-white text-[13px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,102,255,0.3)]">Add Deal</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-5 snap-x snap-mandatory">
        {data.pipeline.columns.map(col => {
          const colCards = activeCards.filter(c => c.column === col);
          const colColor = COLUMN_COLORS[col];
          const colTotal = colCards.reduce((s, c) => s + c.value, 0);
          return (
            <div
              key={col}
              className="min-w-[300px] w-[300px] snap-center flex-shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData('cardId');
                if (cardId) moveCard(cardId, col);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colColor.dot}`} />
                  <span className="text-[13px] font-semibold text-text-secondary">{COLUMN_LABELS[col]}</span>
                  <span className="text-[11px] text-text-tertiary font-medium ml-0.5">{colCards.length}</span>
                </div>
                <span className="text-[11px] text-text-tertiary font-semibold">${colTotal.toLocaleString()}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 min-h-[120px]">
                {colCards.map(card => {
                  const hs = HEALTH_STYLES[card.health];
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => {
                        dragCard.current = card.id;
                        e.dataTransfer.setData('cardId', card.id);
                      }}
                      className="card card-glow p-4 cursor-grab active:cursor-grabbing active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text-primary truncate">{card.name}</p>
                          <p className="text-[12px] text-text-tertiary mt-0.5">{card.projectType}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${hs.bg}`}>
                          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: hs.color }} />
                          <span className={`text-[10px] font-semibold ${hs.text}`}>{hs.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[15px] font-bold text-accent">${card.value.toLocaleString()}</span>
                        {card.followUp && (
                          <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {card.followUp}
                          </span>
                        )}
                      </div>

                      {(card.notes || editingNotes === card.id) && (
                        <div className="mb-3 p-2.5 bg-surface-2 rounded-lg border border-border-subtle">
                          <label className="text-[10px] text-text-tertiary font-semibold uppercase tracking-[0.06em] block mb-1">Why they need attention</label>
                          <textarea
                            value={card.notes}
                            onChange={(e) => updateCard(card.id, { notes: e.target.value })}
                            onFocus={() => setEditingNotes(card.id)}
                            onBlur={() => setEditingNotes(null)}
                            rows={2}
                            className="w-full bg-transparent text-[12px] text-text-secondary resize-none focus:outline-none leading-relaxed"
                            placeholder="Add notes..."
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) moveCard(card.id, e.target.value); }}
                          className="bg-surface-2 text-[11px] text-text-tertiary rounded-md px-2 py-1 border border-border-subtle focus:outline-none"
                        >
                          <option value="">Move...</option>
                          {data.pipeline.columns.filter(c => c !== col).map(c => (
                            <option key={c} value={c}>{COLUMN_LABELS[c]}</option>
                          ))}
                        </select>
                        {!card.notes && editingNotes !== card.id && (
                          <button onClick={() => setEditingNotes(card.id)} className="text-[11px] text-text-tertiary hover:text-text-secondary px-2 py-1 rounded-md hover:bg-surface-2 transition">
                            + Note
                          </button>
                        )}
                        <div className="flex-1" />
                        <button onClick={() => markLost(card.id)} className="text-[11px] text-text-tertiary hover:text-danger px-2 py-1 rounded-md hover:bg-danger-soft transition">Lost</button>
                        <button onClick={() => deleteCard(card.id)} className="text-text-tertiary hover:text-danger p-1 rounded-md hover:bg-danger-soft transition">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
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

      {/* Lost Deals */}
      {lostCards.length > 0 && (
        <div className="px-5 max-w-lg mx-auto mt-6">
          <button
            onClick={() => setShowLost(!showLost)}
            className="flex items-center gap-2 text-[12px] font-semibold text-text-tertiary mb-3 uppercase tracking-[0.06em]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: showLost ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Lost Deals ({lostCards.length})
          </button>
          {showLost && (
            <div className="space-y-2">
              {lostCards.map(card => (
                <div key={card.id} className="p-3.5 bg-surface rounded-xl border border-danger/10 opacity-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium">{card.name}</span>
                    <span className="text-[12px] text-danger font-semibold">${card.value.toLocaleString()}</span>
                  </div>
                  {card.lossReason && <p className="text-[11px] text-text-tertiary mt-1">Reason: {card.lossReason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
