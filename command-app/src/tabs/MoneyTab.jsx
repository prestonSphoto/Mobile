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

  const monthlyRevenue = (data.payments || []).filter(p => p.date.startsWith(currentMonthKey)).reduce((s, p) => s + p.amount, 0);
  const progressPct = Math.min((monthlyRevenue / data.monthlyGoal) * 100, 100);
  const remaining = Math.max(data.monthlyGoal - monthlyRevenue, 0);

  const overdueInvoices = data.invoices.filter(i => i.status !== 'paid' && i.dueDate < today);
  const sentInvoices = data.invoices.filter(i => i.status === 'sent' && i.dueDate >= today);
  const outstandingInvoices = data.invoices.filter(i => i.status === 'outstanding');
  const paidInvoices = data.invoices.filter(i => i.status === 'paid');

  const logPayment = () => {
    if (!newPayment.client.trim() || !newPayment.amount) return;
    setData(d => ({ ...d, payments: [...(d.payments || []), { id: Date.now().toString(), client: newPayment.client.trim(), amount: parseFloat(newPayment.amount), date: newPayment.date }] }));
    setNewPayment({ client: '', amount: '', date: todayStr() });
    setShowLogPayment(false);
  };

  const addInvoice = () => {
    if (!newInvoice.client.trim() || !newInvoice.amount) return;
    setData(d => ({ ...d, invoices: [...d.invoices, { id: Date.now().toString(), client: newInvoice.client.trim(), amount: parseFloat(newInvoice.amount), dueDate: newInvoice.dueDate, status: 'sent' }] }));
    setNewInvoice({ client: '', amount: '', dueDate: '' });
    setShowAddInvoice(false);
  };

  const markPaid = (id) => setData(d => ({ ...d, invoices: d.invoices.map(i => i.id === id ? { ...i, status: 'paid' } : i) }));
  const deleteInvoice = (id) => setData(d => ({ ...d, invoices: d.invoices.filter(i => i.id !== id) }));

  const saveGoal = () => {
    const val = parseInt(goalInput);
    if (val > 0) setData(d => ({ ...d, monthlyGoal: val }));
    setEditingGoal(false);
  };

  // History
  const allMonths = {};
  (data.payments || []).forEach(p => { const m = p.date.slice(0, 7); allMonths[m] = (allMonths[m] || 0) + p.amount; });
  const sortedMonths = Object.entries(allMonths).filter(([m]) => m !== currentMonthKey).sort((a, b) => b[0].localeCompare(a[0]));
  const maxM = Math.max(...Object.values(allMonths), data.monthlyGoal);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Money</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Revenue card */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-text-secondary font-medium">{currentMonth}</p>
            {editingGoal ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-tertiary">Goal: $</span>
                <input autoFocus value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                  onBlur={saveGoal} onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  className="w-20 bg-surface-2 border border-border rounded px-2 py-0.5 text-xs text-text-primary" />
              </div>
            ) : (
              <button onClick={() => setEditingGoal(true)} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                Goal: ${data.monthlyGoal.toLocaleString()}
              </button>
            )}
          </div>
          <p className="text-3xl font-semibold tracking-tight mb-1">${monthlyRevenue.toLocaleString()}</p>
          <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? 'bg-success' : 'bg-accent'}`} style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{Math.round(progressPct)}% of goal</span>
            <span>${remaining.toLocaleString()} to go</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button onClick={() => { setShowLogPayment(!showLogPayment); setShowAddInvoice(false); }}
              className="flex-1 py-3 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">Log Payment</button>
            <button onClick={() => { setShowAddInvoice(!showAddInvoice); setShowLogPayment(false); }}
              className="flex-1 py-3 bg-surface text-text-primary text-sm font-medium rounded-lg border border-border hover:bg-surface-2 transition-colors">+ Invoice</button>
          </div>

          {showLogPayment && (
            <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <input autoFocus value={newPayment.client} onChange={(e) => setNewPayment(n => ({ ...n, client: e.target.value }))} placeholder="Client"
                className="w-full bg-transparent text-sm font-medium text-text-primary placeholder-text-tertiary focus:outline-none" />
              <div className="flex gap-2">
                <input type="number" value={newPayment.amount} onChange={(e) => setNewPayment(n => ({ ...n, amount: e.target.value }))} placeholder="Amount"
                  className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary" />
                <input type="date" value={newPayment.date} onChange={(e) => setNewPayment(n => ({ ...n, date: e.target.value }))}
                  className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowLogPayment(false)} className="px-3 py-1.5 text-sm text-text-tertiary">Cancel</button>
                <button onClick={logPayment} className="px-4 py-1.5 bg-success text-white text-sm font-medium rounded-lg">Log</button>
              </div>
            </div>
          )}

          {showAddInvoice && (
            <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <input autoFocus value={newInvoice.client} onChange={(e) => setNewInvoice(n => ({ ...n, client: e.target.value }))} placeholder="Client"
                className="w-full bg-transparent text-sm font-medium text-text-primary placeholder-text-tertiary focus:outline-none" />
              <div className="flex gap-2">
                <input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice(n => ({ ...n, amount: e.target.value }))} placeholder="Amount"
                  className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary" />
                <input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice(n => ({ ...n, dueDate: e.target.value }))}
                  className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddInvoice(false)} className="px-3 py-1.5 text-sm text-text-tertiary">Cancel</button>
                <button onClick={addInvoice} className="px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg">Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overdue */}
        {overdueInvoices.length > 0 && (
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <h2 className="text-sm font-medium text-danger">Overdue ({overdueInvoices.length})</h2>
            </div>
            <div className="space-y-1">
              {overdueInvoices.map(inv => <InvoiceRow key={inv.id} inv={inv} overdue onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}
            </div>
          </div>
        )}

        {sentInvoices.length > 0 && (
          <div>
            <h2 className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-3">Sent</h2>
            <div className="space-y-1">
              {sentInvoices.map(inv => <InvoiceRow key={inv.id} inv={inv} onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}
            </div>
          </div>
        )}

        {outstandingInvoices.length > 0 && (
          <div>
            <h2 className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-3">Outstanding</h2>
            <div className="space-y-1">
              {outstandingInvoices.map(inv => <InvoiceRow key={inv.id} inv={inv} onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}
            </div>
          </div>
        )}
      </div>

      {/* Recent payments */}
      {(data.payments || []).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-3">Recent Payments</h2>
          <div className="space-y-1">
            {[...(data.payments || [])].reverse().slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-surface transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>{p.client}</span>
                  <span className="text-text-tertiary text-xs">{p.date}</span>
                </div>
                <span className="font-medium text-success">+${p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {sortedMonths.length > 0 && (
        <div>
          <h2 className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-3">Monthly History</h2>
          <div className="space-y-2 max-w-lg">
            {sortedMonths.map(([month, total]) => {
              const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-text-tertiary w-16 font-mono flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-accent/50 rounded-full" style={{ width: `${(total / maxM) * 100}%` }} />
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

function InvoiceRow({ inv, overdue, onPaid, onDelete }) {
  return (
    <div className={`group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface transition-colors ${overdue ? 'bg-danger/[0.03]' : ''}`}>
      <div>
        <p className={`text-sm font-medium ${overdue ? 'text-danger' : ''}`}>{inv.client}</p>
        <p className="text-xs text-text-tertiary">Due {inv.dueDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${overdue ? 'text-danger' : ''}`}>${inv.amount.toLocaleString()}</span>
        <button onClick={onPaid} className="text-xs text-success font-medium px-2 py-1 rounded hover:bg-success-soft transition-colors">Paid</button>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}
