import Store from "./store";
import { Game, Move, Player, Stats } from "./types";

export default class View {
  $: Record<string, Element> = {};
  $$: Record<string, NodeListOf<Element>> = {};
  constructor() {
    this.$.grid = this.#qs("[data-id='grid']");

    //Menu Elemnets
    this.$.menu = this.#qs("[data-id='menu']");
    this.$.menu_items = this.#qs("[data-id='menu-items']");
    this.$.menu_btn = this.#qs("[data-id='menu-btn']");
    this.$.menu_icon = this.#qs("i", this.$.menu_btn);
    this.$.reset_btn = this.#qs("[data-id='reset-btn']");
    this.$.new_round_btn = this.#qs("[data-id='new-round-btn']");

    // Turn Elements
    this.$.turn = this.#qs("[data-id='turn']");
    this.$.turn_text = this.#qs("[data-id='turn-text']");

    //Modal Elements
    this.$.modal = this.#qs("[data-id='modal']");
    this.$.modal_text = this.#qs("[data-id='modal-text']");
    this.$.modal_button = this.#qs("[data-id='modal-btn']");

    // Squares
    this.$$.squares = this.#qsa("[data-id='square']");

    //scoreboard
    this.$.p1_wins = this.#qs("[data-id='p1-wins']");
    this.$.tie = this.#qs("[data-id='tie']");
    this.$.p2_wins = this.#qs("[data-id='p2-wins']");

    // UI-only Event Listners
    this.$.menu.addEventListener("click", (e) => {
      this.#toggleMenu();
    });
  }

  render(game: Store["game"], stats: Stats) {
    const { playerWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner },
    } = game;

    this.#clearSquares();
    this.#updateScoreboard(
      playerWithStats[0].wins,
      playerWithStats[1].wins,
      ties
    );
    this.#closeAll();
    this.#initializeViews(moves);

    if (isComplete) {
      this.#openModal(winner ? `${winner.name} wins!` : "Tie Match! ");
      return;
    }
    this.#setTurnIndicators(currentPlayer);
  }

  //Event Listners
  bindGameResetEvent(handler: EventListener) {
    this.$.reset_btn.addEventListener("click", handler);
    this.$.modal_button.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler: EventListener) {
    this.$.new_round_btn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler: (el: Element) => void) {
    this.#delegate(this.$.grid, '[data-id="square"]', "click", handler);
  }

  // Helper private Methods

  #updateScoreboard(p1: number, p2: number, tie: number) {
    this.$.p1_wins.textContent = `${p1} wins`;
    this.$.p2_wins.textContent = `${p2} wins`;
    this.$.tie.textContent = `${tie} Ties`;
  }

  #openModal(message: string) {
    this.$.modal.classList.remove("hidden");
    this.$.modal_text.textContent = message;
  }

  #closeAll() {
    this.#closeModal();
    // this.#closeMenu();
  }

  #clearSquares() {
    this.$$.squares.forEach((square) => square.replaceChildren());
  }

  #initializeViews(moves: Move[]) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);
      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  // #closeMenu() {
  //   this.$.menu_items.classList.add("hidden");
  //   this.$.menu_btn.classList.remove("border");
  //   const icon = this.$.menu_btn.querySelector("i");
  //   icon.classList.add("fa-caret-down");
  //   icon.classList.remove("fa-caret-up");
  // }

  #toggleMenu() {
    this.$.menu_items.classList.toggle("hidden");
    this.$.menu_btn.classList.toggle("border");

    const icon = this.#qs("i", this.$.menu_btn);

    icon.classList.toggle("fa-caret-down");
    icon.classList.toggle("fa-caret-up");
  }

  #handlePlayerMove(squareEle: Element, player: Player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colorClass);

    squareEle.replaceChildren(icon);
  }

  #setTurnIndicators(player: Player) {
    const icon = document.createElement("i");
    const label = document.createElement("p");

    icon.classList.add("fa-solid", player.iconClass, player.colorClass);
    label.classList.add(player.colorClass);

    label.innerText = `${player.name}, you're up!`;
    this.$.turn.replaceChildren(icon, label);
  }

  // query selector
  #qs(selector: string, parent?: Element) {
    const ele = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!ele) throw new Error("Element Not Found");
    return ele;
  }

  //query selector all
  #qsa(selector: string) {
    const ele = document.querySelectorAll(selector);
    if (!ele) throw new Error("Element not found!");
    return ele;
  }

  #delegate(
    el: Element,
    selector: string,
    eventKey: string,
    handler: (el: Element) => void
  ) {
    el.addEventListener(eventKey, (event) => {
      if (!(event.target instanceof Element)) {
        throw new Error("Event target not found");
      }

      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
