import { useState, useRef } from 'react';

const COLUMN_LABELS = {
  prospecting: 'Prospecting',
  proposal: 'Proposal Sent',
  active: 'Active Client',
  closed: 'Closed',
};

const HEALTH_COLORS = { green: '#30D158', yellow: '#FFD60A', red: '#FF3B30' };

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
    <div className="p-4 max-w-full">
      <div className="flex items-center justify-between mb-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold tracking-tight">Pipeline</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1 bg-accent text-white text-xs font-medium rounded"
        >
          + Add
        </button>
      </div>

      {showAdd && (
        <div className="p-3 bg-surface border border-border rounded space-y-2 mb-4 max-w-lg mx-auto">
          <input
            autoFocus
            value={newCard.name}
            onChange={(e) => setNewCard(n => ({ ...n, name: e.target.value }))}
            placeholder="Client name"
            className="w-full bg-transparent text-sm text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <input
            value={newCard.projectType}
            onChange={(e) => setNewCard(n => ({ ...n, projectType: e.target.value }))}
            placeholder="Project type"
            className="w-full bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white placeholder-text-secondary/50"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newCard.value}
              onChange={(e) => setNewCard(n => ({ ...n, value: e.target.value }))}
              placeholder="Value $"
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white placeholder-text-secondary/50"
            />
            <select
              value={newCard.health}
              onChange={(e) => setNewCard(n => ({ ...n, health: e.target.value }))}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
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
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            />
            <select
              value={newCard.column}
              onChange={(e) => setNewCard(n => ({ ...n, column: e.target.value }))}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            >
              {Object.entries(COLUMN_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 text-sm text-text-secondary">Cancel</button>
            <button onClick={addCard} className="flex-1 py-1.5 bg-accent text-white text-sm font-medium rounded">Add</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
        {data.pipeline.columns.map(col => {
          const colCards = activeCards.filter(c => c.column === col);
          return (
            <div
              key={col}
              className="min-w-[280px] w-[280px] snap-center flex-shrink-0 bg-surface rounded border border-border"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData('cardId');
                if (cardId) moveCard(cardId, col);
              }}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{COLUMN_LABELS[col]}</span>
                  <span className="text-xs text-text-secondary">{colCards.length}</span>
                </div>
                {col === 'closed' && (
                  <span className="text-xs text-success font-medium">${closedTotal.toLocaleString()}</span>
                )}
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {colCards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => {
                      dragCard.current = card.id;
                      e.dataTransfer.setData('cardId', card.id);
                    }}
                    className="p-3 bg-bg border border-border rounded cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{card.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: HEALTH_COLORS[card.health] }}
                          title={card.health}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">{card.projectType}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-medium text-accent">${card.value.toLocaleString()}</span>
                      {card.followUp && (
                        <span className="text-[10px] text-text-secondary">Follow-up: {card.followUp}</span>
                      )}
                    </div>
                    {(card.notes || editingNotes === card.id) && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider">Why they need attention</label>
                        <textarea
                          value={card.notes}
                          onChange={(e) => updateCard(card.id, { notes: e.target.value })}
                          onFocus={() => setEditingNotes(card.id)}
                          onBlur={() => setEditingNotes(null)}
                          rows={2}
                          className="w-full mt-0.5 bg-transparent text-xs text-white resize-none focus:outline-none"
                          placeholder="Add notes..."
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                      {col !== 'closed' && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) moveCard(card.id, e.target.value);
                          }}
                          className="bg-transparent text-[10px] text-text-secondary focus:outline-none"
                        >
                          <option value="">Move to...</option>
                          {data.pipeline.columns.filter(c => c !== col).map(c => (
                            <option key={c} value={c}>{COLUMN_LABELS[c]}</option>
                          ))}
                        </select>
                      )}
                      {!card.notes && editingNotes !== card.id && (
                        <button
                          onClick={() => setEditingNotes(card.id)}
                          className="text-[10px] text-text-secondary hover:text-white"
                        >
                          + Note
                        </button>
                      )}
                      <div className="flex-1" />
                      <button onClick={() => markLost(card.id)} className="text-[10px] text-text-secondary hover:text-danger">Lost</button>
                      <button onClick={() => deleteCard(card.id)} className="text-[10px] text-text-secondary hover:text-danger ml-1">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {lostCards.length > 0 && (
        <div className="max-w-lg mx-auto mt-4">
          <button
            onClick={() => setShowLost(!showLost)}
            className="flex items-center gap-2 text-sm text-text-secondary mb-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showLost ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Lost Deals ({lostCards.length})
          </button>
          {showLost && (
            <div className="space-y-2">
              {lostCards.map(card => (
                <div key={card.id} className="p-3 bg-surface border border-danger/20 rounded opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{card.name}</span>
                    <span className="text-xs text-danger">${card.value.toLocaleString()}</span>
                  </div>
                  {card.lossReason && <p className="text-xs text-text-secondary mt-1">Reason: {card.lossReason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
