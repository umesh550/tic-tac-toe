//controller

import Store from "./store.js";
import { Player } from "./types.js";
import View from "./view.js";

const players: Player[] = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquosie",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", players);

  //current tab state changes
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  //A different tab state changes
  window.addEventListener("storage", () => {
    console.log("State changed from different tab");
    view.render(store.game, store.stats);
  });

  //Initial Load
  view.render(store.game, store.stats);

  //New Round
  view.bindNewRoundEvent((e) => {
    store.newRound();
  });

  //Reset Game
  view.bindGameResetEvent((e) => {
    store.reset();
  });

  view.bindPlayerMoveEvent((square) => {
    const clickedSquare = square;
    const existingPlayer = store.game.moves.find(
      (move) => move.squareId === +clickedSquare.id
    );

    if (existingPlayer) {
      return;
    }
    store.playerMove(+clickedSquare.id);
    view.render(store.game, store.stats);
  });
}

window.addEventListener("load", init);
