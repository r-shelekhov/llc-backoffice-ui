import type { User } from "@/types";

export const users: User[] = [
  {
    id: "usr-1",
    name: "James Thornton",
    email: "james.thornton@llccar.com",
    role: "admin",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JT",
    isActive: true,
    createdAt: "2025-06-15T09:00:00Z",
    updatedAt: "2026-01-10T14:30:00Z",
  },
  {
    id: "usr-3",
    name: "Marcus Chen",
    email: "marcus.chen@llccar.com",
    role: "vip_manager",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MC",
    isActive: true,
    createdAt: "2025-08-10T08:30:00Z",
    updatedAt: "2026-02-01T16:45:00Z",
  },
  {
    id: "usr-4",
    name: "Elena Vasquez",
    email: "elena.vasquez@llccar.com",
    role: "manager",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=EV",
    isActive: true,
    createdAt: "2025-09-05T07:15:00Z",
    updatedAt: "2026-02-10T09:20:00Z",
  },
];
