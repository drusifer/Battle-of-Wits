import { Deck } from './deck.js';

export class AutoShuffleDeck extends Deck {
  draw() {
    if (this.isEmpty()) {
      this.reshuffle();
    }
    return super.draw();
  }
}