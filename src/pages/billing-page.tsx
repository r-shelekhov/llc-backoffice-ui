import {
	AlertCircle,
	AlertTriangle,
	FileText,
	PoundSterling,
	ScrollText,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BillingStatusTabs } from '@/components/billing/billing-status-tabs'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { FilterBar } from '@/components/filters/filter-bar'
import { SearchInput } from '@/components/filters/search-input'
import { InvoiceTable } from '@/components/invoices/invoice-table'
import { DateRangePicker } from '@/components/shared/date-range-picker'
import { EmptyState } from '@/components/shared/empty-state'
import { StatementTable } from '@/components/statements/statement-table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { INVOICE_STATUS_LABELS, STATEMENT_STATUS_LABELS } from '@/lib/constants'
import { applyInvoiceFilters, applyStatementFilters } from '@/lib/filters'
import { formatCurrency } from '@/lib/format'
import {
	bookings,
	getAllInvoicesWithRelations,
	getAllStatementsWithRelations,
} from '@/lib/mock-data'
import {
	filterInvoicesByPermission,
	filterStatementsByPermission,
	filterVipInvoices,
	filterVipStatements,
} from '@/lib/permissions'
import type {
	InvoiceFilterState,
	InvoiceStatus,
	StatementFilterState,
	StatementStatus,
} from '@/types'

const STATUS_TABS: (InvoiceStatus | null)[] = [
	null,
	'draft',
	'sent',
	'paid',
	'overdue',
	'cancelled',
]

const initialFilters: InvoiceFilterState = {
	search: '',
	statuses: [],
	dateFrom: null,
	dateTo: null,
}

const STATEMENT_STATUS_TABS: (StatementStatus | null)[] = [
	null,
	'open',
	'closed',
	'paid',
	'overdue',
]

const initialStatementFilters: StatementFilterState = {
	search: '',
	statuses: [],
	period: null,
}

export function BillingPage() {
	const { currentUser } = useAuth()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const statusParam = searchParams.get('status')
	const filterParam = searchParams.get('filter')
	const tabParam = searchParams.get('tab')

	const [activeTab, setActiveTab] = useState<'invoices' | 'statements'>(
		tabParam === 'statements' ? 'statements' : 'invoices',
	)

	const [filters, setFilters] = useState<InvoiceFilterState>(() => {
		if (statusParam) {
			return { ...initialFilters, statuses: [statusParam as InvoiceStatus] }
		}
		return initialFilters
	})
	const [paymentIssuesOnly, setPaymentIssuesOnly] = useState(
		filterParam === 'payment-issues',
	)

	const [statementFilters, setStatementFilters] =
		useState<StatementFilterState>(initialStatementFilters)

	// Data — InvoiceWithRelations includes payments[], so no separate payment fetch needed
	const allInvoices = getAllInvoicesWithRelations()
	const permittedInvoices = filterVipInvoices(
		currentUser,
		filterInvoicesByPermission(currentUser, allInvoices, bookings),
	)

	// Apply payment-issues filter before standard filters
	const baseInvoices = paymentIssuesOnly
		? permittedInvoices.filter((i) =>
				i.payments.some((p) => p.status === 'failed' || p.status === 'pending'),
			)
		: permittedInvoices
	const filteredInvoices = applyInvoiceFilters(baseInvoices, filters)

	const TERMINAL_STATUSES: InvoiceStatus[] = ['paid', 'cancelled']
	const sortedInvoices = useMemo(() => {
		return [...filteredInvoices].sort((a, b) => {
			const aTerminal = TERMINAL_STATUSES.includes(a.status) ? 1 : 0
			const bTerminal = TERMINAL_STATUSES.includes(b.status) ? 1 : 0
			return aTerminal - bTerminal
		})
	}, [filteredInvoices])

	// KPI stats (computed from full permitted set, before any filters)
	const kpiStats = useMemo(() => {
		const outstanding = permittedInvoices.filter(
			(i) => i.status === 'sent' || i.status === 'overdue',
		)
		const overdue = permittedInvoices.filter((i) => i.status === 'overdue')
		const withIssues = permittedInvoices.filter((i) =>
			i.payments.some((p) => p.status === 'failed' || p.status === 'pending'),
		)

		const now = new Date()
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
		const collectedMtd = permittedInvoices
			.flatMap((i) => i.payments)
			.filter(
				(p) =>
					p.status === 'succeeded' &&
					p.processedAt &&
					new Date(p.processedAt) >= monthStart,
			)
			.reduce((sum, p) => sum + p.amount, 0)

		return {
			outstandingCount: outstanding.length,
			outstandingTotal: outstanding.reduce((sum, i) => sum + i.total, 0),
			overdueCount: overdue.length,
			overdueTotal: overdue.reduce((sum, i) => sum + i.total, 0),
			issueCount: withIssues.length,
			collectedMtd,
		}
	}, [permittedInvoices])

	// Statement data
	const allStatements = getAllStatementsWithRelations()
	const permittedStatements = filterVipStatements(
		currentUser,
		filterStatementsByPermission(currentUser, allStatements, bookings),
	)
	const filteredStatements = applyStatementFilters(
		permittedStatements,
		statementFilters,
	)

	const statementKpiStats = useMemo(() => {
		const open = permittedStatements.filter((s) => s.status === 'open')
		const overdue = permittedStatements.filter((s) => s.status === 'overdue')
		const paid = permittedStatements.filter((s) => s.status === 'paid')
		const totalOutstanding = permittedStatements
			.filter((s) => s.status !== 'paid')
			.reduce((sum, s) => sum + (s.total - s.paidAmount), 0)

		return {
			openCount: open.length,
			openTotal: open.reduce((sum, s) => sum + s.total, 0),
			overdueCount: overdue.length,
			paidCount: paid.length,
			totalOutstanding,
		}
	}, [permittedStatements])

	const activeStatementStatusTab: StatementStatus | null =
		statementFilters.statuses.length === 1 ? statementFilters.statuses[0] : null

	function handleStatementStatusTabChange(status: StatementStatus | null) {
		setStatementFilters((prev) => ({
			...prev,
			statuses: status ? [status] : [],
		}))
	}

	// Status tab derived from filter state
	const activeStatusTab: InvoiceStatus | null =
		filters.statuses.length === 1 ? filters.statuses[0] : null

	function handleStatusTabChange(status: InvoiceStatus | null) {
		setPaymentIssuesOnly(false)
		setFilters((prev) => ({ ...prev, statuses: status ? [status] : [] }))
	}

	function handleOutstandingClick() {
		setPaymentIssuesOnly(false)
		setFilters((prev) => ({ ...prev, statuses: ['sent', 'overdue'] }))
	}

	function handleOverdueClick() {
		setPaymentIssuesOnly(false)
		setFilters((prev) => ({ ...prev, statuses: ['overdue'] }))
	}

	function handlePaymentIssuesClick() {
		setPaymentIssuesOnly(true)
		setFilters((prev) => ({ ...prev, statuses: [] }))
	}

	function handleReset() {
		setPaymentIssuesOnly(false)
		setFilters(initialFilters)
	}

	const activeFilterCount =
		(filters.search ? 1 : 0) +
		(filters.dateFrom ? 1 : 0) +
		(filters.dateTo ? 1 : 0) +
		(paymentIssuesOnly ? 1 : 0)

	function handleTabChange(tab: string) {
		setActiveTab(tab as 'invoices' | 'statements')
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			if (tab === 'statements') {
				next.set('tab', 'statements')
			} else {
				next.delete('tab')
			}
			return next
		})
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Billing</h1>
			<Tabs value={activeTab} onValueChange={handleTabChange}>
				<TabsList>
					<TabsTrigger value="invoices">Invoices</TabsTrigger>
					<TabsTrigger value="statements">Statements</TabsTrigger>
				</TabsList>
			</Tabs>

			{activeTab === 'invoices' ? (
				<>
					<div className="grid grid-cols-4 gap-4">
						<KpiCard
							label="Outstanding"
							value={`${kpiStats.outstandingCount} · ${formatCurrency(kpiStats.outstandingTotal)}`}
							icon={FileText}
							onClick={handleOutstandingClick}
						/>
						<KpiCard
							label="Overdue"
							value={`${kpiStats.overdueCount} · ${formatCurrency(kpiStats.overdueTotal)}`}
							icon={AlertCircle}
							onClick={handleOverdueClick}
						/>
						<KpiCard
							label="Payment Issues"
							value={kpiStats.issueCount}
							icon={AlertTriangle}
							onClick={handlePaymentIssuesClick}
						/>
						<KpiCard
							label="Collected (MTD)"
							value={formatCurrency(kpiStats.collectedMtd)}
							icon={PoundSterling}
						/>
					</div>

					<BillingStatusTabs
						items={permittedInvoices}
						statuses={STATUS_TABS}
						labels={INVOICE_STATUS_LABELS}
						activeStatus={activeStatusTab}
						onStatusChange={handleStatusTabChange}
					/>

					<FilterBar onReset={handleReset} activeCount={activeFilterCount}>
						<SearchInput
							value={filters.search}
							onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
							placeholder="Search invoices..."
						/>
						<DateRangePicker
							from={filters.dateFrom ?? undefined}
							to={filters.dateTo ?? undefined}
							onSelect={(range) =>
								setFilters((prev) => ({
									...prev,
									dateFrom: range.from ?? null,
									dateTo: range.to ?? null,
								}))
							}
						/>
					</FilterBar>

					{sortedInvoices.length === 0 ? (
						<EmptyState
							icon={FileText}
							title="No invoices found"
							description="Try adjusting your filters or search query."
						/>
					) : (
						<InvoiceTable
							invoices={sortedInvoices}
							onSelect={(invoice) => navigate(`/billing/${invoice.id}`)}
						/>
					)}
				</>
			) : (
				<>
					<div className="grid grid-cols-4 gap-4">
						<KpiCard
							label="Open"
							value={`${statementKpiStats.openCount} · ${formatCurrency(statementKpiStats.openTotal)}`}
							icon={ScrollText}
							onClick={() =>
								setStatementFilters((prev) => ({ ...prev, statuses: ['open'] }))
							}
						/>
						<KpiCard
							label="Overdue"
							value={statementKpiStats.overdueCount}
							icon={AlertCircle}
							onClick={() =>
								setStatementFilters((prev) => ({
									...prev,
									statuses: ['overdue'],
								}))
							}
						/>
						<KpiCard
							label="Paid"
							value={statementKpiStats.paidCount}
							icon={PoundSterling}
							onClick={() =>
								setStatementFilters((prev) => ({ ...prev, statuses: ['paid'] }))
							}
						/>
						<KpiCard
							label="Total Outstanding"
							value={formatCurrency(statementKpiStats.totalOutstanding)}
							icon={AlertTriangle}
						/>
					</div>

					<BillingStatusTabs
						items={permittedStatements}
						statuses={STATEMENT_STATUS_TABS}
						labels={STATEMENT_STATUS_LABELS}
						activeStatus={activeStatementStatusTab}
						onStatusChange={handleStatementStatusTabChange}
					/>

					<FilterBar
						onReset={() => setStatementFilters(initialStatementFilters)}
						activeCount={statementFilters.search ? 1 : 0}
					>
						<SearchInput
							value={statementFilters.search}
							onChange={(search) =>
								setStatementFilters((prev) => ({ ...prev, search }))
							}
							placeholder="Search by client name..."
						/>
					</FilterBar>

					{filteredStatements.length === 0 ? (
						<EmptyState
							icon={ScrollText}
							title="No statements found"
							description="Try adjusting your filters or search query."
						/>
					) : (
						<StatementTable
							statements={filteredStatements}
							onSelect={(statement) =>
								navigate(`/billing/statements/${statement.id}`)
							}
						/>
					)}
				</>
			)}
		</div>
	)
}
