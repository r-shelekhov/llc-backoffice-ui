import { Phone, Mail, MessageCircle, Globe, Crown } from "lucide-react";
import type { Channel } from "@/types";
import { CHANNEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ChannelIconProps {
  channel: Channel;
  className?: string;
}

const iconMap = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  web: Globe,
  concierge: Crown,
} as const;

export function ChannelIcon({ channel, className }: ChannelIconProps) {
  const Icon = iconMap[channel];
  return (
    <span title={CHANNEL_LABELS[channel]}>
      <Icon className={cn("size-4", className)} />
    </span>
  );
}
