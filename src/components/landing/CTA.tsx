import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CTAProps {
  title: string;
  subtitle?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundPattern?: boolean;
  variant?: "default" | "centered" | "split";
  socialProof?: {
    text: string;
    stats?: Array<{
      value: string;
      label: string;
    }>;
  };
}

export default function CTA({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  backgroundPattern = true,
  variant = "default",
  socialProof,
}: CTAProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "centered":
        return "text-center";
      case "split":
        return "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center";
      default:
        return "";
    }
  };

  return (
    <section className={`marketing-section ${backgroundPattern ? 'marketing-bg-pattern' : 'bg-primary/5'}`}>
      <div className="marketing-container">
        <div className={getVariantClasses()}>
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="marketing-subheading text-balance">
                {title}
              </h2>
              {subtitle && (
                <p className="marketing-text max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="marketing-button-primary">
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                </Link>
              </Button>
              {secondaryCta && (
                <Button asChild variant="outline" size="lg" className="marketing-button-secondary">
                  <Link href={secondaryCta.href}>
                    {secondaryCta.label}
                  </Link>
                </Button>
              )}
            </div>

            {/* Social Proof */}
            {socialProof && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {socialProof.text}
                </p>
                {socialProof.stats && (
                  <div className="flex flex-wrap gap-6">
                    {socialProof.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Split variant: Additional content */}
          {variant === "split" && (
            <div className="space-y-6">
              <div className="marketing-card">
                <h3 className="text-lg font-semibold mb-4">
                  Warum AngebotNow?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">KI-gestützte Angebotserstellung</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">Professionelle PDF-Ausgabe</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">DSGVO-konform und sicher</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">Made in Germany</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
