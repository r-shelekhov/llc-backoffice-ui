import { Car, Plane, Ship } from "lucide-react";
import type { ServiceType } from "@/types";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ServiceTypeIconProps {
  serviceType: ServiceType;
  className?: string;
}

const iconMap: Record<ServiceType, { icon: LucideIcon; extraClass?: string }> = {
  car: { icon: Car },
  jet: { icon: Plane },
  helicopter: { icon: Plane, extraClass: "rotate-[-45deg]" },
  yacht: { icon: Ship },
};

export function ServiceTypeIcon({ serviceType, className }: ServiceTypeIconProps) {
  const { icon: Icon, extraClass } = iconMap[serviceType];
  return (
    <Icon
      className={cn("size-4", extraClass, className)}
      title={SERVICE_TYPE_LABELS[serviceType]}
    />
  );
}
