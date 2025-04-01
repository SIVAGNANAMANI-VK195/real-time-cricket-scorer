
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CricketBall, Home } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <CricketBall className="h-24 w-24 mx-auto text-cricket-pitch animate-ball-spin" />
        </div>
        <h1 className="text-5xl font-bold mb-4 text-cricket-pitch">Howzat?</h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for seems to have been hit for a six! It's gone beyond the boundary.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-cricket-pitch hover:bg-cricket-pitch/90"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
