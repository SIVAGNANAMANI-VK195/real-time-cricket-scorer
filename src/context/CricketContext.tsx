
import React, { createContext, useContext, useEffect, useState } from "react";
import { Match, Player, Team, ViewMode, BallData, TossDecision, BattingStats, BowlingStats } from "../types/cricket";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Define the context type
interface CricketContextType {
  match: Match | null;
  viewMode: ViewMode;
  isLoading: boolean;
  // Match creation
  createMatch: (totalOvers: number) => void;
  // Team management
  setTeamName: (teamId: 'team1' | 'team2', name: string) => void;
  addPlayer: (teamId: 'team1' | 'team2', name: string) => void;
  removePlayer: (teamId: 'team1' | 'team2', playerId: string) => void;
  toggleCaptain: (teamId: 'team1' | 'team2', playerId: string) => void;
  toggleWicketkeeper: (teamId: 'team1' | 'team2', playerId: string) => void;
  // Toss
  performToss: (winningTeam: 'team1' | 'team2', decision: TossDecision) => void;
  // Scoring
  addRuns: (runs: number) => void;
  addExtra: (extraType: 'wide' | 'no_ball' | 'bye' | 'leg_bye', runs: number) => void;
  addWicket: (wicketType: string, playerId?: string) => void;
  undoLastBall: () => void;
  // Player management
  changeBowler: (playerId: string) => void;
  changeStriker: (playerId?: string) => void;
  changeNonStriker: (playerId?: string) => void;
  // Match state
  startInnings: () => void;
  endInnings: () => void;
  joinMatch: (matchCode: string) => Promise<boolean>;
  setViewMode: (mode: ViewMode) => void;
  // Utility functions
  getCurrentBowler: () => Player | null;
  getCurrentBatsmen: () => { striker: Player | null; nonStriker: Player | null };
  getBattingTeam: () => Team | null;
  getBowlingTeam: () => Team | null;
  getCurrentInningsData: () => {
    balls: BallData[];
    totalRuns: number;
    wickets: number;
    currentOver: number;
    currentBall: number;
    battingStats: Record<string, BattingStats>;
    bowlingStats: Record<string, BowlingStats>;
    striker: string | null;
    nonStriker: string | null;
    currentBowler: string | null;
  } | null;
  getPlayerById: (teamId: 'team1' | 'team2', playerId: string) => Player | undefined;
}

// Create context with default value
const CricketContext = createContext<CricketContextType | undefined>(undefined);

// Initial empty match template
const createEmptyMatch = (totalOvers: number): Match => {
  const matchId = uuidv4();
  const matchCode = generateMatchCode();
  
  return {
    id: matchId,
    code: matchCode,
    status: 'setup',
    teams: {
      team1: { id: 'team1', name: 'Team A', players: [] },
      team2: { id: 'team2', name: 'Team B', players: [] }
    },
    toss: null,
    totalOvers,
    currentInnings: 1,
    battingTeam: 'team1',
    innings: {
      first: {
        balls: [],
        currentOver: 0,
        currentBall: 0,
        totalRuns: 0,
        wickets: 0,
        battingStats: {},
        bowlingStats: {},
        striker: null,
        nonStriker: null,
        currentBowler: null
      },
      second: {
        balls: [],
        currentOver: 0,
        currentBall: 0,
        totalRuns: 0,
        wickets: 0,
        battingStats: {},
        bowlingStats: {},
        striker: null,
        nonStriker: null,
        currentBowler: null
      }
    },
    created: Date.now(),
    updated: Date.now()
  };
};

// Helper to generate a unique match code
const generateMatchCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Provider component
export const CricketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('umpire');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load match from localStorage on mount
  useEffect(() => {
    const savedMatch = localStorage.getItem('cricketMatch');
    if (savedMatch) {
      try {
        setMatch(JSON.parse(savedMatch));
      } catch (error) {
        console.error("Error loading match data:", error);
      }
    }
  }, []);

  // Save match to localStorage whenever it changes
  useEffect(() => {
    if (match) {
      localStorage.setItem('cricketMatch', JSON.stringify(match));
    }
  }, [match]);

  // Create a new match
  const createMatch = (totalOvers: number) => {
    const newMatch = createEmptyMatch(totalOvers);
    setMatch(newMatch);
    toast.success(`Match created! Share code: ${newMatch.code}`);
  };

  // Team management functions
  const setTeamName = (teamId: 'team1' | 'team2', name: string) => {
    if (!match) return;
    
    setMatch(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: {
            ...prev.teams[teamId],
            name
          }
        }
      };
    });
  };

  const addPlayer = (teamId: 'team1' | 'team2', name: string) => {
    if (!match) return;
    
    const newPlayer: Player = {
      id: uuidv4(),
      name,
      isCaptain: false,
      isWicketkeeper: false
    };
    
    setMatch(prev => {
      if (!prev) return prev;
      
      const updatedTeam = {
        ...prev.teams[teamId],
        players: [...prev.teams[teamId].players, newPlayer]
      };
      
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: updatedTeam
        }
      };
    });
  };

  const removePlayer = (teamId: 'team1' | 'team2', playerId: string) => {
    if (!match) return;
    
    setMatch(prev => {
      if (!prev) return prev;
      
      const updatedPlayers = prev.teams[teamId].players.filter(
        player => player.id !== playerId
      );
      
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: {
            ...prev.teams[teamId],
            players: updatedPlayers
          }
        }
      };
    });
  };

  const toggleCaptain = (teamId: 'team1' | 'team2', playerId: string) => {
    if (!match) return;
    
    setMatch(prev => {
      if (!prev) return prev;
      
      const updatedPlayers = prev.teams[teamId].players.map(player => ({
        ...player,
        isCaptain: player.id === playerId ? true : false
      }));
      
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: {
            ...prev.teams[teamId],
            players: updatedPlayers
          }
        }
      };
    });
  };

  const toggleWicketkeeper = (teamId: 'team1' | 'team2', playerId: string) => {
    if (!match) return;
    
    setMatch(prev => {
      if (!prev) return prev;
      
      const updatedPlayers = prev.teams[teamId].players.map(player => ({
        ...player,
        isWicketkeeper: player.id === playerId ? true : false
      }));
      
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: {
            ...prev.teams[teamId],
            players: updatedPlayers
          }
        }
      };
    });
  };

  // Toss functions
  const performToss = (winningTeam: 'team1' | 'team2', decision: TossDecision) => {
    if (!match) return;
    
    let battingTeam: 'team1' | 'team2';
    
    if (decision === 'bat') {
      battingTeam = winningTeam;
    } else {
      battingTeam = winningTeam === 'team1' ? 'team2' : 'team1';
    }
    
    setMatch(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        status: 'toss',
        toss: {
          winner: winningTeam,
          decision
        },
        battingTeam
      };
    });
    
    toast.success(`${match.teams[winningTeam].name} won the toss and chose to ${decision}`);
  };

  // Scoring functions
  const addRuns = (runs: number) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const currentInnings = match.innings[inningsKey];
    
    // Validate if we can add runs
    if (
      !currentInnings.striker ||
      !currentInnings.nonStriker ||
      !currentInnings.currentBowler
    ) {
      toast.error("Please select bowler and batsmen first");
      return;
    }
    
    // Create ball data
    const ballData: BallData = {
      id: uuidv4(),
      over: currentInnings.currentOver,
      ball: currentInnings.currentBall + 1,
      batsmanId: currentInnings.striker,
      bowlerId: currentInnings.currentBowler,
      runs,
      extras: 0,
      isWicket: false,
      timestamp: Date.now()
    };
    
    // Update batting stats
    const updatedBattingStats = { ...currentInnings.battingStats };
    if (!updatedBattingStats[currentInnings.striker]) {
      updatedBattingStats[currentInnings.striker] = {
        playerId: currentInnings.striker,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        dotBalls: 0,
        isOut: false
      };
    }
    
    // Update current batsman stats
    updatedBattingStats[currentInnings.striker] = {
      ...updatedBattingStats[currentInnings.striker],
      runs: updatedBattingStats[currentInnings.striker].runs + runs,
      ballsFaced: updatedBattingStats[currentInnings.striker].ballsFaced + 1,
      fours: runs === 4 ? updatedBattingStats[currentInnings.striker].fours + 1 : updatedBattingStats[currentInnings.striker].fours,
      sixes: runs === 6 ? updatedBattingStats[currentInnings.striker].sixes + 1 : updatedBattingStats[currentInnings.striker].sixes,
      dotBalls: runs === 0 ? updatedBattingStats[currentInnings.striker].dotBalls + 1 : updatedBattingStats[currentInnings.striker].dotBalls
    };
    
    // Update bowling stats
    const updatedBowlingStats = { ...currentInnings.bowlingStats };
    if (!updatedBowlingStats[currentInnings.currentBowler]) {
      updatedBowlingStats[currentInnings.currentBowler] = {
        playerId: currentInnings.currentBowler,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        dots: 0
      };
    }
    
    // Update current bowler stats
    const bowlerRuns = updatedBowlingStats[currentInnings.currentBowler].runs + runs;
    const bowlerBalls = (updatedBowlingStats[currentInnings.currentBowler].overs * 6) + 
                      (currentInnings.currentBall + 1) % 6;
    
    updatedBowlingStats[currentInnings.currentBowler] = {
      ...updatedBowlingStats[currentInnings.currentBowler],
      runs: bowlerRuns,
      dots: runs === 0 ? updatedBowlingStats[currentInnings.currentBowler].dots + 1 : updatedBowlingStats[currentInnings.currentBowler].dots,
      economy: parseFloat((bowlerRuns / (bowlerBalls / 6)).toFixed(2))
    };
    
    // Determine if over is complete
    let newOver = currentInnings.currentOver;
    let nextBallNumber = (currentInnings.currentBall + 1) % 6;
    
    // If over is complete, increment over and reset ball count
    if (nextBallNumber === 0) {
      newOver += 1;
      nextBallNumber = 0;
      
      // Update bowler's overs
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        overs: updatedBowlingStats[currentInnings.currentBowler].overs + 1
      };
      
      // Swap striker and non-striker at end of over
      const temp = currentInnings.striker;
      currentInnings.striker = currentInnings.nonStriker;
      currentInnings.nonStriker = temp;
      
      toast.info("End of over! Change bowler and swap ends");
    } else if (runs % 2 === 1) {
      // If odd runs, swap striker and non-striker
      const temp = currentInnings.striker;
      currentInnings.striker = currentInnings.nonStriker;
      currentInnings.nonStriker = temp;
    }
    
    // Update match state
    setMatch(prev => {
      if (!prev) return prev;
      
      const innings = prev.innings[inningsKey];
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...innings,
            balls: [...innings.balls, ballData],
            currentOver: newOver,
            currentBall: nextBallNumber,
            totalRuns: innings.totalRuns + runs,
            battingStats: updatedBattingStats,
            bowlingStats: updatedBowlingStats,
            striker: currentInnings.striker,
            nonStriker: currentInnings.nonStriker
          }
        },
        updated: Date.now()
      };
    });
    
    const runsText = runs === 0 ? "Dot ball" : `${runs} run${runs > 1 ? 's' : ''}`;
    toast.success(runsText);
  };

  const addExtra = (extraType: 'wide' | 'no_ball' | 'bye' | 'leg_bye', runs: number) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const currentInnings = match.innings[inningsKey];
    
    // Validate if we can add extras
    if (!currentInnings.currentBowler) {
      toast.error("Please select a bowler first");
      return;
    }
    
    // Create ball data
    const ballData: BallData = {
      id: uuidv4(),
      over: currentInnings.currentOver,
      ball: extraType === 'wide' || extraType === 'no_ball' ? currentInnings.currentBall : currentInnings.currentBall + 1,
      batsmanId: currentInnings.striker || '',
      bowlerId: currentInnings.currentBowler,
      runs: 0,
      extras: runs,
      extraType: extraType,
      isWicket: false,
      timestamp: Date.now()
    };
    
    // Update bowling stats
    const updatedBowlingStats = { ...currentInnings.bowlingStats };
    if (!updatedBowlingStats[currentInnings.currentBowler]) {
      updatedBowlingStats[currentInnings.currentBowler] = {
        playerId: currentInnings.currentBowler,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        dots: 0
      };
    }
    
    // Add runs to bowler except for byes and leg byes
    if (extraType === 'wide' || extraType === 'no_ball') {
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        runs: updatedBowlingStats[currentInnings.currentBowler].runs + runs
      };
    }
    
    // Update batting stats for non-wide extras
    const updatedBattingStats = { ...currentInnings.battingStats };
    if (extraType !== 'wide' && currentInnings.striker && !updatedBattingStats[currentInnings.striker]) {
      updatedBattingStats[currentInnings.striker] = {
        playerId: currentInnings.striker,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        dotBalls: 0,
        isOut: false
      };
    }
    
    // Increment balls faced for non-wide extras
    if (extraType !== 'wide' && currentInnings.striker) {
      updatedBattingStats[currentInnings.striker] = {
        ...updatedBattingStats[currentInnings.striker],
        ballsFaced: updatedBattingStats[currentInnings.striker].ballsFaced + 1
      };
    }
    
    // Determine if batsmen should be swapped
    let newStriker = currentInnings.striker;
    let newNonStriker = currentInnings.nonStriker;
    
    if (runs % 2 === 1 && currentInnings.striker && currentInnings.nonStriker) {
      newStriker = currentInnings.nonStriker;
      newNonStriker = currentInnings.striker;
    }
    
    // Determine if over is complete for non-wide/no-ball extras
    let newOver = currentInnings.currentOver;
    let nextBallNumber = extraType === 'wide' || extraType === 'no_ball' 
      ? currentInnings.currentBall 
      : (currentInnings.currentBall + 1) % 6;
    
    // If over is complete for non-wide/no-ball extras
    if (extraType !== 'wide' && extraType !== 'no_ball' && nextBallNumber === 0) {
      newOver += 1;
      nextBallNumber = 0;
      
      // Update bowler's overs
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        overs: updatedBowlingStats[currentInnings.currentBowler].overs + 1
      };
      
      // Swap striker and non-striker at end of over
      if (currentInnings.striker && currentInnings.nonStriker) {
        newStriker = currentInnings.nonStriker;
        newNonStriker = currentInnings.striker;
      }
      
      toast.info("End of over! Change bowler and swap ends");
    }
    
    // Update match state
    setMatch(prev => {
      if (!prev) return prev;
      
      const innings = prev.innings[inningsKey];
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...innings,
            balls: [...innings.balls, ballData],
            currentOver: newOver,
            currentBall: nextBallNumber,
            totalRuns: innings.totalRuns + runs,
            battingStats: updatedBattingStats,
            bowlingStats: updatedBowlingStats,
            striker: newStriker,
            nonStriker: newNonStriker
          }
        },
        updated: Date.now()
      };
    });
    
    toast.success(`${extraType.replace('_', ' ')} ${runs} run${runs > 1 ? 's' : ''}`);
  };

  const addWicket = (wicketType: string, outPlayerId?: string) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const currentInnings = match.innings[inningsKey];
    
    // Validate if we can add wicket
    if (
      !currentInnings.striker ||
      !currentInnings.nonStriker ||
      !currentInnings.currentBowler
    ) {
      toast.error("Please select bowler and batsmen first");
      return;
    }
    
    // Determine which player is out
    const outId = outPlayerId || currentInnings.striker;
    
    // Create ball data
    const ballData: BallData = {
      id: uuidv4(),
      over: currentInnings.currentOver,
      ball: currentInnings.currentBall + 1,
      batsmanId: outId,
      bowlerId: currentInnings.currentBowler,
      runs: 0,
      extras: 0,
      isWicket: true,
      wicketType: wicketType as any,
      wicketPlayerId: outId,
      timestamp: Date.now()
    };
    
    // Update batting stats
    const updatedBattingStats = { ...currentInnings.battingStats };
    if (!updatedBattingStats[outId]) {
      updatedBattingStats[outId] = {
        playerId: outId,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        dotBalls: 0,
        isOut: false
      };
    }
    
    // Mark player as out
    updatedBattingStats[outId] = {
      ...updatedBattingStats[outId],
      ballsFaced: updatedBattingStats[outId].ballsFaced + 1,
      dotBalls: updatedBattingStats[outId].dotBalls + 1,
      isOut: true,
      wicketType: wicketType as any,
      bowlerId: wicketType !== 'run_out' ? currentInnings.currentBowler : undefined
    };
    
    // Update bowling stats
    const updatedBowlingStats = { ...currentInnings.bowlingStats };
    if (!updatedBowlingStats[currentInnings.currentBowler]) {
      updatedBowlingStats[currentInnings.currentBowler] = {
        playerId: currentInnings.currentBowler,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        dots: 0
      };
    }
    
    // Add wicket to bowler only for certain dismissal types
    if (['bowled', 'caught', 'lbw', 'stumped'].includes(wicketType)) {
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        wickets: updatedBowlingStats[currentInnings.currentBowler].wickets + 1,
        dots: updatedBowlingStats[currentInnings.currentBowler].dots + 1
      };
    } else {
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        dots: updatedBowlingStats[currentInnings.currentBowler].dots + 1
      };
    }
    
    // Determine if over is complete
    let newOver = currentInnings.currentOver;
    let nextBallNumber = (currentInnings.currentBall + 1) % 6;
    
    // If over is complete
    if (nextBallNumber === 0) {
      newOver += 1;
      nextBallNumber = 0;
      
      // Update bowler's overs
      updatedBowlingStats[currentInnings.currentBowler] = {
        ...updatedBowlingStats[currentInnings.currentBowler],
        overs: updatedBowlingStats[currentInnings.currentBowler].overs + 1
      };
      
      toast.info("End of over! Change bowler and swap ends");
    }
    
    // Clear striker if they're out, otherwise keep the same
    const newStriker = outId === currentInnings.striker ? null : currentInnings.striker;
    const newNonStriker = outId === currentInnings.nonStriker ? null : currentInnings.nonStriker;
    
    // Update match state
    setMatch(prev => {
      if (!prev) return prev;
      
      const innings = prev.innings[inningsKey];
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...innings,
            balls: [...innings.balls, ballData],
            currentOver: newOver,
            currentBall: nextBallNumber,
            wickets: innings.wickets + 1,
            battingStats: updatedBattingStats,
            bowlingStats: updatedBowlingStats,
            striker: newStriker,
            nonStriker: newNonStriker
          }
        },
        updated: Date.now()
      };
    });
    
    // Get the player name
    const battingTeamKey = match.battingTeam;
    const battingTeam = match.teams[battingTeamKey];
    const outPlayer = battingTeam.players.find(p => p.id === outId);
    
    toast.error(`WICKET! ${outPlayer?.name || 'Batsman'} is out - ${wicketType}`);
  };

  const undoLastBall = () => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const currentInnings = match.innings[inningsKey];
    
    if (currentInnings.balls.length === 0) {
      toast.error("No balls to undo");
      return;
    }
    
    // Get the last ball
    const lastBall = currentInnings.balls[currentInnings.balls.length - 1];
    
    // Update match state
    setMatch(prev => {
      if (!prev) return prev;
      
      const innings = prev.innings[inningsKey];
      const updatedBalls = [...innings.balls];
      updatedBalls.pop();
      
      // Calculate the current over and ball
      let currentOver = innings.currentOver;
      let currentBall = innings.currentBall;
      
      // If we're at the start of an over, go back to the previous over
      if (currentBall === 0 && currentOver > 0) {
        currentOver -= 1;
        currentBall = 5;
      } else if (currentBall > 0) {
        // Otherwise, just go back one ball
        currentBall -= 1;
      }
      
      // Recalculate runs and wickets
      const totalRuns = innings.totalRuns - (lastBall.runs + lastBall.extras);
      const wickets = lastBall.isWicket ? innings.wickets - 1 : innings.wickets;
      
      // Update batting stats
      const battingStats = { ...innings.battingStats };
      if (lastBall.batsmanId && battingStats[lastBall.batsmanId]) {
        const batsmanStats = battingStats[lastBall.batsmanId];
        
        // Remove the runs and update counts
        battingStats[lastBall.batsmanId] = {
          ...batsmanStats,
          runs: batsmanStats.runs - lastBall.runs,
          ballsFaced: batsmanStats.ballsFaced - 1,
          fours: lastBall.runs === 4 ? batsmanStats.fours - 1 : batsmanStats.fours,
          sixes: lastBall.runs === 6 ? batsmanStats.sixes - 1 : batsmanStats.sixes,
          dotBalls: lastBall.runs === 0 && lastBall.extras === 0 ? batsmanStats.dotBalls - 1 : batsmanStats.dotBalls,
          isOut: lastBall.isWicket && lastBall.wicketPlayerId === lastBall.batsmanId ? false : batsmanStats.isOut
        };
      }
      
      // Update bowling stats
      const bowlingStats = { ...innings.bowlingStats };
      if (lastBall.bowlerId && bowlingStats[lastBall.bowlerId]) {
        const bowlerStats = bowlingStats[lastBall.bowlerId];
        
        // Calculate if this was the last ball of a completed over
        const wasLastBallOfOver = lastBall.ball === 5;
        
        // Determine runs to remove
        const runsToRemove = lastBall.extraType === 'bye' || lastBall.extraType === 'leg_bye' 
          ? lastBall.runs
          : lastBall.runs + lastBall.extras;
        
        // Remove wicket if applicable
        const wicketToRemove = 
          lastBall.isWicket && 
          ['bowled', 'caught', 'lbw', 'stumped'].includes(lastBall.wicketType || '') 
            ? 1 : 0;
        
        // Update bowler stats
        bowlingStats[lastBall.bowlerId] = {
          ...bowlerStats,
          runs: bowlerStats.runs - runsToRemove,
          wickets: bowlerStats.wickets - wicketToRemove,
          dots: (lastBall.runs === 0 && lastBall.extras === 0) ? bowlerStats.dots - 1 : bowlerStats.dots,
          overs: wasLastBallOfOver ? bowlerStats.overs - 1 : bowlerStats.overs
        };
        
        // Recalculate economy
        const totalBalls = bowlingStats[lastBall.bowlerId].overs * 6 + currentBall;
        if (totalBalls > 0) {
          bowlingStats[lastBall.bowlerId].economy = 
            parseFloat((bowlingStats[lastBall.bowlerId].runs / (totalBalls / 6)).toFixed(2));
        }
      }
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...innings,
            balls: updatedBalls,
            currentOver,
            currentBall,
            totalRuns,
            wickets,
            battingStats,
            bowlingStats
          }
        },
        updated: Date.now()
      };
    });
    
    toast.success("Last ball undone");
  };

  // Player management
  const changeBowler = (playerId: string) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    
    setMatch(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...prev.innings[inningsKey],
            currentBowler: playerId
          }
        },
        updated: Date.now()
      };
    });
    
    // Get the player name
    const bowlingTeamKey = match.battingTeam === 'team1' ? 'team2' : 'team1';
    const bowlingTeam = match.teams[bowlingTeamKey];
    const bowler = bowlingTeam.players.find(p => p.id === playerId);
    
    toast.success(`Bowler changed to ${bowler?.name}`);
  };

  const changeStriker = (playerId?: string) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    
    setMatch(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...prev.innings[inningsKey],
            striker: playerId || null
          }
        },
        updated: Date.now()
      };
    });
    
    if (playerId) {
      // Get the player name
      const battingTeamKey = match.battingTeam;
      const battingTeam = match.teams[battingTeamKey];
      const batsman = battingTeam.players.find(p => p.id === playerId);
      
      toast.success(`Striker changed to ${batsman?.name}`);
    }
  };

  const changeNonStriker = (playerId?: string) => {
    if (!match) return;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    
    setMatch(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        innings: {
          ...prev.innings,
          [inningsKey]: {
            ...prev.innings[inningsKey],
            nonStriker: playerId || null
          }
        },
        updated: Date.now()
      };
    });
    
    if (playerId) {
      // Get the player name
      const battingTeamKey = match.battingTeam;
      const battingTeam = match.teams[battingTeamKey];
      const batsman = battingTeam.players.find(p => p.id === playerId);
      
      toast.success(`Non-striker changed to ${batsman?.name}`);
    }
  };

  // Match state functions
  const startInnings = () => {
    if (!match) return;
    
    setMatch(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        status: 'in_progress',
        updated: Date.now()
      };
    });
    
    toast.success("Innings started!");
  };

  const endInnings = () => {
    if (!match) return;
    
    if (match.currentInnings === 1) {
      // Switch to second innings
      setMatch(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          status: 'innings_break',
          currentInnings: 2,
          battingTeam: prev.battingTeam === 'team1' ? 'team2' : 'team1',
          updated: Date.now()
        };
      });
      
      toast.success("First innings completed! Switch teams for second innings");
    } else {
      // End the match
      setMatch(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          status: 'completed',
          updated: Date.now()
        };
      });
      
      toast.success("Match completed!");
    }
  };

  // Join a match as a spectator
  const joinMatch = async (matchCode: string): Promise<boolean> => {
    // In a real app, this would fetch match data from a server
    // For our demo, check if the code matches the current match
    
    if (match && match.code === matchCode) {
      setViewMode('spectator');
      return true;
    }
    
    // For demo purposes, check localStorage for match with this code
    const savedMatch = localStorage.getItem('cricketMatch');
    if (savedMatch) {
      try {
        const parsedMatch = JSON.parse(savedMatch);
        if (parsedMatch.code === matchCode) {
          setMatch(parsedMatch);
          setViewMode('spectator');
          return true;
        }
      } catch (error) {
        console.error("Error loading match data:", error);
      }
    }
    
    return false;
  };

  // Utility functions
  const getCurrentBowler = (): Player | null => {
    if (!match) return null;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const bowlerId = match.innings[inningsKey].currentBowler;
    
    if (!bowlerId) return null;
    
    const bowlingTeamKey = match.battingTeam === 'team1' ? 'team2' : 'team1';
    return match.teams[bowlingTeamKey].players.find(p => p.id === bowlerId) || null;
  };

  const getCurrentBatsmen = () => {
    if (!match) return { striker: null, nonStriker: null };
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    const strikerId = match.innings[inningsKey].striker;
    const nonStrikerId = match.innings[inningsKey].nonStriker;
    
    if (!strikerId && !nonStrikerId) return { striker: null, nonStriker: null };
    
    const battingTeamKey = match.battingTeam;
    const strikingBatsman = strikerId 
      ? match.teams[battingTeamKey].players.find(p => p.id === strikerId) || null
      : null;
    
    const nonStrikingBatsman = nonStrikerId
      ? match.teams[battingTeamKey].players.find(p => p.id === nonStrikerId) || null
      : null;
    
    return { striker: strikingBatsman, nonStriker: nonStrikingBatsman };
  };

  const getBattingTeam = (): Team | null => {
    if (!match) return null;
    
    return match.teams[match.battingTeam];
  };

  const getBowlingTeam = (): Team | null => {
    if (!match) return null;
    
    const bowlingTeamKey = match.battingTeam === 'team1' ? 'team2' : 'team1';
    return match.teams[bowlingTeamKey];
  };

  const getCurrentInningsData = () => {
    if (!match) return null;
    
    const inningsKey = match.currentInnings === 1 ? 'first' : 'second';
    return match.innings[inningsKey];
  };

  const getPlayerById = (teamId: 'team1' | 'team2', playerId: string): Player | undefined => {
    if (!match) return undefined;
    
    return match.teams[teamId].players.find(p => p.id === playerId);
  };

  // Context value
  const contextValue: CricketContextType = {
    match,
    viewMode,
    isLoading,
    createMatch,
    setTeamName,
    addPlayer,
    removePlayer,
    toggleCaptain,
    toggleWicketkeeper,
    performToss,
    addRuns,
    addExtra,
    addWicket,
    undoLastBall,
    changeBowler,
    changeStriker,
    changeNonStriker,
    startInnings,
    endInnings,
    joinMatch,
    setViewMode,
    getCurrentBowler,
    getCurrentBatsmen,
    getBattingTeam,
    getBowlingTeam,
    getCurrentInningsData,
    getPlayerById
  };

  return (
    <CricketContext.Provider value={contextValue}>
      {children}
    </CricketContext.Provider>
  );
};

// Custom hook for using the cricket context
export const useCricket = () => {
  const context = useContext(CricketContext);
  
  if (context === undefined) {
    throw new Error("useCricket must be used within a CricketProvider");
  }
  
  return context;
};
