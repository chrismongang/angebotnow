import Image from "next/image";

interface SocialProofProps {
  title?: string;
  logos?: Array<{
    src: string;
    alt: string;
    href?: string;
  }>;
  testimonials?: Array<{
    text: string;
    author: string;
    role: string;
    company?: string;
    avatar?: string;
    rating?: number;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

export default function SocialProof({
  title,
  logos = [],
  testimonials = [],
  stats = [],
}: SocialProofProps) {
  return (
    <section className="marketing-section bg-secondary/30">
      <div className="marketing-container">
        {title && (
          <div className="text-center mb-12">
            <h2 className="marketing-subheading text-balance">
              {title}
            </h2>
          </div>
        )}

        {/* Logos */}
        {logos.length > 0 && (
          <div className="mb-16">
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
              {logos.map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  {logo.href ? (
                    <a
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={120}
                        height={60}
                        className="h-8 w-auto object-contain filter grayscale hover:grayscale-0 transition-all"
                      />
                    </a>
                  ) : (
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={120}
                      height={60}
                      className="h-8 w-auto object-contain filter grayscale"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="marketing-feature-grid mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="marketing-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="marketing-card">
                <div className="space-y-4">
                  {/* Rating */}
                  {testimonial.rating && (
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating! 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="text-muted-foreground italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                        {testimonial.company && ` bei ${testimonial.company}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
