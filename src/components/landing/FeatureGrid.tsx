import { LucideIcon } from "lucide-react";

interface Feature {
  icon: string | LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

// Icon mapping für String-basierte Icons
const iconMap: Record<string, LucideIcon> = {
  // Diese Icons werden später importiert
};

export default function FeatureGrid({
  title,
  subtitle,
  features,
  columns = 3,
}: FeatureGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="marketing-section">
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

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
          {features.map((feature, index) => {
            const IconComponent = typeof feature.icon === 'string' 
              ? iconMap[feature.icon] 
              : feature.icon;

            return (
              <div
                key={index}
                className={`marketing-card text-center transition-all hover:shadow-lg ${
                  feature.highlight ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className={`p-3 rounded-xl ${
                      feature.highlight 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-primary'
                    }`}>
                      {IconComponent ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <div className="w-6 h-6 bg-current rounded" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
