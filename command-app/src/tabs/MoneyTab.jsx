import { useState } from 'react';
import { todayStr } from '../hooks/useStore';

export default function MoneyTab({ data, setData }) {
  const [showLogPayment, setShowLogPayment] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [newPayment, setNewPayment] = useState({ client: '', amount: '', date: todayStr() });
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', dueDate: '' });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(data.monthlyGoal.toString());

  const today = todayStr();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentMonthKey = today.slice(0, 7);

  const monthlyRevenue = (data.payments || [])
    .filter(p => p.date.startsWith(currentMonthKey))
    .reduce((s, p) => s + p.amount, 0);

  const progressPct = Math.min((monthlyRevenue / data.monthlyGoal) * 100, 100);

  const overdueInvoices = data.invoices.filter(i => i.status !== 'paid' && i.dueDate < today);
  const sentInvoices = data.invoices.filter(i => i.status === 'sent' && i.dueDate >= today);
  const outstandingInvoices = data.invoices.filter(i => i.status === 'outstanding');

  const logPayment = () => {
    if (!newPayment.client.trim() || !newPayment.amount) return;
    const payment = {
      id: Date.now().toString(),
      client: newPayment.client.trim(),
      amount: parseFloat(newPayment.amount),
      date: newPayment.date,
    };
    setData(d => ({ ...d, payments: [...(d.payments || []), payment] }));
    setNewPayment({ client: '', amount: '', date: todayStr() });
    setShowLogPayment(false);
  };

  const addInvoice = () => {
    if (!newInvoice.client.trim() || !newInvoice.amount) return;
    const invoice = {
      id: Date.now().toString(),
      client: newInvoice.client.trim(),
      amount: parseFloat(newInvoice.amount),
      dueDate: newInvoice.dueDate,
      status: 'sent',
    };
    setData(d => ({ ...d, invoices: [...d.invoices, invoice] }));
    setNewInvoice({ client: '', amount: '', dueDate: '' });
    setShowAddInvoice(false);
  };

  const markInvoicePaid = (id) => {
    setData(d => ({
      ...d,
      invoices: d.invoices.map(i => i.id === id ? { ...i, status: 'paid' } : i)
    }));
  };

  const deleteInvoice = (id) => {
    setData(d => ({ ...d, invoices: d.invoices.filter(i => i.id !== id) }));
  };

  const saveGoal = () => {
    const val = parseInt(goalInput);
    if (val > 0) setData(d => ({ ...d, monthlyGoal: val }));
    setEditingGoal(false);
  };

  // Monthly history
  const allMonths = {};
  (data.payments || []).forEach(p => {
    const m = p.date.slice(0, 7);
    allMonths[m] = (allMonths[m] || 0) + p.amount;
  });
  const sortedMonths = Object.entries(allMonths)
    .filter(([m]) => m !== currentMonthKey)
    .sort((a, b) => b[0].localeCompare(a[0]));
  const maxMonthly = Math.max(...Object.values(allMonths), 1);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold tracking-tight mb-4">Money</h1>

      {/* Monthly Revenue */}
      <div className="p-4 bg-surface border border-border rounded mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-text-secondary">{currentMonth}</span>
          {editingGoal ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-secondary">Goal: $</span>
              <input
                autoFocus
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onBlur={saveGoal}
                onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                className="w-20 bg-surface-2 border border-border rounded px-1.5 py-0.5 text-xs text-white"
              />
            </div>
          ) : (
            <button
              onClick={() => setEditingGoal(true)}
              className="text-xs text-text-secondary hover:text-white"
            >
              Goal: ${data.monthlyGoal.toLocaleString()}
            </button>
          )}
        </div>
        <p className="text-2xl font-bold mb-3">${monthlyRevenue.toLocaleString()}</p>
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-1">{Math.round(progressPct)}% of goal</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowLogPayment(true)}
          className="flex-1 py-2 bg-accent text-white text-sm font-medium rounded"
        >
          Log Payment
        </button>
        <button
          onClick={() => setShowAddInvoice(true)}
          className="flex-1 py-2 bg-surface border border-border text-white text-sm font-medium rounded"
        >
          Add Invoice
        </button>
      </div>

      {showLogPayment && (
        <div className="p-3 bg-surface border border-border rounded space-y-2 mb-4">
          <input
            autoFocus
            value={newPayment.client}
            onChange={(e) => setNewPayment(n => ({ ...n, client: e.target.value }))}
            placeholder="Client name"
            className="w-full bg-transparent text-sm text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment(n => ({ ...n, amount: e.target.value }))}
              placeholder="Amount $"
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white placeholder-text-secondary/50"
            />
            <input
              type="date"
              value={newPayment.date}
              onChange={(e) => setNewPayment(n => ({ ...n, date: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowLogPayment(false)} className="flex-1 py-1.5 text-sm text-text-secondary">Cancel</button>
            <button onClick={logPayment} className="flex-1 py-1.5 bg-success text-white text-sm font-medium rounded">Log</button>
          </div>
        </div>
      )}

      {showAddInvoice && (
        <div className="p-3 bg-surface border border-border rounded space-y-2 mb-4">
          <input
            autoFocus
            value={newInvoice.client}
            onChange={(e) => setNewInvoice(n => ({ ...n, client: e.target.value }))}
            placeholder="Client name"
            className="w-full bg-transparent text-sm text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newInvoice.amount}
              onChange={(e) => setNewInvoice(n => ({ ...n, amount: e.target.value }))}
              placeholder="Amount $"
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white placeholder-text-secondary/50"
            />
            <input
              type="date"
              value={newInvoice.dueDate}
              onChange={(e) => setNewInvoice(n => ({ ...n, dueDate: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddInvoice(false)} className="flex-1 py-1.5 text-sm text-text-secondary">Cancel</button>
            <button onClick={addInvoice} className="flex-1 py-1.5 bg-accent text-white text-sm font-medium rounded">Add</button>
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueInvoices.length > 0 && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded mb-4">
          <p className="text-sm font-medium text-danger mb-2">
            {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''}
          </p>
          {overdueInvoices.map(inv => (
            <InvoiceRow key={inv.id} invoice={inv} overdue onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
          ))}
        </div>
      )}

      {/* Sent Invoices */}
      {sentInvoices.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Sent</h3>
          <div className="space-y-2">
            {sentInvoices.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Invoices */}
      {outstandingInvoices.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Outstanding</h3>
          <div className="space-y-2">
            {outstandingInvoices.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Monthly History */}
      {sortedMonths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Monthly History</h3>
          <div className="space-y-2">
            {sortedMonths.map(([month, total]) => {
              const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const pct = (total / maxMonthly) * 100;
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-20">{label}</span>
                  <div className="flex-1 h-4 bg-surface-2 rounded overflow-hidden">
                    <div className="h-full bg-accent/60 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-16 text-right">${total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({ invoice, overdue, onPaid, onDelete }) {
  return (
    <div className={`flex items-center justify-between p-2.5 rounded border ${overdue ? 'bg-danger/5 border-danger/20' : 'bg-surface border-border'}`}>
      <div>
        <span className={`text-sm font-medium ${overdue ? 'text-danger' : 'text-white'}`}>{invoice.client}</span>
        <p className="text-xs text-text-secondary">Due: {invoice.dueDate}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${overdue ? 'text-danger' : ''}`}>${invoice.amount.toLocaleString()}</span>
        <button onClick={onPaid} className="text-[10px] text-success hover:text-success/80 px-1.5 py-0.5 border border-success/30 rounded">Paid</button>
        <button onClick={onDelete} className="text-text-secondary hover:text-danger p-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
