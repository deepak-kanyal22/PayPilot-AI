import { useState, useMemo } from 'react'
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  Bot,
  X,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import './App.css'

// ─── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_INVOICES = [
  { id: 'INV-001', client: 'Acme Corp',        amount: 12500, status: 'paid',      due: '2024-01-15', issued: '2024-01-01', description: 'Web development services' },
  { id: 'INV-002', client: 'Globex Inc',        amount:  8750, status: 'pending',   due: '2024-02-01', issued: '2024-01-18', description: 'UI/UX design consultation' },
  { id: 'INV-003', client: 'Initech Ltd',       amount: 15200, status: 'overdue',   due: '2024-01-10', issued: '2023-12-27', description: 'Software integration project' },
  { id: 'INV-004', client: 'Umbrella Co',       amount:  6300, status: 'paid',      due: '2024-01-20', issued: '2024-01-06', description: 'Mobile app development' },
  { id: 'INV-005', client: 'Stark Industries',  amount: 22100, status: 'pending',   due: '2024-02-10', issued: '2024-01-27', description: 'AI system consulting' },
  { id: 'INV-006', client: 'Wayne Enterprises', amount:  9800, status: 'paid',      due: '2024-01-25', issued: '2024-01-11', description: 'Security audit & review' },
  { id: 'INV-007', client: 'Dunder Mifflin',    amount:  3400, status: 'overdue',   due: '2024-01-05', issued: '2023-12-22', description: 'Paper management system' },
  { id: 'INV-008', client: 'Pied Piper LLC',    amount: 18600, status: 'pending',   due: '2024-02-15', issued: '2024-02-01', description: 'Data compression platform' },
]

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  pending: { label: 'Pending', icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  overdue: { label: 'Overdue', icon: AlertCircle,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  active: true  },
  { icon: FileText,        label: 'Invoices',   active: false },
  { icon: DollarSign,      label: 'Payments',   active: false },
  { icon: Users,           label: 'Clients',    active: false },
  { icon: Settings,        label: 'Settings',   active: false },
]

// ─── AI assistant response generator (demo — no real AI/backend) ─────────────
function generateAIResponse(question, invoices) {
  const q = question.toLowerCase()
  const total      = invoices.reduce((s, i) => s + i.amount, 0)
  const paid       = invoices.filter(i => i.status === 'paid')
  const pending    = invoices.filter(i => i.status === 'pending')
  const overdue    = invoices.filter(i => i.status === 'overdue')
  const paidAmt    = paid.reduce((s, i) => s + i.amount, 0)
  const pendingAmt = pending.reduce((s, i) => s + i.amount, 0)
  const overdueAmt = overdue.reduce((s, i) => s + i.amount, 0)
  const fmt = (n) => `$${n.toLocaleString()}`

  if (q.includes('total') || q.includes('invoiced'))
    return `Total invoiced across all ${invoices.length} invoices is **${fmt(total)}**. That covers paid, pending, and overdue amounts combined.`
  if (q.includes('paid') && !q.includes('unpaid'))
    return `You have ${paid.length} paid invoice${paid.length !== 1 ? 's' : ''} totalling **${fmt(paidAmt)}**. Clients: ${paid.map(i => i.client).join(', ')}.`
  if (q.includes('pending') || q.includes('outstanding'))
    return `There are ${pending.length} pending invoice${pending.length !== 1 ? 's' : ''} worth **${fmt(pendingAmt)}** awaiting payment.`
  if (q.includes('overdue'))
    return `⚠️ You have ${overdue.length} overdue invoice${overdue.length !== 1 ? 's' : ''} totalling **${fmt(overdueAmt)}**. Follow up with: ${overdue.map(i => i.client).join(', ')}.`
  if (q.includes('largest') || q.includes('biggest') || q.includes('highest'))
    { const top = [...invoices].sort((a,b) => b.amount - a.amount)[0]; return `Your largest invoice is **${top.id}** for ${top.client} — **${fmt(top.amount)}** (${top.status}).` }
  if (q.includes('client') || q.includes('who'))
    return `You have ${invoices.length} invoices across ${[...new Set(invoices.map(i => i.client))].length} clients. Top client by value: **${[...invoices].sort((a,b) => b.amount - a.amount)[0].client}**.`
  if (q.includes('summary') || q.includes('overview'))
    return `📊 **Financial Summary:**\n• Total invoiced: ${fmt(total)}\n• Payments received: ${fmt(paidAmt)} (${paid.length} invoices)\n• Outstanding: ${fmt(pendingAmt)} (${pending.length} invoices)\n• Overdue: ${fmt(overdueAmt)} (${overdue.length} invoices)`
  if (q.includes('collect') || q.includes('receive') || q.includes('revenue'))
    return `Based on sample data, you've collected **${fmt(paidAmt)}** so far. There's an additional **${fmt(pendingAmt + overdueAmt)}** still outstanding.`
  return `I can help you analyse your invoices! Try asking about totals, paid/pending/overdue invoices, your largest invoice, or a financial summary. (Demo mode — using sample data only)`
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, trendLabel, color }) {
  const up = trend >= 0
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__icon" style={{ background: `${color}20`, color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__trend ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{trendLabel}</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // Invoice state
  const [invoices, setInvoices]           = useState(SAMPLE_INVOICES)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [page, setPage]                   = useState(1)
  const perPage = 5

  // Create invoice modal
  const [showCreate, setShowCreate]       = useState(false)
  const [newInvoice, setNewInvoice]       = useState({ client: '', amount: '', description: '', due: '' })
  const [createError, setCreateError]     = useState('')

  // AI assistant
  const [showAI, setShowAI]               = useState(false)
  const [aiMessages, setAiMessages]       = useState([
    { from: 'bot', text: 'Hi! I\'m PayPilot AI — your financial assistant. Ask me anything about your invoices! (Sample data only)' }
  ])
  const [aiInput, setAiInput]             = useState('')
  const [aiLoading, setAiLoading]         = useState(false)

  // ─── Derived stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = invoices.reduce((s, i) => s + i.amount, 0)
    const paidAmt    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const pendingAmt = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
    const overdueAmt = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
    const fmt = (n) => `$${n.toLocaleString()}`
    return [
      { icon: DollarSign,  label: 'Total Invoiced',       value: fmt(total),      trend:  12, trendLabel: '+12% this month', color: '#6366f1' },
      { icon: CheckCircle, label: 'Payments Received',    value: fmt(paidAmt),    trend:   8, trendLabel: '+8% this month',  color: '#10b981' },
      { icon: Clock,       label: 'Outstanding',          value: fmt(pendingAmt), trend:  -3, trendLabel: '-3% this month',  color: '#f59e0b' },
      { icon: AlertCircle, label: 'Overdue',              value: fmt(overdueAmt), trend:   5, trendLabel: '+5% this month',  color: '#ef4444' },
    ]
  }, [invoices])

  // ─── Filtered + paginated invoices ───────────────────────────────────────
  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.client.toLowerCase().includes(search.toLowerCase()) ||
                          inv.id.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, search, statusFilter])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  // Reset page on filter change
  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleFilter = (v) => { setStatusFilter(v); setPage(1) }

  // ─── Create invoice ───────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!newInvoice.client.trim()) return setCreateError('Client name is required.')
    const amt = parseFloat(newInvoice.amount)
    if (!newInvoice.amount || isNaN(amt) || amt <= 0) return setCreateError('Enter a valid amount.')
    if (!newInvoice.due) return setCreateError('Due date is required.')
    const id = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    setInvoices(prev => [{ id, status: 'pending', issued: new Date().toISOString().slice(0,10), ...newInvoice, amount: amt }, ...prev])
    setNewInvoice({ client: '', amount: '', description: '', due: '' })
    setCreateError('')
    setShowCreate(false)
  }

  // ─── Delete invoice ───────────────────────────────────────────────────────
  const handleDelete = (id) => setInvoices(prev => prev.filter(i => i.id !== id))

  // ─── AI chat ──────────────────────────────────────────────────────────────
  const handleAISend = () => {
    if (!aiInput.trim()) return
    const userMsg = aiInput.trim()
    setAiMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setAiInput('')
    setAiLoading(true)
    setTimeout(() => {
      const reply = generateAIResponse(userMsg, invoices)
      setAiMessages(prev => [...prev, { from: 'bot', text: reply }])
      setAiLoading(false)
    }, 700)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <DollarSign size={22} />
          </div>
          <span className="sidebar__name">PayPilot <span className="sidebar__ai">AI</span></span>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button key={label} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__avatar">DK</div>
          <div>
            <div className="sidebar__user">Deepak K.</div>
            <div className="sidebar__role">Admin</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        {/* Top bar */}
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Dashboard</h1>
            <p className="topbar__sub">Welcome back, Deepak! Here's your financial overview.</p>
          </div>
          <div className="topbar__actions">
            <button className="btn btn--ghost" onClick={() => setShowAI(true)}>
              <Bot size={16} /> Ask PayPilot
            </button>
            <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Invoice
            </button>
            <button className="icon-btn" aria-label="Notifications"><Bell size={18} /></button>
          </div>
        </header>

        {/* Stat cards */}
        <section className="stats-grid">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </section>

        {/* Invoice table */}
        <section className="invoice-section">
          <div className="invoice-section__header">
            <h2 className="invoice-section__title">Recent Invoices <span className="badge">{filtered.length}</span></h2>
            <div className="invoice-section__controls">
              <div className="search-box">
                <Search size={15} className="search-box__icon" />
                <input
                  className="search-box__input"
                  placeholder="Search invoices or clients…"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
              <div className="filter-select-wrapper">
                <Filter size={14} />
                <select className="filter-select" value={statusFilter} onChange={e => handleFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <button className="btn btn--ghost btn--sm">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty">No invoices found.</td></tr>
                ) : paginated.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="inv-id">{inv.id}</span></td>
                    <td><span className="inv-client">{inv.client}</span></td>
                    <td><span className="inv-desc">{inv.description}</span></td>
                    <td><span className="inv-amount">${inv.amount.toLocaleString()}</span></td>
                    <td><span className="inv-due">{inv.due}</span></td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="row-btn" title="View"><Eye size={14} /></button>
                        <button className="row-btn" title="Edit"><Edit2 size={14} /></button>
                        <button className="row-btn row-btn--danger" title="Delete" onClick={() => handleDelete(inv.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination__info">
              Showing {Math.min((safePage-1)*perPage+1, filtered.length)}–{Math.min(safePage*perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination__controls">
              <button className="page-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${n === safePage ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Create Invoice Modal ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Create Invoice</h3>
              <button className="modal__close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="modal__body">
              {createError && <div className="form-error">{createError}</div>}
              <label className="form-label">Client Name *
                <input className="form-input" value={newInvoice.client} onChange={e => setNewInvoice(p => ({...p, client: e.target.value}))} placeholder="e.g. Acme Corp" />
              </label>
              <label className="form-label">Amount (USD) *
                <input className="form-input" type="number" min="0" value={newInvoice.amount} onChange={e => setNewInvoice(p => ({...p, amount: e.target.value}))} placeholder="e.g. 5000" />
              </label>
              <label className="form-label">Description
                <input className="form-input" value={newInvoice.description} onChange={e => setNewInvoice(p => ({...p, description: e.target.value}))} placeholder="e.g. Web development services" />
              </label>
              <label className="form-label">Due Date *
                <input className="form-input" type="date" value={newInvoice.due} onChange={e => setNewInvoice(p => ({...p, due: e.target.value}))} />
              </label>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleCreate}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Assistant Panel ── */}
      {showAI && (
        <div className="ai-panel">
          <div className="ai-panel__header">
            <div className="ai-panel__title">
              <Bot size={18} />
              <span>PayPilot AI</span>
              <span className="ai-demo-badge">Demo</span>
            </div>
            <button className="modal__close" onClick={() => setShowAI(false)}><X size={16} /></button>
          </div>
          <div className="ai-panel__messages">
            {aiMessages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.from}`}>
                {m.from === 'bot' && <div className="ai-msg__avatar"><Bot size={14} /></div>}
                <div className="ai-msg__bubble" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              </div>
            ))}
            {aiLoading && (
              <div className="ai-msg ai-msg--bot">
                <div className="ai-msg__avatar"><Bot size={14} /></div>
                <div className="ai-msg__bubble ai-typing"><span/><span/><span/></div>
              </div>
            )}
          </div>
          <div className="ai-panel__input">
            <input
              className="ai-input"
              placeholder="Ask about your invoices…"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAISend()}
            />
            <button className="btn btn--primary btn--sm" onClick={handleAISend} disabled={aiLoading || !aiInput.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
