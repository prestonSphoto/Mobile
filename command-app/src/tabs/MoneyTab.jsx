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

  const logPayment = () => {
    if (!newPayment.client.trim() || !newPayment.amount) return;
    setData(d => ({ ...d, payments: [...(d.payments || []), { id: Date.now().toString(), client: newPayment.client.trim(), amount: parseFloat(newPayment.amount), date: newPayment.date }] }));
    setNewPayment({ client: '', amount: '', date: todayStr() }); setShowLogPayment(false);
  };
  const addInvoice = () => {
    if (!newInvoice.client.trim() || !newInvoice.amount) return;
    setData(d => ({ ...d, invoices: [...d.invoices, { id: Date.now().toString(), client: newInvoice.client.trim(), amount: parseFloat(newInvoice.amount), dueDate: newInvoice.dueDate, status: 'sent' }] }));
    setNewInvoice({ client: '', amount: '', dueDate: '' }); setShowAddInvoice(false);
  };
  const markPaid = (id) => setData(d => ({ ...d, invoices: d.invoices.map(i => i.id === id ? { ...i, status: 'paid' } : i) }));
  const deleteInvoice = (id) => setData(d => ({ ...d, invoices: d.invoices.filter(i => i.id !== id) }));
  const saveGoal = () => { const v = parseInt(goalInput); if (v > 0) setData(d => ({ ...d, monthlyGoal: v })); setEditingGoal(false); };

  const allMonths = {}; (data.payments || []).forEach(p => { const m = p.date.slice(0, 7); allMonths[m] = (allMonths[m] || 0) + p.amount; });
  const sortedMonths = Object.entries(allMonths).filter(([m]) => m !== currentMonthKey).sort((a, b) => b[0].localeCompare(a[0]));
  const maxM = Math.max(...Object.values(allMonths), data.monthlyGoal);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight">Finances</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowLogPayment(!showLogPayment); setShowAddInvoice(false); }}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Payment
          </button>
          <button onClick={() => { setShowAddInvoice(!showAddInvoice); setShowLogPayment(false); }}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            New Invoice
          </button>
        </div>
      </div>

      {/* Revenue card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary font-medium">{currentMonth} Revenue</p>
            {editingGoal ? (
              <div className="flex items-center gap-1"><span className="text-xs text-text-tertiary">Goal: $</span>
                <input autoFocus value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onBlur={saveGoal} onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  className="w-20 bg-surface-2 border border-border rounded-md px-2 py-1 text-xs" /></div>
            ) : <button onClick={() => setEditingGoal(true)} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">Goal: ${data.monthlyGoal.toLocaleString()}</button>}
          </div>
          <p className="text-[32px] font-semibold tracking-tight mb-4">${monthlyRevenue.toLocaleString()}</p>
          <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? 'bg-success' : 'bg-accent'}`} style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{Math.round(progressPct)}% of monthly goal</span>
            <span>${remaining.toLocaleString()} remaining</span>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Overdue</p>
              <p className={`text-xl font-semibold ${overdueInvoices.length > 0 ? 'text-danger' : 'text-text-primary'}`}>{overdueInvoices.length}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Pending</p>
              <p className="text-xl font-semibold">{sentInvoices.length + outstandingInvoices.length}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Payments</p>
              <p className="text-xl font-semibold">{(data.payments || []).filter(p => p.date.startsWith(currentMonthKey)).length}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Avg. Deal</p>
              <p className="text-xl font-semibold">${(data.payments || []).length > 0 ? Math.round((data.payments || []).reduce((s, p) => s + p.amount, 0) / (data.payments || []).length).toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      {showLogPayment && (
        <div className="card p-5 mb-5">
          <h3 className="text-[15px] font-semibold mb-3">Log Payment</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]"><label className="text-xs text-text-secondary font-medium block mb-1.5">Client</label><input autoFocus value={newPayment.client} onChange={(e) => setNewPayment(n => ({ ...n, client: e.target.value }))} placeholder="Client name" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div className="w-32"><label className="text-xs text-text-secondary font-medium block mb-1.5">Amount</label><input type="number" value={newPayment.amount} onChange={(e) => setNewPayment(n => ({ ...n, amount: e.target.value }))} placeholder="$0" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div><label className="text-xs text-text-secondary font-medium block mb-1.5">Date</label><input type="date" value={newPayment.date} onChange={(e) => setNewPayment(n => ({ ...n, date: e.target.value }))} className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><button onClick={() => setShowLogPayment(false)} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-2">Cancel</button><button onClick={logPayment} className="px-4 py-2 bg-success text-white text-sm font-medium rounded-lg shadow-sm">Log Payment</button></div>
          </div>
        </div>
      )}
      {showAddInvoice && (
        <div className="card p-5 mb-5">
          <h3 className="text-[15px] font-semibold mb-3">New Invoice</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]"><label className="text-xs text-text-secondary font-medium block mb-1.5">Client</label><input autoFocus value={newInvoice.client} onChange={(e) => setNewInvoice(n => ({ ...n, client: e.target.value }))} placeholder="Client name" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div className="w-32"><label className="text-xs text-text-secondary font-medium block mb-1.5">Amount</label><input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice(n => ({ ...n, amount: e.target.value }))} placeholder="$0" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" /></div>
            <div><label className="text-xs text-text-secondary font-medium block mb-1.5">Due date</label><input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice(n => ({ ...n, dueDate: e.target.value }))} className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><button onClick={() => setShowAddInvoice(false)} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-2">Cancel</button><button onClick={addInvoice} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg shadow-sm">Send Invoice</button></div>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {overdueInvoices.length > 0 && (
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-danger animate-pulse" /><h3 className="text-[15px] font-semibold text-danger">Overdue ({overdueInvoices.length})</h3></div>
            <div className="card overflow-hidden"><table className="w-full"><thead><tr className="bg-danger-soft border-b border-danger/10"><th className="text-left py-2.5 px-4 text-xs font-semibold text-danger uppercase tracking-wider">Client</th><th className="text-left py-2.5 px-4 text-xs font-semibold text-danger uppercase tracking-wider">Due Date</th><th className="text-right py-2.5 px-4 text-xs font-semibold text-danger uppercase tracking-wider">Amount</th><th className="w-24"></th></tr></thead><tbody>
              {overdueInvoices.map(inv => <InvRow key={inv.id} inv={inv} overdue onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}
            </tbody></table></div>
          </div>
        )}

        {sentInvoices.length > 0 && (
          <div>
            <h3 className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-3">Sent</h3>
            <div className="card overflow-hidden"><table className="w-full"><tbody>{sentInvoices.map(inv => <InvRow key={inv.id} inv={inv} onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}</tbody></table></div>
          </div>
        )}

        {outstandingInvoices.length > 0 && (
          <div>
            <h3 className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-3">Outstanding</h3>
            <div className="card overflow-hidden"><table className="w-full"><tbody>{outstandingInvoices.map(inv => <InvRow key={inv.id} inv={inv} onPaid={() => markPaid(inv.id)} onDelete={() => deleteInvoice(inv.id)} />)}</tbody></table></div>
          </div>
        )}
      </div>

      {/* Recent payments */}
      {(data.payments || []).length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-3">Recent Payments</h3>
          <div className="card overflow-hidden"><table className="w-full"><thead><tr className="bg-surface-2/50 border-b border-border"><th className="text-left py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Client</th><th className="text-left py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th><th className="text-right py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th></tr></thead><tbody>
            {[...(data.payments || [])].reverse().slice(0, 10).map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2/30 transition-colors">
                <td className="py-3 px-4 text-sm font-medium">{p.client}</td>
                <td className="py-3 px-4 text-sm text-text-secondary">{p.date}</td>
                <td className="py-3 px-4 text-sm font-semibold text-success text-right">+${p.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}

      {sortedMonths.length > 0 && (
        <div>
          <h3 className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-3">Monthly History</h3>
          <div className="card p-5"><div className="space-y-3 max-w-xl">
            {sortedMonths.map(([month, total]) => (
              <div key={month} className="flex items-center gap-4">
                <span className="text-xs text-text-tertiary w-16 flex-shrink-0">{new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <div className="flex-1 h-2.5 bg-surface-2 rounded-full overflow-hidden"><div className="h-full bg-accent/40 rounded-full" style={{ width: `${(total / maxM) * 100}%` }} /></div>
                <span className="text-xs font-semibold w-20 text-right">${total.toLocaleString()}</span>
              </div>
            ))}
          </div></div>
        </div>
      )}
    </div>
  );
}

function InvRow({ inv, overdue, onPaid, onDelete }) {
  return (
    <tr className={`group border-b border-border last:border-0 hover:bg-surface-2/30 transition-colors ${overdue ? 'bg-danger-soft/50' : ''}`}>
      <td className={`py-3 px-4 text-sm font-medium ${overdue ? 'text-danger' : ''}`}>{inv.client}</td>
      <td className="py-3 px-4 text-sm text-text-secondary">{inv.dueDate}</td>
      <td className={`py-3 px-4 text-sm font-semibold text-right ${overdue ? 'text-danger' : ''}`}>${inv.amount.toLocaleString()}</td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onPaid} className="text-xs text-success font-semibold px-2.5 py-1 rounded-md hover:bg-success-soft transition-colors border border-success/20">Mark Paid</button>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 rounded-md hover:bg-danger-soft transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
