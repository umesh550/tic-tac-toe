export interface Player {
  id: number;
  name: string;
  iconClass: string;
  colorClass: string;
}

export interface Move {
  squareId: number;
  player: Player;
}

export interface Game {
  moves: Move[];
  status: {
    isComplete: boolean;
    winner: Player | null;
  };
}

export interface GameState {
  currentGameMoves: Move[];
  history: {
    currentRoundGames: Game[];
    allGames: Game[];
  };
}

export interface Stats {
  playerWithStats: PlayerWithStats[];
  ties: number;
}

export interface PlayerWithStats extends Player {
  wins: number;
}
