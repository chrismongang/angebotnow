// Landingpage-Komponenten Export
export { default as Hero } from './Hero';
export { default as SocialProof } from './SocialProof';
export { default as FeatureGrid } from './FeatureGrid';
export { default as ProblemSolution } from './ProblemSolution';
export { default as Steps } from './Steps';
export { default as Pricing } from './Pricing';
export { default as FAQ } from './FAQ';
export { default as CTA } from './CTA';
export { default as Footer } from './Footer';

// Komponenten-Registry für dynamisches Rendering
import Hero from './Hero';
import SocialProof from './SocialProof';
import FeatureGrid from './FeatureGrid';
import ProblemSolution from './ProblemSolution';
import Steps from './Steps';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';

export const componentRegistry = {
  Hero,
  SocialProof,
  FeatureGrid,
  ProblemSolution,
  Steps,
  Pricing,
  FAQ,
  CTA,
  Footer,
} as const;

export type ComponentType = keyof typeof componentRegistry;
