import Link from "next/link";
import Image from "next/image";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections: FooterSection[];
  company: {
    name: string;
    description?: string;
    logo?: {
      src: string;
      alt: string;
    };
  };
  social?: Array<{
    name: string;
    href: string;
    icon: string;
  }>;
  legal?: {
    copyright: string;
    links: FooterLink[];
  };
}

export default function Footer({
  sections,
  company,
  social = [],
  legal,
}: FooterProps) {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="marketing-container">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              {company.logo && (
                <Image
                  src={company.logo.src}
                  alt={company.logo.alt}
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {company.name}
                </h3>
                {company.description && (
                  <p className="text-muted-foreground text-sm mt-2">
                    {company.description}
                  </p>
                )}
              </div>
              
              {/* Social Links */}
              {social.length > 0 && (
                <div className="flex gap-4">
                  {social.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={item.name}
                    >
                      <span className="sr-only">{item.name}</span>
                      <div className="w-5 h-5 bg-current rounded" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Sections */}
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-semibold">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {legal && (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {legal.copyright}
                </p>
                <div className="flex gap-4">
                  {legal.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              Made with ❤️ in Germany
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
