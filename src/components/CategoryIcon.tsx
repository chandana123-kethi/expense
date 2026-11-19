import {
  Utensils, Plane, ShoppingBag, Film, HeartPulse, GraduationCap, MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  plane: Plane,
  'shopping-bag': ShoppingBag,
  film: Film,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'more-horizontal': MoreHorizontal,
};

export function CategoryIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? MoreHorizontal;
  return <Icon size={size} />;
}

export { ICONS };
