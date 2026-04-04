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
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
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
  const maxMonthly = Math.max(...Object.values(allMonths), data.monthlyGoal);

  return (
    <div className="px-5 pt-14 pb-8 max-w-lg mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Money</h1>

      {/* Revenue Card */}
      <div className="card card-glow p-5 mb-5 relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10" />

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] text-text-secondary font-medium">{currentMonth} {currentYear}</p>
            {editingGoal ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-tertiary font-medium">Goal $</span>
                <input
                  autoFocus
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onBlur={saveGoal}
                  onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  className="w-20 bg-surface-2 border border-border rounded-lg px-2 py-1 text-[12px] text-text-primary"
                />
              </div>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="text-[11px] text-text-tertiary hover:text-text-secondary font-medium px-2 py-1 rounded-md hover:bg-surface-2 transition"
              >
                Goal: ${data.monthlyGoal.toLocaleString()}
              </button>
            )}
          </div>
          <p className="text-[36px] font-bold tracking-tight mb-4 leading-none">${monthlyRevenue.toLocaleString()}</p>

          {/* Premium progress bar */}
          <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative"
              style={{
                width: `${progressPct}%`,
                background: progressPct >= 100
                  ? 'linear-gradient(90deg, #30D158, #34C759)'
                  : 'linear-gradient(90deg, #0044CC, #0066FF, #3388FF)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
          </div>
          <p className="text-[11px] text-text-tertiary font-medium mt-2">{Math.round(progressPct)}% of monthly goal</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setShowLogPayment(true); setShowAddInvoice(false); }}
          className="flex-1 py-3 bg-accent text-white text-[13px] font-semibold rounded-2xl shadow-[0_2px_12px_rgba(0,102,255,0.3)] hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log Payment
        </button>
        <button
          onClick={() => { setShowAddInvoice(true); setShowLogPayment(false); }}
          className="flex-1 py-3 bg-surface text-text-primary text-[13px] font-semibold rounded-2xl border border-border hover:bg-surface-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Invoice
        </button>
      </div>

      {/* Log Payment Form */}
      {showLogPayment && (
        <div className="card card-glow p-4 space-y-3 mb-5">
          <input
            autoFocus
            value={newPayment.client}
            onChange={(e) => setNewPayment(n => ({ ...n, client: e.target.value }))}
            placeholder="Client name"
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none font-medium"
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[12px]">$</span>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(n => ({ ...n, amount: e.target.value }))}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-lg pl-6 pr-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary"
              />
            </div>
            <input
              type="date"
              value={newPayment.date}
              onChange={(e) => setNewPayment(n => ({ ...n, date: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowLogPayment(false)} className="flex-1 py-2 text-[13px] text-text-tertiary font-medium rounded-lg hover:bg-surface-2 transition">Cancel</button>
            <button onClick={logPayment} className="flex-1 py-2 bg-success text-white text-[13px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(48,209,88,0.25)]">Log Payment</button>
          </div>
        </div>
      )}

      {/* Add Invoice Form */}
      {showAddInvoice && (
        <div className="card card-glow p-4 space-y-3 mb-5">
          <input
            autoFocus
            value={newInvoice.client}
            onChange={(e) => setNewInvoice(n => ({ ...n, client: e.target.value }))}
            placeholder="Client name"
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none font-medium"
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[12px]">$</span>
              <input
                type="number"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice(n => ({ ...n, amount: e.target.value }))}
                placeholder="0"
                className="w-full bg-surface-2 border border-border rounded-lg pl-6 pr-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary"
              />
            </div>
            <input
              type="date"
              value={newInvoice.dueDate}
              onChange={(e) => setNewInvoice(n => ({ ...n, dueDate: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAddInvoice(false)} className="flex-1 py-2 text-[13px] text-text-tertiary font-medium rounded-lg hover:bg-surface-2 transition">Cancel</button>
            <button onClick={addInvoice} className="flex-1 py-2 bg-accent text-white text-[13px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,102,255,0.3)]">Send Invoice</button>
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueInvoices.length > 0 && (
        <div className="p-4 bg-danger/8 border border-danger/15 rounded-2xl mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-danger/15 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-[13px] font-semibold text-danger">
              {overdueInvoices.length} Overdue
            </p>
          </div>
          <div className="space-y-2">
            {overdueInvoices.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} overdue onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Sent Invoices */}
      {sentInvoices.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-3">Sent</p>
          <div className="space-y-2">
            {sentInvoices.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Invoices */}
      {outstandingInvoices.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-3">Outstanding</p>
          <div className="space-y-2">
            {outstandingInvoices.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} onPaid={() => markInvoicePaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Monthly History */}
      {sortedMonths.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-4">Monthly History</p>
          <div className="space-y-3">
            {sortedMonths.map(([month, total]) => {
              const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const pct = (total / maxMonthly) * 100;
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-[12px] text-text-tertiary font-medium w-16 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-3 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, rgba(0,102,255,0.5), rgba(0,102,255,0.8))',
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold w-20 text-right">${total.toLocaleString()}</span>
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
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
      overdue ? 'bg-danger/5 border-danger/15' : 'bg-surface border-border'
    }`}>
      <div>
        <p className={`text-[13px] font-semibold ${overdue ? 'text-danger' : 'text-text-primary'}`}>{invoice.client}</p>
        <p className="text-[11px] text-text-tertiary mt-0.5">Due {invoice.dueDate}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`text-[14px] font-bold ${overdue ? 'text-danger' : 'text-text-primary'}`}>${invoice.amount.toLocaleString()}</span>
        <button
          onClick={onPaid}
          className="text-[11px] text-success font-semibold px-2.5 py-1 border border-success/20 rounded-lg hover:bg-success-soft transition"
        >
          Paid
        </button>
        <button onClick={onDelete} className="text-text-tertiary hover:text-danger p-1 rounded-lg hover:bg-danger-soft transition">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
