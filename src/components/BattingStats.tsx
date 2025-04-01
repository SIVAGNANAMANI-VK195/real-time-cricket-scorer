
import { useCricket } from "../context/CricketContext";
import { Separator } from "@/components/ui/separator";
import { CricketBall } from "./icons/CricketIcons";

const BattingStats = () => {
  const { match, getBattingTeam, getCurrentInningsData, getCurrentBatsmen, getPlayerById } = useCricket();

  if (!match) {
    return null;
  }

  const inningsData = getCurrentInningsData();
  const battingTeam = getBattingTeam();
  const { striker, nonStriker } = getCurrentBatsmen();

  if (!inningsData || !battingTeam) {
    return null;
  }

  // Extract batting stats and sort by batting order
  const battingStats = Object.values(inningsData.battingStats).sort((a, b) => {
    // First, sort active batsmen to the top
    const aIsActive = striker?.id === a.playerId || nonStriker?.id === a.playerId;
    const bIsActive = striker?.id === b.playerId || nonStriker?.id === b.playerId;
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Then sort by total runs (descending)
    return b.runs - a.runs;
  });

  // Calculate total balls faced by each batsman
  const totalBallsFaced = battingStats.reduce((total, stat) => total + stat.ballsFaced, 0);

  return (
    <div className="space-y-4">
      {battingStats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No batting stats available yet
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
            <div className="col-span-2">Batter</div>
            <div className="text-center">R</div>
            <div className="text-center">B</div>
            <div className="text-center">4s</div>
            <div className="text-center">6s</div>
            <div className="text-center">SR</div>
          </div>

          <Separator />

          {battingStats.map((stat) => {
            const player = getPlayerById(match.battingTeam, stat.playerId);
            if (!player) return null;

            const isActive = striker?.id === stat.playerId || nonStriker?.id === stat.playerId;
            const isStriker = striker?.id === stat.playerId;
            
            // Calculate strike rate
            const strikeRate = stat.ballsFaced > 0 
              ? Math.round((stat.runs / stat.ballsFaced) * 100) 
              : 0;

            return (
              <div key={stat.playerId} className="space-y-1">
                <div className={`grid grid-cols-7 gap-2 text-sm py-1 px-2 rounded ${isActive ? 'bg-cricket-pitch/10' : ''}`}>
                  <div className="col-span-2 flex items-center">
                    <div className="font-medium truncate flex items-center">
                      {isStriker && (
                        <CricketBall className="inline-block h-3 w-3 mr-1 text-cricket-pitch" />
                      )}
                      {player.name}
                      <span className="text-xs ml-1">
                        {player.isCaptain ? "(c)" : ""}
                        {player.isWicketkeeper ? "(wk)" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-center font-semibold">{stat.runs}</div>
                  <div className="text-center">{stat.ballsFaced}</div>
                  <div className="text-center">{stat.fours}</div>
                  <div className="text-center">{stat.sixes}</div>
                  <div className="text-center">{strikeRate}</div>
                </div>
                
                {stat.isOut && (
                  <div className="text-xs text-muted-foreground px-2">
                    {stat.wicketType === 'bowled' && 'b '}
                    {stat.wicketType === 'caught' && 'c & b '}
                    {stat.wicketType === 'lbw' && 'lbw '}
                    {stat.wicketType === 'stumped' && 'st '}
                    {stat.wicketType === 'run_out' && 'run out '}
                    {stat.wicketType === 'hit_wicket' && 'hit wicket '}
                    {stat.bowlerId && getPlayerById(match.battingTeam === 'team1' ? 'team2' : 'team1', stat.bowlerId)?.name}
                  </div>
                )}
                <Separator />
              </div>
            );
          })}

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Runs</div>
              <div className="font-semibold">{inningsData.totalRuns}</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Team Strike Rate</div>
              <div className="font-semibold">
                {totalBallsFaced > 0 
                  ? ((inningsData.totalRuns / totalBallsFaced) * 100).toFixed(2)
                  : "0.00"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BattingStats;
