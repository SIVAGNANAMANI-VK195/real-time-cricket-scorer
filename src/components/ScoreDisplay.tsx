
import { useCricket } from "../context/CricketContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CricketBall } from "lucide-react";

const ScoreDisplay = () => {
  const { match, getBattingTeam, getBowlingTeam, getCurrentInningsData } = useCricket();

  if (!match) {
    return null;
  }

  const inningsData = getCurrentInningsData();
  const battingTeam = getBattingTeam();
  const bowlingTeam = getBowlingTeam();

  if (!inningsData || !battingTeam || !bowlingTeam) {
    return null;
  }

  const completedOvers = inningsData.currentBall === 0 
    ? inningsData.currentOver 
    : inningsData.currentOver;
  
  const currentBall = inningsData.currentBall === 0 ? 0 : inningsData.currentBall;

  // Format overs as whole numbers and decimals
  const oversDisplay = currentBall === 0 
    ? `${completedOvers}` 
    : `${completedOvers}.${currentBall}`;

  return (
    <Card className="border-2 border-cricket-pitch/20 bg-white/50 backdrop-blur-md">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="rounded-full bg-cricket-pitch/10 px-3 py-1 text-sm font-medium">
              {match.currentInnings === 1 ? "1st Innings" : "2nd Innings"}
            </div>
            <div className="rounded-full bg-black/5 px-3 py-1 text-sm">
              {match.totalOvers} Overs Match
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="text-lg font-semibold">{battingTeam.name}</div>
              <div className="score-display">
                {inningsData.totalRuns}/{inningsData.wickets}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-end">
              <div className="text-lg font-semibold">{bowlingTeam.name}</div>
              <div className="text-3xl md:text-5xl font-semibold text-muted-foreground">
                {oversDisplay} <span className="text-base font-normal">ov</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 6 }).map((_, ballIndex) => {
              // Only show balls up to the current ball for the current over
              const isCurrentOver = inningsData.currentOver === completedOvers;
              const isValidBall = !isCurrentOver || ballIndex < currentBall;
              
              if (!isValidBall) {
                return (
                  <div
                    key={ballIndex}
                    className="h-6 w-6 rounded-full border border-dashed border-gray-300"
                  />
                );
              }
              
              // Find the last 6 balls
              const ballsInCurrentOver = inningsData.balls.filter(
                (ball) => ball.over === completedOvers
              );
              
              const ball = ballsInCurrentOver[ballIndex];
              
              if (!ball) {
                return (
                  <div
                    key={ballIndex}
                    className="h-6 w-6 rounded-full border border-dashed border-gray-300"
                  />
                );
              }
              
              // Determine the color and content of the ball
              let bgColor = "bg-gray-200";
              let content = ball.runs;
              
              if (ball.isWicket) {
                bgColor = "bg-cricket-wicket text-white";
                content = "W";
              } else if (ball.extraType === "wide") {
                bgColor = "bg-cricket-sky text-white";
                content = "Wd";
              } else if (ball.extraType === "no_ball") {
                bgColor = "bg-cricket-accent text-white";
                content = "Nb";
              } else if (ball.extraType === "bye" || ball.extraType === "leg_bye") {
                bgColor = "bg-gray-400 text-white";
                content = ball.extraType === "bye" ? "B" : "Lb";
              } else if (ball.runs === 4) {
                bgColor = "bg-cricket-boundary text-white";
              } else if (ball.runs === 6) {
                bgColor = "bg-cricket-boundary text-white";
              } else if (ball.runs === 0) {
                bgColor = "bg-gray-200";
                content = "•";
              }
              
              return (
                <div
                  key={ballIndex}
                  className={`h-6 w-6 rounded-full ${bgColor} flex items-center justify-center text-xs font-medium`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDisplay;
