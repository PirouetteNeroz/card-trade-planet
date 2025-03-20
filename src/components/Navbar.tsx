
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart, Menu, X, Home, Grid, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Accueil", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Inventaire", path: "/inventory", icon: <Grid className="h-4 w-4 mr-2" /> },
    { name: "Panier", path: "/cart", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
    { name: "Admin", path: "/admin", icon: <UserCircle className="h-4 w-4 mr-2" /> }
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-3",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-slate-900/80"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 text-2xl font-bold text-primary"
        >
          <span className="relative z-10 inline-block transform transition-transform hover:scale-110 duration-200">
            <svg
              className="w-8 h-8 animate-spin-slow"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" className="fill-pokemon-red" />
              <circle cx="50" cy="50" r="20" className="fill-white" />
              <rect x="0" y="45" width="100" height="10" className="fill-black" />
              <circle cx="50" cy="50" r="10" className="fill-white stroke-black stroke-2" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight">CardPlanet</span>
        </Link>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary relative py-2",
                  location.pathname === link.path
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:animate-fade-in"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <div
            className={cn(
              "fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out",
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            )}
          >
            <div className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center text-2xl font-medium transition-colors hover:text-primary",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
