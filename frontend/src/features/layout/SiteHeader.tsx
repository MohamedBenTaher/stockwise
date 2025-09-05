import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@/hooks/useAuth";

export function SiteHeader() {
  const { data: user } = useUser();

  return (
    <header className="relative">
      {/* Enhanced glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl border-b border-border/50" />

      <div className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
        <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
          <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent rounded-lg transition-colors duration-200" />
          <Separator orientation="vertical" className="mx-2 h-6 bg-border/60" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
              <h1 className="text-base font-semibold text-foreground">
                Portfolio Dashboard
              </h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50 backdrop-blur-sm border border-border/30">
                <div className="w-2 h-2 bg-chart-2 rounded-full" />
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  Welcome, {user.email.split("@")[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
