import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly?: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  cta: {
    label: string;
    href: string;
    variant?: "default" | "outline";
  };
  popular?: boolean;
  badge?: string;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  billingToggle?: boolean;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export default function Pricing({
  title,
  subtitle,
  plans,
  billingToggle = true,
  faq = [],
}: PricingProps) {
  return (
    <section className="marketing-section bg-secondary/20">
      <div className="marketing-container">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="marketing-subheading text-balance mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="marketing-text max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Billing Toggle */}
        {billingToggle && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-secondary rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-background shadow-sm">
                Monatlich
              </button>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Jährlich
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`marketing-card relative ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.badge || "Beliebt"}
                  </Badge>
                </div>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {plan.price.monthly === 0 ? 'Kostenlos' : `€${plan.price.monthly}`}
                    </div>
                    {plan.price.monthly > 0 && (
                      <div className="text-sm text-muted-foreground">
                        pro Monat
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular 
                      ? 'marketing-button-primary' 
                      : 'marketing-button-secondary'
                  }`}
                  variant={plan.cta.variant || (plan.popular ? 'default' : 'outline')}
                >
                  <Link href={plan.cta.href}>
                    {plan.cta.label}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        {faq.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-8">
              Häufige Fragen
            </h3>
            <div className="space-y-6">
              {faq.map((item, index) => (
                <div key={index} className="marketing-card">
                  <h4 className="font-medium mb-2">
                    {item.question}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
