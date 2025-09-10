import Image from "next/image";

interface ProblemSolutionProps {
  title?: string;
  subtitle?: string;
  problem: {
    title: string;
    description: string;
    image?: {
      src: string;
      alt: string;
    };
    painPoints?: string[];
  };
  solution: {
    title: string;
    description: string;
    image?: {
      src: string;
      alt: string;
    };
    benefits?: string[];
  };
  stats?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

export default function ProblemSolution({
  title,
  subtitle,
  problem,
  solution,
  stats = [],
}: ProblemSolutionProps) {
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

        {/* Problem Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Problem
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  {problem.title}
                </h3>
                <p className="marketing-text">
                  {problem.description}
                </p>
              </div>

              {problem.painPoints && (
                <ul className="space-y-3">
                  {problem.painPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                        <span className="text-red-600 text-xs">✗</span>
                      </div>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {problem.image && (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden marketing-shadow">
                  <Image
                    src={problem.image.src}
                    alt={problem.image.alt}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-red-500/10" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Solution Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {solution.image && (
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-xl overflow-hidden marketing-shadow">
                  <Image
                    src={solution.image.src}
                    alt={solution.image.alt}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/10" />
                </div>
              </div>
            )}

            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Lösung
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  {solution.title}
                </h3>
                <p className="marketing-text">
                  {solution.description}
                </p>
              </div>

              {solution.benefits && (
                <ul className="space-y-3">
                  {solution.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="marketing-feature-grid">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-background border">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-medium mb-1">
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
