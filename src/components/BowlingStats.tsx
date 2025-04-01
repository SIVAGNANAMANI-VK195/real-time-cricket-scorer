
import { useCricket } from "../context/CricketContext";
import { Separator } from "@/components/ui/separator";
import { CricketBall } from "./icons/CricketIcons";

const BowlingStats = () => {
  const { match, getBowlingTeam, getCurrentInningsData, getCurrentBowler, getPlayerById } = useCricket();

  if (!match) {
    return null;
  }

  const inningsData = getCurrentInningsData();
  const bowlingTeam = getBowlingTeam();
  const currentBowler = getCurrentBowler();

  if (!inningsData || !bowlingTeam) {
    return null;
  }

  // Extract bowling stats and sort by wickets, then economy
  const bowlingStats = Object.values(inningsData.bowlingStats).sort((a, b) => {
    if (b.wickets !== a.wickets) {
      return b.wickets - a.wickets;
    }
    return a.economy - b.economy;
  });

  return (
    <div className="space-y-4">
      {bowlingStats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No bowling stats available yet
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
            <div className="col-span-2">Bowler</div>
            <div className="text-center">O</div>
            <div className="text-center">M</div>
            <div className="text-center">R</div>
            <div className="text-center">W</div>
            <div className="text-center">Econ</div>
          </div>

          <Separator />

          {bowlingStats.map((stat) => {
            const player = getPlayerById(match.battingTeam === 'team1' ? 'team2' : 'team1', stat.playerId);
            if (!player) return null;

            const isCurrentBowler = currentBowler?.id === stat.playerId;
            
            // Calculate balls in the current over
            const ballsInCurrentOver = inningsData.currentBowler === stat.playerId
              ? inningsData.currentBall
              : 0;
            
            // Format overs as whole numbers and decimals (e.g., 4.2 for 4 overs and 2 balls)
            const oversDisplay = 
              stat.overs + (ballsInCurrentOver > 0 ? `.${ballsInCurrentOver}` : '');

            return (
              <div key={stat.playerId}>
                <div className={`grid grid-cols-7 gap-2 text-sm py-2 px-2 rounded ${isCurrentBowler ? 'bg-cricket-sky/10' : ''}`}>
                  <div className="col-span-2 font-medium truncate flex items-center">
                    {isCurrentBowler && (
                      <CricketBall className="inline-block h-3 w-3 mr-1 text-cricket-sky" />
                    )}
                    {player.name}
                    <span className="text-xs ml-1">
                      {player.isCaptain ? "(c)" : ""}
                      {player.isWicketkeeper ? "(wk)" : ""}
                    </span>
                  </div>
                  <div className="text-center">{oversDisplay}</div>
                  <div className="text-center">{stat.maidens}</div>
                  <div className="text-center">{stat.runs}</div>
                  <div className="text-center font-semibold">{stat.wickets}</div>
                  <div className="text-center">{stat.economy.toFixed(1)}</div>
                </div>
                <Separator />
              </div>
            );
          })}

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Wickets</div>
              <div className="font-semibold">{inningsData.wickets}</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Economy Rate</div>
              <div className="font-semibold">
                {inningsData.currentOver > 0 
                  ? (inningsData.totalRuns / (inningsData.currentOver + inningsData.currentBall / 6)).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Overs Bowled</div>
              <div className="font-semibold">
                {inningsData.currentOver}.{inningsData.currentBall}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BowlingStats;
