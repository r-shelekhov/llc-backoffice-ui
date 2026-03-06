import { Crown } from 'lucide-react'
import { ChannelIcon } from '@/components/shared/channel-icon'
import type { ActionReason } from '@/lib/filters'
import { formatShortName, formatSmartDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ConversationWithRelations, SlaState } from '@/types'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

const ACTION_BADGE_CONFIG: Partial<
	Record<
		ActionReason,
		{
			className: string | ((slaState: SlaState) => string)
			label: string | ((slaState: SlaState) => string)
		}
	>
> = {
	sla_risk: {
		className: (s) =>
			s === 'breached'
				? 'bg-tone-danger text-white'
				: 'bg-tone-warning-light text-tone-warning-foreground',
		label: (s) => (s === 'breached' ? 'SLA Breached' : 'SLA Risk'),
	},
	draft_booking: {
		className: 'bg-tone-warning-light text-tone-warning-foreground',
		label: 'Draft Booking',
	},
	awaiting_payment: {
		className: 'bg-tone-purple-light text-tone-purple-foreground',
		label: 'Awaiting Payment',
	},
	needs_scheduling: {
		className: 'bg-tone-info-light text-tone-info-foreground',
		label: 'Needs Scheduling',
	},
	overdue_invoice: {
		className: 'bg-tone-danger-light text-tone-danger-foreground',
		label: 'Overdue Invoice',
	},
}

interface ConversationItemProps {
	conversation: ConversationWithRelations
	isSelected: boolean
	isUnread: boolean
	unreadCount: number
	onClick: () => void
	actionReasons?: ActionReason[]
	currentUserId?: string
}

export function ConversationItem({
	conversation,
	isSelected,
	isUnread,
	unreadCount,
	onClick,
	actionReasons,
	currentUserId,
}: ConversationItemProps) {
	const lastComm = conversation.communications.length
		? conversation.communications.reduce((a, b) =>
				a.createdAt > b.createdAt ? a : b,
			)
		: null

	const preview = lastComm
		? `${lastComm.sender === 'agent' ? 'You: ' : ''}${lastComm.message}`
		: 'No messages yet'

	// Determine display manager: current user first if assigned, otherwise first in array
	const managers = conversation.managers
	const displayManager = currentUserId
		? managers.find((m) => m.id === currentUserId) ?? managers[0]
		: managers[0]
	const extraCount = managers.length - 1

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
					<span className="absolute bottom-5 left-7.5 flex size-4 items-center justify-center rounded-full bg-tone-vip-light ring-2 ring-background">
						<Crown className="size-2.5 text-tone-vip-foreground" />
					</span>
				)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<div className="flex min-w-0 items-baseline gap-1">
						<span
							className={cn(
								'truncate text-sm',
								isUnread
									? 'font-semibold text-foreground'
									: 'font-medium text-foreground/80',
							)}
						>
							{conversation.client.name}
						</span>
						{managers.length > 0 ? (
							<>
								<span className="shrink-0 text-muted-foreground">›</span>
								<span className="shrink-0 text-sm text-muted-foreground">
									{formatShortName(displayManager!.name)}
								</span>
								{extraCount > 0 && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="shrink-0 text-[10px] text-muted-foreground">
													+{extraCount}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												{managers.map((m) => m.name).join(', ')}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</>
						) : (
							<>
								<span className="shrink-0 text-tone-danger-foreground/70">
									›
								</span>
								<span className="shrink-0 text-xs font-medium text-tone-danger-foreground">
									Unassigned
								</span>
							</>
						)}
					</div>
					<span className="shrink-0 text-xs text-muted-foreground">
						{lastComm ? formatSmartDate(lastComm.createdAt) : ''}
					</span>
				</div>
				{(() => {
					const badgeReasons =
						actionReasons?.filter((r) => r in ACTION_BADGE_CONFIG) ?? []
					return (
						<div className="mt-0.5 flex flex-nowrap items-center gap-1 overflow-hidden">
							<span
								className={cn(
									'shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium leading-tight',
									conversation.lifecycleStatus === 'client'
										? 'bg-tone-info-light text-tone-info-foreground'
										: 'bg-tone-neutral-light text-tone-neutral-foreground ring-1 ring-inset ring-tone-neutral/25',
								)}
							>
								{conversation.lifecycleStatus === 'client' ? 'Client' : 'Lead'}
							</span>
							{conversation.resolvedAt && (
								<span className="shrink-0 rounded-full bg-tone-success-light px-1.5 py-px text-[10px] font-medium leading-tight text-tone-success-foreground">
									Resolved
								</span>
							)}
							{badgeReasons.slice(0, 2).map((reason) => {
								const config = ACTION_BADGE_CONFIG[reason]!
								const label =
									typeof config.label === 'function'
										? config.label(conversation.slaState)
										: config.label
								const badgeClassName =
									typeof config.className === 'function'
										? config.className(conversation.slaState)
										: config.className
								return (
									<span
										key={reason}
										className={cn(
											'min-w-0 truncate rounded-full px-1.5 py-px text-[10px] font-medium leading-tight',
											badgeClassName,
										)}
									>
										{label}
									</span>
								)
							})}
							{badgeReasons.length > 2 && (
								<span className="text-[10px] text-muted-foreground">
									+{badgeReasons.length - 2}
								</span>
							)}
						</div>
					)
				})()}
				<div className="mt-1 flex items-center justify-between gap-2">
					<p
						className={cn(
							'truncate text-xs text-muted-foreground/70',
							isUnread && 'font-semibold text-foreground/80',
						)}
					>
						{preview}
					</p>
					<div className="flex shrink-0 items-center gap-1.5">
						<ChannelIcon
							channel={conversation.channel}
							className="size-3 text-muted-foreground"
						/>
						{isUnread &&
							(unreadCount > 0 ? (
								<span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							) : (
								<span className="size-2 rounded-full bg-primary" />
							))}
					</div>
				</div>
			</div>
		</button>
	)
}
