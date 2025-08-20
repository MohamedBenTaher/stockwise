export function SocialProof() {
  return (
    <section className="self-stretch py-16 flex flex-col justify-center items-center gap-6 overflow-hidden bg-muted/20">
      <div className="text-center text-muted-foreground text-sm font-medium leading-tight">
        Trusted by investors and financial professionals
      </div>
      <div className="self-stretch flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
        {/* Test with inline SVG first */}
        <div className="flex items-center justify-center p-4 bg-background rounded border">
          <svg
            viewBox="0 0 200 60"
            className="w-40 h-12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="200"
              height="60"
              fill="#f8f9fa"
              stroke="#e9ecef"
              strokeWidth="1"
            />
            <text
              x="100"
              y="35"
              fontFamily="Arial, sans-serif"
              fontSize="16"
              fontWeight="600"
              fill="#495057"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              FinanceCorp
            </text>
          </svg>
        </div>

        {/* Test with external SVG */}
        <div className="flex items-center justify-center p-4 bg-background rounded border">
          <img
            src="/logos/logo02.svg"
            alt="InvestTech"
            className="w-40 h-12 object-contain"
            onError={(e) => {
              console.error("Failed to load:", e.currentTarget.src);
              e.currentTarget.style.border = "2px solid red";
            }}
            onLoad={() => console.log("Successfully loaded logo02.svg")}
          />
        </div>

        {/* Test with stockwise logo */}
        <div className="flex items-center justify-center p-4 bg-background rounded border">
          <img
            src="/stockwise.svg"
            alt="StockWise"
            className="w-40 h-12 object-contain"
            onError={(e) => {
              console.error("Failed to load:", e.currentTarget.src);
              e.currentTarget.style.border = "2px solid red";
            }}
            onLoad={() => console.log("Successfully loaded stockwise.svg")}
          />
        </div>

        {/* Fallback text logos */}
        <div className="flex items-center justify-center p-4 bg-background rounded border min-w-[160px]">
          <span className="text-muted-foreground font-semibold">
            WealthBank
          </span>
        </div>
        <div className="flex items-center justify-center p-4 bg-background rounded border min-w-[160px]">
          <span className="text-muted-foreground font-semibold">TradeMax</span>
        </div>
        <div className="flex items-center justify-center p-4 bg-background rounded border min-w-[160px]">
          <span className="text-muted-foreground font-semibold">
            GlobalFunds
          </span>
        </div>
        <div className="flex items-center justify-center p-4 bg-background rounded border min-w-[160px]">
          <span className="text-muted-foreground font-semibold">
            CapitalPro
          </span>
        </div>
        <div className="flex items-center justify-center p-4 bg-background rounded border min-w-[160px]">
          <span className="text-muted-foreground font-semibold">MarketPro</span>
        </div>
      </div>
    </section>
  );
}
