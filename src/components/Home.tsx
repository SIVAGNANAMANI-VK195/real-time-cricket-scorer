
import { useState } from "react";
import { useCricket } from "../context/CricketContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CricketBall } from "./icons/CricketIcons";
import { PlusCircle, Users2, Trophy } from "lucide-react";
import { toast } from "sonner";

const Home = () => {
  const { createMatch, joinMatch } = useCricket();
  const navigate = useNavigate();
  
  const [matchCode, setMatchCode] = useState("");
  const [overs, setOvers] = useState("20");
  
  const handleCreateMatch = () => {
    const oversNumber = parseInt(overs);
    if (isNaN(oversNumber) || oversNumber < 1) {
      toast.error("Please enter a valid number of overs");
      return;
    }
    
    createMatch(oversNumber);
    navigate("/setup");
  };
  
  const handleJoinMatch = async () => {
    if (!matchCode.trim()) {
      toast.error("Please enter a match code");
      return;
    }
    
    const joined = await joinMatch(matchCode.trim().toUpperCase());
    if (joined) {
      navigate("/match");
    } else {
      toast.error("Invalid match code");
    }
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border-2 border-cricket-pitch/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-cricket-pitch flex items-center justify-center">
            <CricketBall className="text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">The Third Umpire</CardTitle>
          <CardDescription>Real-time cricket scoring app</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Match</TabsTrigger>
              <TabsTrigger value="join">Join Match</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="overs" className="block text-sm font-medium mb-1">
                    Number of Overs
                  </label>
                  <Input 
                    id="overs" 
                    type="number" 
                    min="1"
                    placeholder="20"
                    value={overs}
                    onChange={(e) => setOvers(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full bg-cricket-pitch hover:bg-cricket-pitch/90"
                  onClick={handleCreateMatch}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Match
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="join" className="space-y-4">
              <div>
                <label htmlFor="matchCode" className="block text-sm font-medium mb-1">
                  Enter Match Code
                </label>
                <Input 
                  id="matchCode" 
                  placeholder="e.g. ABC123"
                  value={matchCode}
                  onChange={(e) => setMatchCode(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full bg-cricket-sky hover:bg-cricket-sky/90"
                onClick={handleJoinMatch}
              >
                <Users2 className="mr-2 h-4 w-4" />
                Join as Spectator
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3" />
            <span>Create or join a match to get started</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;
