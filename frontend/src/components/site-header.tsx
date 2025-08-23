import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@/hooks/useAuth";

export function SiteHeader() {
  const { data: user } = useUser();

  return (
    <header className="relative">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border-b border-white/10" />

      <div className="relative flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 text-foreground hover:bg-white/10" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 bg-white/20"
          />
          <h1 className="text-base font-medium text-foreground">
            Portfolio Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="text-sm text-muted-foreground hidden sm:flex">
                Welcome, {user.email}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
