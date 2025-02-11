import { GameState, Player, Stats, Game } from "./types.js";

const initialValue: GameState = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class Store extends EventTarget {
  private storageKey: string;
  private players: Player[];

  constructor(key: string, players: Player[]) {
    super();
    this.storageKey = key;
    this.players = players;
  }

  get stats(): Stats {
    const state = this.#getState();

    return {
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player,
          wins,
        };
      }),

      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  get game() {
    const state = this.#getState();
    const currentPlayer = this.players[state.currentGameMoves.length % 2];
    const winning_patterns = [
      [1, 2, 3],
      [1, 4, 7],
      [1, 5, 9],
      [2, 5, 8],
      [3, 6, 9],
      [3, 5, 7],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner: Player | null = null;
    for (const player of this.players) {
      const selectedSquareIds = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winning_patterns) {
        if (pattern.every((val) => selectedSquareIds.includes(val))) {
          winner = player;
        }
      }
    }

    return {
      moves: state.currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId: number) {
    const stateClone = structuredClone(this.#getState());

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#setState(stateClone);
  }

  reset() {
    const stateClone = structuredClone(this.#getState());
    const { status, moves } = this.game;

    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }
    stateClone.currentGameMoves = [];
    this.#setState(stateClone);
  }

  newRound() {
    this.reset();

    const stateClone = structuredClone(this.#getState());
    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);

    stateClone.history.currentRoundGames = [];

    this.#setState(stateClone);
  }

  #setState(stateOrFn: GameState | ((state: GameState) => GameState)) {
    const prevState = this.#getState();
    let newState: GameState;

    switch (typeof stateOrFn) {
      case "function":
        newState = (stateOrFn as (state: GameState) => GameState)(prevState);
        break;
      case "object":
        newState = stateOrFn as GameState;
        break;
      default:
        throw new Error("Invalid arguments");
    }
    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));

    this.dispatchEvent(new Event("statechange"));
  }

  #getState(): GameState {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }
}
