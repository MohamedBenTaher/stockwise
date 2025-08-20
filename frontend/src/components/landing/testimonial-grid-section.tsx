const testimonials = [
  {
    quote:
      "StockWise's AI insights helped me identified that I was overexposed to tech stocks. The diversification recommendations led to a 15% improvement in my risk-adjusted returns.",
    name: "Michael Rodriguez",
    company: "Individual Investor",
    avatar: "/images/avatars/annette-black.svg",
    type: "large-teal",
  },
  {
    quote:
      "The real-time tracking and alerts saved me from a major loss during the market volatility. I got notified instantly when my portfolio risk exceeded my comfort zone.",
    name: "Jennifer Park",
    company: "Financial Advisor",
    avatar: "/images/avatars/dianne-russell.svg",
    type: "small-dark",
  },
  {
    quote:
      "As a beginner investor, StockWise made portfolio management approachable. The AI explains everything in simple terms while providing sophisticated analysis.",
    name: "David Thompson",
    company: "Software Engineer",
    avatar: "/images/avatars/cameron-williamson.svg",
    type: "small-dark",
  },
  {
    quote:
      "The brokerage integration is seamless. All my accounts sync automatically, and I get a unified view of my entire investment portfolio in one dashboard.",
    name: "Lisa Chang",
    company: "Investment Manager",
    avatar: "/images/avatars/robert-fox.svg",
    type: "small-dark",
  },
  {
    quote:
      "The predictive analytics feature warned me about sector rotation before it happened. I was able to rebalance my portfolio and avoid significant losses.",
    name: "Robert Kim",
    company: "Wealth Manager",
    avatar: "/images/avatars/darlene-robertson.svg",
    type: "small-dark",
  },
  {
    quote:
      "StockWise's risk assessment tools are incredibly detailed yet easy to understand. The geographic and sector exposure analysis helped me build a truly diversified portfolio.",
    name: "Amanda Foster",
    company: "Portfolio Analyst",
    avatar: "/images/avatars/cody-fisher.svg",
    type: "small-dark",
  },
  {
    quote:
      "The mobile app keeps me connected to my investments wherever I am. Push notifications for significant market moves and portfolio changes are invaluable for active management.",
    name: "James Wilson",
    company: "Day Trader",
    avatar: "/images/avatars/albert-flores.svg",
    type: "large-light",
  },
];

interface TestimonialProps {
  quote: string;
  name: string;
  company: string;
  avatar: string;
  type: string;
}

const TestimonialCard = ({
  quote,
  name,
  company,
  avatar,
  type,
}: TestimonialProps) => {
  const isLargeCard = type.startsWith("large");
  const avatarSize = isLargeCard ? 48 : 36;
  const avatarBorderRadius = isLargeCard
    ? "rounded-[41px]"
    : "rounded-[30.75px]";
  const padding = isLargeCard ? "p-6" : "p-[30px]";

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08)] relative ${padding}`;
  let quoteClasses = "";
  let nameClasses = "";
  let companyClasses = "";
  let backgroundElements = null;
  let cardHeight = "";
  const cardWidth = "w-full md:w-[384px]";

  if (type === "large-teal") {
    cardClasses += " bg-primary";
    quoteClasses += " text-primary-foreground text-2xl font-medium leading-8";
    nameClasses += " text-primary-foreground text-base font-normal leading-6";
    companyClasses +=
      " text-primary-foreground/60 text-base font-normal leading-6";
    cardHeight = "h-[502px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else if (type === "large-light") {
    cardClasses += " bg-[rgba(231,236,235,0.12)]";
    quoteClasses += " text-foreground text-2xl font-medium leading-8";
    nameClasses += " text-foreground text-base font-normal leading-6";
    companyClasses += " text-muted-foreground text-base font-normal leading-6";
    cardHeight = "h-[502px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else {
    cardClasses +=
      " bg-card outline outline-1 outline-border outline-offset-[-1px]";
    quoteClasses += " text-foreground/80 text-[17px] font-normal leading-6";
    nameClasses += " text-foreground text-sm font-normal leading-[22px]";
    companyClasses +=
      " text-muted-foreground text-sm font-normal leading-[22px]";
    cardHeight = "h-[244px]";
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words ${quoteClasses}`}>
        {quote}
      </div>
      <div className="relative z-10 flex justify-start items-center gap-3">
        <img
          src={avatar || "/placeholder.svg"}
          alt={`${name} avatar`}
          width={avatarSize}
          height={avatarSize}
          className={`w-${avatarSize / 4} h-${
            avatarSize / 4
          } ${avatarBorderRadius}`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  );
};

export function TestimonialGridSection() {
  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="self-stretch py-6 md:py-8 lg:py-14 flex flex-col justify-center items-center gap-2">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-3xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-tight lg:leading-[40px]">
            Trusted by Smart Investors
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm md:text-sm lg:text-base font-medium leading-[18.20px] md:leading-relaxed lg:leading-relaxed">
            {
              "From first-time investors to seasoned professionals, see how StockWise"
            }{" "}
            <br />{" "}
            {
              "helps users make smarter investment decisions with AI-powered insights"
            }
          </p>
        </div>
      </div>
      <div className="w-full pt-0.5 pb-4 md:pb-6 lg:pb-10 flex flex-col md:flex-row justify-center items-start gap-4 md:gap-4 lg:gap-6 max-w-[1100px] mx-auto">
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  );
}
