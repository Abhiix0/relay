import { Construction } from "lucide-react";

interface ComingSoonPageProps {
  feature: string;
}

export function ComingSoonPage({ feature }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Construction className="h-10 w-10 text-copper mb-4" aria-hidden="true" />
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
        Coming soon
      </p>
      <h2 className="font-serif text-3xl font-normal text-paper mb-2">
        {feature}
      </h2>
      <p className="text-sm text-text-muted max-w-xs">
        This screen is under construction and will be available in a future
        release.
      </p>
    </div>
  );
}
