
import { useState } from "react";
import { useCricket } from "../context/CricketContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Coins, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { TossDecision } from "@/types/cricket";

const Toss = () => {
  const { match, performToss } = useCricket();
  const navigate = useNavigate();
  
  const [tossWinner, setTossWinner] = useState<'team1' | 'team2' | null>(null);
  const [decision, setDecision] = useState<TossDecision | null>(null);
  const [flipping, setFlipping] = useState(false);
  
  if (!match) {
    navigate("/");
    return null;
  }
  
  const handleTossClick = () => {
    setFlipping(true);
    
    // Simulate coin flip
    setTimeout(() => {
      // Random toss winner
      const winner = Math.random() > 0.5 ? 'team1' : 'team2';
      setTossWinner(winner);
      setFlipping(false);
      
      toast.success(`${match.teams[winner].name} won the toss!`);
    }, 2000);
  };
  
  const handleDecisionConfirm = () => {
    if (!tossWinner || !decision) {
      toast.error("Please complete the toss process");
      return;
    }
    
    performToss(tossWinner, decision);
    navigate("/match");
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Match Toss</h1>
      
      <Card className="bg-white/50 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle>Coin Toss</CardTitle>
          <CardDescription>Decide which team will bat or bowl first</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className={`h-28 w-28 ${flipping ? 'animate-spin' : ''}`}>
              <Coins
                size={flipping ? 96 : 112}
                className={`text-amber-500 transition-all duration-300 ${flipping ? 'opacity-70' : 'opacity-100'}`}
              />
            </div>
            
            {!tossWinner ? (
              <Button
                className="bg-cricket-accent hover:bg-cricket-accent/90 text-white"
                onClick={handleTossClick}
                disabled={flipping}
              >
                Flip Coin
              </Button>
            ) : (
              <div className="text-center space-y-6 w-full max-w-md">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">
                    {match.teams[tossWinner].name} won the toss!
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">What will they do?</h3>
                  
                  <RadioGroup value={decision || ''} onValueChange={(v) => setDecision(v as TossDecision)}>
                    <div className="flex space-x-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value="bat" id="bat" />
                        <Label htmlFor="bat" className="flex-1 py-3 pl-2 border rounded-md cursor-pointer hover:bg-muted/50">
                          Bat First
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value="bowl" id="bowl" />
                        <Label htmlFor="bowl" className="flex-1 py-3 pl-2 border rounded-md cursor-pointer hover:bg-muted/50">
                          Bowl First
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <Button
                    className="w-full bg-cricket-pitch hover:bg-cricket-pitch/90"
                    onClick={handleDecisionConfirm}
                    disabled={!decision}
                  >
                    Confirm Decision
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex">
        <Button variant="outline" onClick={() => navigate("/setup")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Setup
        </Button>
      </div>
    </div>
  );
};

export default Toss;
