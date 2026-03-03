import { Crown } from 'lucide-react'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ActionReason } from '@/lib/filters'
import type { ConversationWithRelations, SlaState } from '@/types'

const ACTION_BADGE_CONFIG: Partial<Record<ActionReason, { className: string; label: string | ((slaState: SlaState) => string) }>> = {
	sla_risk: { className: "bg-tone-danger-light text-tone-danger-foreground", label: (s) => s === "breached" ? "SLA Breached" : "SLA Risk" },
	unassigned: { className: "bg-tone-neutral-light text-tone-neutral-foreground ring-1 ring-inset ring-tone-neutral/25", label: "Unassigned" },
	draft_booking: { className: "bg-tone-warning-light text-tone-warning-foreground", label: "Draft Booking" },
	awaiting_payment: { className: "bg-tone-purple-light text-tone-purple-foreground", label: "Awaiting Payment" },
	needs_scheduling: { className: "bg-tone-info-light text-tone-info-foreground", label: "Needs Scheduling" },
	overdue_invoice: { className: "bg-tone-danger-light text-tone-danger-foreground", label: "Overdue Invoice" },
}

interface ConversationItemProps {
	conversation: ConversationWithRelations
	isSelected: boolean
	isUnread: boolean
	unreadCount: number
	onClick: () => void
	actionReasons?: ActionReason[]
}

export function ConversationItem({
	conversation,
	isSelected,
	isUnread,
	unreadCount,
	onClick,
	actionReasons,
}: ConversationItemProps) {
	const lastComm = conversation.communications.length
		? conversation.communications.reduce((a, b) =>
				a.createdAt > b.createdAt ? a : b,
			)
		: null

	const preview = lastComm
		? `${lastComm.sender === 'agent' ? 'You: ' : ''}${lastComm.message}`
		: 'No messages yet'

	return (
		<button
			onClick={onClick}
			className={cn(
				'flex w-full gap-3 border-l-2 border-l-transparent px-4 py-3 text-left transition-colors hover:bg-accent/30',
				isSelected && 'border-l-primary bg-accent',
			)}
		>
			<div className="relative shrink-0">
				<img
					src={conversation.client.avatarUrl}
					alt={conversation.client.name}
					className="size-10 rounded-full object-cover"
				/>
				{conversation.client.isVip && (
					<span className="absolute bottom-4.5 left-7.5 flex size-4 items-center justify-center rounded-full bg-tone-vip-light ring-2 ring-background">
						<Crown className="size-2.5 text-tone-vip-foreground" />
					</span>
				)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<span className={cn("truncate text-sm", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
						{conversation.client.name}
					</span>
					<span className="shrink-0 text-xs text-muted-foreground">
						{lastComm ? formatRelativeTime(lastComm.createdAt) : ''}
					</span>
				</div>
				{actionReasons && actionReasons.length > 0 && (() => {
					const badgeReasons = actionReasons.filter((r) => r in ACTION_BADGE_CONFIG)
					if (badgeReasons.length === 0) return null
					return (
						<div className="mt-0.5 flex items-center gap-1">
							{badgeReasons.slice(0, 2).map((reason) => {
								const config = ACTION_BADGE_CONFIG[reason]!
								const label = typeof config.label === "function" ? config.label(conversation.slaState) : config.label
								return (
									<span key={reason} className={cn("rounded-full px-1.5 py-px text-[10px] font-medium leading-tight", config.className)}>
										{label}
									</span>
								)
							})}
							{badgeReasons.length > 2 && (
								<span className="text-[10px] text-muted-foreground">+{badgeReasons.length - 2}</span>
							)}
						</div>
					)
				})()}
				<div className="flex items-center justify-between gap-2">
					<p className={cn(
						"truncate text-xs text-muted-foreground/70",
						isUnread && "font-semibold text-foreground/80",
					)}>{preview}</p>
					<div className="flex shrink-0 items-center gap-1.5">
						<ChannelIcon
							channel={conversation.channel}
							className="size-3 text-muted-foreground"
						/>
						{isUnread && (
							unreadCount > 0 ? (
								<span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							) : (
								<span className="size-2 rounded-full bg-primary" />
							)
						)}
					</div>
				</div>
			</div>
		</button>
	)
}
