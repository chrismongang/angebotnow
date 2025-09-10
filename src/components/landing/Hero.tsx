import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  badges?: string[];
  image?: {
    src: string;
    alt: string;
  };
  backgroundPattern?: boolean;
}

export default function Hero({
  eyebrow,
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  badges = [],
  image,
  backgroundPattern = true,
}: HeroProps) {
  return (
    <section className={`marketing-hero relative overflow-hidden ${backgroundPattern ? 'marketing-bg-pattern' : ''}`}>
      <div className="marketing-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 fade-in">
            {eyebrow && (
              <Badge variant="secondary" className="text-sm font-medium">
                {eyebrow}
              </Badge>
            )}
            
            <div className="space-y-4">
              <h1 className="marketing-heading text-balance">
                {title}
              </h1>
              <p className="marketing-subheading text-primary">
                {subtitle}
              </p>
              {description && (
                <p className="marketing-text max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {/* Trust Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryCta && (
                <Button asChild size="lg" className="marketing-button-primary">
                  <Link href={primaryCta.href}>
                    {primaryCta.label}
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button asChild variant="outline" size="lg" className="marketing-button-secondary">
                  <Link href={secondaryCta.href}>
                    {secondaryCta.label}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Image/Visual */}
          {image && (
            <div className="relative slide-up">
              <div className="relative rounded-2xl overflow-hidden marketing-shadow">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                />
                {/* Optional: Overlay für bessere Integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
