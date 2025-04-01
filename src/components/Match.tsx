
import { useCricket } from "../context/CricketContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Waves,
  CornerUpRight,
  RefreshCcw,
  CheckSquare,
  User2,
  ArrowDown,
  Shield,
  Ban,
  Pause,
  Play,
} from "lucide-react";
import { useState } from "react";
import { BallType, WicketType } from "@/types/cricket";
import ScoreDisplay from "./ScoreDisplay";
import BattingStats from "./BattingStats";
import BowlingStats from "./BowlingStats";

const Match = () => {
  const {
    match,
    viewMode,
    addRuns,
    addExtra,
    addWicket,
    undoLastBall,
    changeBowler,
    changeStriker,
    changeNonStriker,
    getBattingTeam,
    getBowlingTeam,
    getCurrentBatsmen,
    getCurrentBowler,
    getCurrentInningsData,
    startInnings,
    endInnings,
  } = useCricket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("score");
  const [wicketType, setWicketType] = useState<string>("bowled");

  if (!match) {
    navigate("/");
    return null;
  }

  const inningsData = getCurrentInningsData();
  const battingTeam = getBattingTeam();
  const bowlingTeam = getBowlingTeam();
  const { striker, nonStriker } = getCurrentBatsmen();
  const currentBowler = getCurrentBowler();

  const availableBatsmen = battingTeam?.players.filter(
    (player) =>
      player.id !== striker?.id &&
      player.id !== nonStriker?.id &&
      (!inningsData?.battingStats[player.id] ||
        !inningsData.battingStats[player.id].isOut)
  );

  const availableBowlers = bowlingTeam?.players;

  const handleWicket = () => {
    addWicket(wicketType);
  };

  const renderMatchControls = () => {
    if (match.status === 'setup' || match.status === 'toss') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Button
            className="bg-cricket-pitch hover:bg-cricket-pitch/90"
            onClick={startInnings}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Innings
          </Button>
        </div>
      );
    }

    // Check if innings is completed
    if (
      inningsData &&
      (inningsData.wickets === 10 ||
        (inningsData.currentOver >= match.totalOvers && inningsData.currentBall === 0) ||
        (match.currentInnings === 2 && 
         inningsData.totalRuns > match.innings.first.totalRuns))
    ) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Button
            className="bg-cricket-accent hover:bg-cricket-accent/90"
            onClick={endInnings}
          >
            {match.currentInnings === 1 ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                End First Innings
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Complete Match
              </>
            )}
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Batsmen</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={striker?.id || ""}
                onValueChange={(value) => changeStriker(value === "" ? undefined : value)}
              >
                <SelectTrigger className="w-full" disabled={!availableBatsmen?.length}>
                  <SelectValue placeholder="Select striker" />
                </SelectTrigger>
                <SelectContent>
                  {striker && (
                    <SelectItem value="">Remove striker</SelectItem>
                  )}
                  {availableBatsmen?.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                      {player.isCaptain ? " (C)" : ""}
                      {player.isWicketkeeper ? " (WK)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={nonStriker?.id || ""}
                onValueChange={(value) => changeNonStriker(value === "" ? undefined : value)}
              >
                <SelectTrigger className="w-full" disabled={!availableBatsmen?.length}>
                  <SelectValue placeholder="Select non-striker" />
                </SelectTrigger>
                <SelectContent>
                  {nonStriker && (
                    <SelectItem value="">Remove non-striker</SelectItem>
                  )}
                  {availableBatsmen?.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                      {player.isCaptain ? " (C)" : ""}
                      {player.isWicketkeeper ? " (WK)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Bowler</h3>
            
            <Select
              value={currentBowler?.id || ""}
              onValueChange={(value) => changeBowler(value)}
            >
              <SelectTrigger className="w-full" disabled={!availableBowlers?.length}>
                <SelectValue placeholder="Select bowler" />
              </SelectTrigger>
              <SelectContent>
                {availableBowlers?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                    {player.isCaptain ? " (C)" : ""}
                    {player.isWicketkeeper ? " (WK)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <Button 
              onClick={() => addRuns(0)} 
              variant="outline"
              className="text-lg font-semibold hover:bg-muted"
            >
              0
            </Button>
            <Button 
              onClick={() => addRuns(1)} 
              variant="outline"
              className="text-lg font-semibold text-cricket-pitch hover:bg-cricket-pitch/10"
            >
              1
            </Button>
            <Button 
              onClick={() => addRuns(2)} 
              variant="outline"
              className="text-lg font-semibold text-cricket-pitch hover:bg-cricket-pitch/10"
            >
              2
            </Button>
            <Button 
              onClick={() => addRuns(3)} 
              variant="outline"
              className="text-lg font-semibold text-cricket-pitch hover:bg-cricket-pitch/10"
            >
              3
            </Button>
            <Button 
              onClick={() => addRuns(4)} 
              variant="outline"
              className="text-lg font-semibold text-cricket-boundary hover:bg-cricket-boundary/10"
            >
              4
            </Button>
            <Button 
              onClick={() => addRuns(6)} 
              variant="outline"
              className="text-lg font-semibold text-cricket-boundary hover:bg-cricket-boundary/10"
            >
              6
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              onClick={() => addExtra("wide", 1)}
              variant="outline"
              className="text-cricket-sky"
            >
              <Waves className="mr-2 h-4 w-4" />
              Wide
            </Button>
            <Button
              onClick={() => addExtra("no_ball", 1)}
              variant="outline"
              className="text-cricket-accent"
            >
              <Ban className="mr-2 h-4 w-4" />
              No Ball
            </Button>
            <Button
              onClick={() => addExtra("bye", 1)}
              variant="outline"
              className="text-gray-500"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Bye
            </Button>
            <Button
              onClick={() => addExtra("leg_bye", 1)}
              variant="outline"
              className="text-gray-500"
            >
              <CornerUpRight className="mr-2 h-4 w-4" />
              Leg Bye
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={wicketType}
              onValueChange={(value) => setWicketType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wicket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bowled">Bowled</SelectItem>
                <SelectItem value="caught">Caught</SelectItem>
                <SelectItem value="lbw">LBW</SelectItem>
                <SelectItem value="stumped">Stumped</SelectItem>
                <SelectItem value="run_out">Run Out</SelectItem>
                <SelectItem value="hit_wicket">Hit Wicket</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleWicket}
              className="bg-cricket-wicket hover:bg-cricket-wicket/90 text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Wicket
            </Button>
          </div>
          
          <Button
            onClick={undoLastBall}
            variant="outline"
            className="w-full"
            disabled={!inningsData || inningsData.balls.length === 0}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Undo Last Ball
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <ScoreDisplay />
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Match Center</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="score">Scorecard</TabsTrigger>
              <TabsTrigger value="batting">Batting</TabsTrigger>
              <TabsTrigger value="bowling">Bowling</TabsTrigger>
            </TabsList>
            
            <TabsContent value="score" className="space-y-4 pt-4">
              {viewMode === 'umpire' && (
                <div className="space-y-4">
                  {renderMatchControls()}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Current Run Rate</div>
                  <div className="text-xl font-semibold">
                    {inningsData && inningsData.currentOver > 0
                      ? (inningsData.totalRuns / 
                         (inningsData.currentOver + inningsData.currentBall / 6)).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
                
                {match.currentInnings === 2 && (
                  <div className="bg-cricket-accent/10 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-xl font-semibold">
                      {match.innings.first.totalRuns + 1}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {match.innings.second.totalRuns > 0 ? 
                        `Needs ${match.innings.first.totalRuns + 1 - match.innings.second.totalRuns} runs from ${
                          (match.totalOvers * 6) - ((match.innings.second.currentOver * 6) + match.innings.second.currentBall)
                        } balls` : 
                        `To win`
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="batting" className="pt-4">
              <BattingStats />
            </TabsContent>
            
            <TabsContent value="bowling" className="pt-4">
              <BowlingStats />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Match;
