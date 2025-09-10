import { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: string | LucideIcon;
  image?: {
    src: string;
    alt: string;
  };
}

interface StepsProps {
  title?: string;
  subtitle?: string;
  steps: Step[];
  orientation?: "horizontal" | "vertical";
}

// Icon mapping für String-basierte Icons
const iconMap: Record<string, LucideIcon> = {
  // Diese Icons werden später importiert
};

export default function Steps({
  title,
  subtitle,
  steps,
  orientation = "horizontal",
}: StepsProps) {
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

        {orientation === "horizontal" ? (
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-border">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, index) => {
                const IconComponent = typeof step.icon === 'string' 
                  ? iconMap[step.icon] 
                  : step.icon;

                return (
                  <div key={index} className="relative">
                    {/* Step Number */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                          {step.number}
                        </div>
                        {IconComponent && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    {/* Image */}
                    {step.image && (
                      <div className="mt-6 relative rounded-lg overflow-hidden">
                        <img
                          src={step.image.src}
                          alt={step.image.alt}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => {
                const IconComponent = typeof step.icon === 'string' 
                  ? iconMap[step.icon] 
                  : step.icon;

                return (
                  <div key={index} className="flex gap-8">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                          {step.number}
                        </div>
                        {IconComponent && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-background border border-primary rounded-full flex items-center justify-center">
                            <IconComponent className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <h3 className="text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      
                      {step.image && (
                        <div className="mt-4 relative rounded-lg overflow-hidden max-w-md">
                          <img
                            src={step.image.src}
                            alt={step.image.alt}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
