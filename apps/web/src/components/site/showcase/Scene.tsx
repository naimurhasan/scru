import { BriefcaseBusiness, Container, Ship, Sofa, Wind } from "lucide-react";
import type { SceneKey } from "@/lib/site/showcase";

const SCENES = {
  sea: {
    icon: Ship,
    sky: "from-orange-200 via-rose-200 to-sky-400",
    ground: "bg-sky-800",
  },
  room: {
    icon: Sofa,
    sky: "from-stone-100 via-amber-50 to-sky-200",
    ground: "bg-stone-300",
  },
  office: {
    icon: BriefcaseBusiness,
    sky: "from-emerald-100 via-stone-100 to-amber-100",
    ground: "bg-stone-500",
  },
  wind: {
    icon: Wind,
    sky: "from-amber-200 via-orange-100 to-sky-300",
    ground: "bg-emerald-800",
  },
  port: {
    icon: Container,
    sky: "from-sky-100 via-sky-200 to-sky-400",
    ground: "bg-stone-600",
  },
} as const;

export function Scene({ scene }: { scene: SceneKey }) {
  const { icon: Icon, sky, ground } = SCENES[scene];
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-b ${sky}`}
    >
      <div className={`absolute inset-x-0 bottom-0 h-2/5 ${ground}`} />
      <Icon
        strokeWidth={1.25}
        className="absolute left-1/2 top-[60%] size-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg"
      />
    </div>
  );
}
