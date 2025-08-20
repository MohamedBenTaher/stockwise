import { HeroSection } from "@/components/landing/hero-section";
import { StockWiseDashboardPreview } from "@/components/landing/stockwise-dashboard-preview";
import { SocialProof } from "@/components/landing/social-proof";
import { BentoSection } from "@/components/landing/bento-section";
import { LargeTestimonial } from "@/components/landing/large-testimonial";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialGridSection } from "@/components/landing/testimonial-grid-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";
import { AnimatedSection } from "@/components/landing/animated-section";

export default function LandingPage() {
  console.log("LandingPage: Component is rendering");

  return (
    <div className="landing-page min-h-screen bg-background relative overflow-hidden pb-0 w-full">
      <div className="relative z-10 w-full">
        <main className="w-full max-w-none relative">
          <div className="landing-section w-full">
            <HeroSection />
          </div>
          {/* Dashboard Preview Wrapper */}
          <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
            <AnimatedSection>
              <StockWiseDashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        <div className="landing-section w-full">
          <AnimatedSection
            className="relative z-10 w-full max-w-[1320px] mx-auto px-6 mt-[411px] md:mt-[400px]"
            delay={0.1}
          >
            <SocialProof />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            id="features-section"
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-16"
            delay={0.2}
          >
            <BentoSection />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <LargeTestimonial />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            id="pricing-section"
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <PricingSection />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            id="testimonials-section"
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <TestimonialGridSection />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            id="faq-section"
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <FAQSection />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            className="relative z-10 w-full max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <CTASection />
          </AnimatedSection>
        </div>
        <div className="landing-section w-full">
          <AnimatedSection
            className="relative z-10 w-full max-w-none mt-8 md:mt-16"
            delay={0.2}
          >
            <FooterSection />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
