
import { useState } from "react";
import { useCricket } from "../context/CricketContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trash2, UserPlus, Shield, X, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TeamSetup = () => {
  const { match, setTeamName, addPlayer, removePlayer, toggleCaptain, toggleWicketkeeper } = useCricket();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("team1");
  const [playerName, setPlayerName] = useState("");
  
  if (!match) {
    navigate("/");
    return null;
  }
  
  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    
    addPlayer(activeTab as 'team1' | 'team2', playerName.trim());
    setPlayerName("");
  };
  
  const handleContinue = () => {
    const team1 = match.teams.team1;
    const team2 = match.teams.team2;
    
    if (team1.players.length < 2 || team2.players.length < 2) {
      toast.error("Each team must have at least 2 players");
      return;
    }
    
    if (!team1.players.some(p => p.isCaptain) || !team2.players.some(p => p.isCaptain)) {
      toast.error("Each team must have a captain");
      return;
    }
    
    if (!team1.players.some(p => p.isWicketkeeper) || !team2.players.some(p => p.isWicketkeeper)) {
      toast.error("Each team must have a wicketkeeper");
      return;
    }
    
    navigate("/toss");
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Team Setup</h1>
      <Card className="bg-white/50 backdrop-blur-md">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Configure Teams</CardTitle>
            <div className="text-sm bg-cricket-pitch/10 px-3 py-1 rounded-full">
              Match Code: <span className="font-mono font-bold">{match.code}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="team1" className="data-[state=active]:bg-cricket-team1 data-[state=active]:text-white">
                <div className="flex items-center">
                  {match.teams.team1.name}
                </div>
              </TabsTrigger>
              <TabsTrigger value="team2" className="data-[state=active]:bg-cricket-team2 data-[state=active]:text-white">
                <div className="flex items-center">
                  {match.teams.team2.name}
                </div>
              </TabsTrigger>
            </TabsList>
            
            {['team1', 'team2'].map((teamId) => (
              <TabsContent key={teamId} value={teamId} className="space-y-6">
                <div>
                  <label htmlFor={`${teamId}-name`} className="block text-sm font-medium mb-1">
                    Team Name
                  </label>
                  <Input 
                    id={`${teamId}-name`}
                    value={match.teams[teamId as 'team1' | 'team2'].name}
                    onChange={(e) => setTeamName(teamId as 'team1' | 'team2', e.target.value)}
                    placeholder="Enter team name"
                    className="mb-4"
                  />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Input 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddPlayer();
                        }
                      }}
                    />
                    <Button onClick={handleAddPlayer} className="shrink-0">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="py-3 px-4 border-b bg-muted/50 flex justify-between">
                      <div className="font-medium">Players</div>
                      <div className="text-sm text-muted-foreground">
                        {match.teams[teamId as 'team1' | 'team2'].players.length} added
                      </div>
                    </div>
                    {match.teams[teamId as 'team1' | 'team2'].players.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Users className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                        <p>No players added yet</p>
                        <p className="text-sm">Add players to the team</p>
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {match.teams[teamId as 'team1' | 'team2'].players.map((player) => (
                          <li key={player.id} className="py-3 px-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{player.name}</span>
                              {player.isCaptain && (
                                <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">C</span>
                              )}
                              {player.isWicketkeeper && (
                                <span className="bg-cricket-sky text-white text-xs px-1.5 py-0.5 rounded-full">WK</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className={player.isCaptain ? "text-amber-500" : ""}
                                onClick={() => toggleCaptain(teamId as 'team1' | 'team2', player.id)}
                                title="Set as Captain"
                              >
                                <Crown className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={player.isWicketkeeper ? "text-cricket-sky" : ""}
                                onClick={() => toggleWicketkeeper(teamId as 'team1' | 'team2', player.id)}
                                title="Set as Wicketkeeper"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                                onClick={() => removePlayer(teamId as 'team1' | 'team2', player.id)}
                                title="Remove Player"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/")}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleContinue} className="bg-cricket-pitch hover:bg-cricket-pitch/90">
          Continue to Toss
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TeamSetup;
