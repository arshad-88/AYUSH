import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Menu, X, Activity, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar } from "@/components/scientific";

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionNav = (sectionId: string) => {
    const scrollToSection = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (window.location.pathname === "/") {
      scrollToSection();
      return;
    }
    navigate("/");
    setTimeout(scrollToSection, 150);
  };

  return (
    <header className="sticky top-0 z-50 panel-glass border-b border-trust-500/15">
      <StatusBar
        className="hidden md:flex justify-end px-4 sm:px-6 lg:px-8 py-2 border-b border-trust-500/10"
        latency="42ms"
        sessionId="MK-2026.OPD.A"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center glow-primary">
                <Activity className="w-5 h-5 text-white" strokeWidth={2.4} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-400 ring-2 ring-bio-base animate-blink-soft" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight-x">
                MediKiosk<span className="text-trust-400">.</span>AI
              </span>
              <span className="data-figure text-[9px] text-muted-foreground tracking-widest">
                v1.0 · CLINICAL OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Workflow", id: "how-it-works" },
              { label: "For Patients", id: "for-patients" },
              { label: "For Doctors", id: "for-doctors" },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground relative group"
                onClick={() => handleSectionNav(item.id)}
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-trust-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground gap-1"
              onClick={() => navigate("/technology")}
            >
              Technology
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => navigate("/doctor/login")}
            >
              Doctor Portal
            </Button>
            <Button
              size="sm"
              className="text-sm bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
              onClick={() => navigate("/patient/login")}
            >
              Start Assessment
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-trust-500/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-trust-500/10"
            >
              <div className="py-3 space-y-1">
                {[
                  { label: "Workflow", id: "how-it-works" },
                  { label: "For Patients", id: "for-patients" },
                  { label: "For Doctors", id: "for-doctors" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSectionNav(item.id);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/technology");
                  }}
                >
                  Technology
                </Button>
                <div className="pt-2 border-t border-trust-500/10 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-sm border-trust-500/30"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/doctor/login");
                    }}
                  >
                    Doctor Portal
                  </Button>
                  <Button
                    className="w-full text-sm bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/patient/login");
                    }}
                  >
                    Start Assessment
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}