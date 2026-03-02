import { Crown } from 'lucide-react'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ConversationWithRelations } from '@/types'

interface ConversationItemProps {
	conversation: ConversationWithRelations
	isSelected: boolean
	isUnread: boolean
	onClick: () => void
}

export function ConversationItem({
	conversation,
	isSelected,
	isUnread,
	onClick,
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
				isSelected && 'border-l-primary bg-accent/50',
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
					<span className="truncate text-sm font-medium">
						{conversation.client.name}
					</span>
					<span className="shrink-0 text-xs text-muted-foreground">
						{lastComm ? formatRelativeTime(lastComm.createdAt) : ''}
					</span>
				</div>
				<p className="truncate text-sm text-muted-foreground">
					{conversation.title}
				</p>
				<div className="flex items-center justify-between gap-2">
					<p className="truncate text-xs text-muted-foreground/70">{preview}</p>
					<div className="flex shrink-0 items-center gap-1.5">
						<ChannelIcon
							channel={conversation.channel}
							className="size-3 text-muted-foreground"
						/>
						{isUnread && <span className="size-2 rounded-full bg-primary" />}
					</div>
				</div>
			</div>
		</button>
	)
}
