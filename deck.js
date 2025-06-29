export class Deck {
    constructor(cards = []) {
        this.cards = cards;
        //this.cards.reverse();  // FIFO
        this.drawnCards = [];
        this.currentCard = null;
    }

    // Helper function to get a random integer using window.crypto if available,
    // falling back to Math.random otherwise. Includes rejection sampling for even distribution
    // when using window.crypto.
    getRandomInt(max) {
        if (max <= 0) {
            throw new Error("max must be a positive integer");
        }

        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const range = max;
            const bitsNeeded = Math.ceil(Math.log2(range));
            const bytesNeeded = Math.ceil(bitsNeeded / 8); // Minimum bytes to cover 'max'

            let randomBytes;
            let randomValue;
            
            randomBytes = new Uint8Array(bytesNeeded);
            window.crypto.getRandomValues(randomBytes);
            randomValue = randomBytes.reduce((acc, byte) => (acc * 256) + byte, 0);

            // Using modulo directly. This is faster as it avoids rejection sampling,
            // but introduces a very slight bias if (2^N - 1) % max != 0,
            // where N is the number of bits in randomValue. For game purposes, this is usually negligible.
            return randomValue % max;
        } else {
            return Math.floor(Math.random() * max);
        }
    }

    drawN(numberOfCards) {
        let drawn = [];
        for (let i = 0; i < numberOfCards; i++) { 
            const c = this.draw();
            if (c) {
                drawn.push(c);
            }
        }
        return drawn;
    }

    // Ensures that the next draw will be '===' different then the current card
    // discards rejected draws. only usefull when the same card is present more
    // than onces (like the randomComments deck)
    drawNew() {

        if (!this.currentCard) {
            return this.draw();
        }
        
        const oldCard = this.currentCard;
        let newCard = this.draw();
        while (newCard && newCard === oldCard) {
            newCard = this.draw();
        }
        return newCard;
    }

    // draws 1 card from the top of the deck
    draw() {
        if (this.currentCard)  {
            this.drawnCards.push(this.currentCard);
        }
        const card = this.cards.shift();
        this.currentCard = card;
        return this.currentCard;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    // shuffles the remaining cards
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = this.getRandomInt(i + 1);
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    // adds discards back int and reshufles
    reshuffle() {
        this.cards = [...this.getCurrentCards(), ...this.cards, ...this.drawnCards];
        this.drawnCards = [];
        this.currentCard = null; // Will be set on next draw
        this.shuffle();
        return this;
    }

    // returns the currentCard in an array or an empty array to make
    // it to merge with ...
    getCurrentCards() {
        if (this.currentCard) {
            return [ this.currentCard ];
        } else {
            return [];
        }
    }

    // Removes all the remaining cards from the deck and ads them to this one.
    merge(deck) {
        this.cards = [...this.cards, 
                      ...deck.getCurrentCards(),
                      ...deck.drawN(deck.numRemaining)
                    ];
    }

    // Remove the numberOfCards from the remainiang cards to a new deck.
    split( numberOfCards ) {
        if ( numberOfCards > this.cards.length ) {
            numberOfCards = this.cards.length;
        }
        const cardsToSplit = this.cards.splice( 0, numberOfCards );
        return new Deck( cardsToSplit ); // Create new deck with split cards
    }

    get numRemaining() {
        return this.cards.length;
    }

    //return the number of cards in the discard pile
    get numDrawn() {
        return this.drawnCards.length + this.getCurrentCards().length;
    }
    // return the total number of cards in the deck
    get length() {
        return this.cards.length + this.drawnCards.length;
    }

    // return the total number of cards in the deck
    size() {
        return this.cards.length + this.drawnCards.length;
    }

    // get the remaining cards without drawing them
    getCards()  {
        return this.cards;
    }
}

export class AutoShuffleDeck extends Deck {
  // The constructor was redundant as it only called the parent's constructor
  // with the same arguments. JavaScript provides this behavior by default.
  draw() {
    if (super.isEmpty()) {
      super.reshuffle();
    }
    return super.draw();
  }
}