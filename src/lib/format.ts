import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy, h:mm a");
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

/** Smart short date: today → "14:30", yesterday → "Yesterday", <7d → "Mon", older → "Mar 2" */
export function formatSmartDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)
  const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 86_400_000)

  if (date >= startOfToday) return format(date, "HH:mm")
  if (date >= startOfYesterday) return "Yesterday"
  if (date >= sevenDaysAgo) return format(date, "EEE")
  return format(date, "MMM d")
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "Marcus Chen" → "Marcus C." / "Elena" → "Elena" */
export function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return fullName
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "just now";
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
