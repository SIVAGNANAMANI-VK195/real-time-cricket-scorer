
import { ReactNode } from "react";
import { Cricket } from "lucide-react";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
  hideNav?: boolean;
};

const Layout = ({ children, hideNav = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNav && (
        <header className="w-full bg-cricket-pitch text-white py-4 px-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Cricket className="h-8 w-8 animate-ball-spin" />
              <h1 className="text-xl md:text-2xl font-bold">The Third Umpire</h1>
            </Link>
          </div>
        </header>
      )}
      
      <main className="flex-1 container px-4 py-6 mx-auto">
        {children}
      </main>
      
      <footer className="bg-cricket-pitch/10 py-4 px-4 text-center text-sm text-gray-600">
        <p className="container mx-auto">
          © {new Date().getFullYear()} The Third Umpire - Real-time Cricket Scoring
        </p>
      </footer>
    </div>
  );
};

export default Layout;
