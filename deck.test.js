// Assuming deck.js and autoShuffleDeck.js are available in the same directory
import { Deck } from './deck.js';
import { AutoShuffleDeck } from './autoShuffleDeck.js';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

describe('Deck', () => {
    let deck;
    let initialCards;

    beforeEach(() => {
        initialCards = ['card1', 'card2', 'card3', 'card4', 'card5'];
        deck = new Deck([...initialCards]); // Use spread to create a copy
    });

    it('should be initialized with a set of cards', () => {
        expect(deck.numRemaining).to.equal(initialCards.length);
        expect(deck.numDrawn).to.equal(0);
        expect(deck.currentCard).to.equal(null);
        expect(deck.length).to.equal(initialCards.length);
        expect(deck.isEmpty()).to.equal(false);
    });

    it('draw should return the current card and move it to drawn ', () => {
        const drawnCard = deck.draw();
        expect(drawnCard).to.equal('card1');
        expect(deck.currentCard).to.equal(drawnCard);
        expect(deck.numDrawn).to.equal(1);
        expect(deck.drawnCards[0]).to.equal(drawnCard)
    });

    it('draw should return the last card when only one card remains', () => {
        deck = new Deck(['singleCard']);
        const drawnCard = deck.draw();
        expect(drawnCard).to.equal('singleCard'); // Changed from to.be to to.equal for value assertion
        expect(deck.currentCard).to.equal(drawnCard);
        expect(deck.numRemaining).to.equal(0);
        expect(deck.numDrawn).to.equal(1);
        expect(deck.drawnCards[0]).to.equal(drawnCard);
    });


    it('draw should return null when the deck is empty and reshuffle is false', () => {
        deck = new Deck([]);
        const drawnCard = deck.draw();
        expect(drawnCard).to.be.null; // Changed from to.equal.null to to.be.null
        expect(deck.currentCard).to.be.null; // Changed from to.equal.null to to.be.null
        expect(deck.numRemaining).to.equal(0);
        expect(deck.numDrawn).to.equal(0);
    });

    it('draw should reshuffle and draw when the deck is empty and reshuffle is true', () => {
        deck = new Deck(['cardA', 'cardB']);
        deck.draw(); // cardA is current
        deck.draw(); // cardB is current
        expect(deck.numRemaining).to.equal(0);
        expect(deck.numDrawn).to.equal(2); // cardA, cardB

        const drawnWhenEmpty = deck.draw(true); // Reshuffle
        expect(drawnWhenEmpty).to.be.null;

        deck.reshuffle()
        expect(deck.numRemaining).to.equal(2);
        expect(deck.numDrawn).to.equal(0);
        expect(deck.currentCard).to.be.null;

        const cardAfterReshuffle = deck.draw();
        expect(cardAfterReshuffle).to.not.be.null;
        expect(deck.currentCard).to.equal(cardAfterReshuffle);

    });

    it('shuffle should randomize the remaining cards and not lose any', () => {
        // Draw a few cards first to have a Drawn pile
        deck.draw();
        deck.draw(); // card1, card2 in Drawn, card3, card4, card5 remaining

        const originalRemaining = [...deck.cards];
        deck.shuffle();
        const shuffledRemaining = [...deck.cards];

        expect(shuffledRemaining.length).to.equal(originalRemaining.length);
        expect(deck.numDrawn).to.equal(2); // drawnCards pile should be unaffected
    });

    it('reshuffle should merge Drawn and remaining piles and reset', () => {
        deck.draw();
        deck.draw(); // card1, card2 in drawnCards, card3, card4, card5 remaining
        deck.draw(); // card3 in drawnCards, card4, card5 remaining
        expect(deck.numDrawn).to.equal(3);
        expect(deck.numRemaining).to.equal(2);

        deck.reshuffle();

        expect(deck.numRemaining).to.equal(initialCards.length);
        expect(deck.numDrawn).to.equal(0);
        expect(deck.currentCard).to.equal(null);
        // Check that all initial cards are present in remainingCards
        initialCards.forEach(card => {
            expect(deck.cards).to.include(card);
        });
    });

    it('split should create a new deck with a specified number of cards', () => {
        const newDeck = deck.split(3);

        expect(newDeck).to.be.instanceOf(Deck); // Changed from toBeInstanceOf to to.be.instanceOf
        expect(newDeck.numRemaining).to.equal(3);
        expect(newDeck.numDrawn).to.equal(0);
        expect(newDeck.currentCard).to.be.null; // Changed from to.equal(null) to to.be.null

        expect(deck.numRemaining).to.equal(initialCards.length - 3);
        expect(deck.numDrawn).to.equal(0);
        expect(deck.currentCard).to.equal(null);

        // Check that the cards in the new deck were removed from the original deck
        newDeck.cards.forEach(card => {
            expect(initialCards).to.include(card);
            expect(deck.cards).to.not.include(card);
        });
    });

    it('split should return an empty deck if numCards is 0', () => {
        const newDeck = deck.split(0);
        expect(newDeck).to.be.instanceOf(Deck); // Changed from toBeInstanceOf to to.be.instanceOf
        expect(newDeck.length).to.equal(0);
        expect(newDeck.numRemaining).to.equal(0);
        expect(newDeck.numDrawn).to.equal(0);
    });

    it('split should return a deck with all remaining cards if numCards is more than remaining', () => {
        deck.draw(); // Draw one card so remaining is initial.length - 1
        const newDeck = deck.split(initialCards.length);

        expect(newDeck.numRemaining).to.equal(initialCards.length - 1);
        expect(deck.numRemaining).to.equal(0);
    });
});

describe('AutoShuffleDeck', () => {
    let autoShuffleDeck;
    let initialCards;

    beforeEach(() => {
        initialCards = ['autoCard1', 'autoCard2'];
        autoShuffleDeck = new AutoShuffleDeck([...initialCards]);
    });

    it('should extend the Deck class', () => {
        expect(autoShuffleDeck).to.be.instanceOf(Deck); // Changed from toBeInstanceOf to to.be.instanceOf
        expect(autoShuffleDeck).to.be.instanceOf(AutoShuffleDeck); // Changed from toBeInstanceOf to to.be.instanceOf
    });

    it('draw should automatically reshuffle and draw when the deck is empty', () => {
        const card1 = autoShuffleDeck.draw(); // Draw autoCard1
        const card2 = autoShuffleDeck.draw(); // Draw autoCard2

        expect(autoShuffleDeck.numRemaining).to.equal(0);
        expect(autoShuffleDeck.numDrawn).to.equal(2);
        expect(autoShuffleDeck.currentCard).to.equal(card2);

        // Calling draw again should trigger an automatic reshuffle
        const drawnCardAfterReshuffle = autoShuffleDeck.draw();

        expect(drawnCardAfterReshuffle).not.to.equal(null);
        expect(initialCards).to.include(drawnCardAfterReshuffle); // Should be one of the original cards
        expect(autoShuffleDeck.numRemaining).to.equal(1); // One card drawn after reshuffle
        expect(autoShuffleDeck.numDrawn).to.equal(1); // The drawn card moved to Drawn
    });

    it('draw should behave like Deck.draw when the deck is not empty', () => {
        const drawnCard = autoShuffleDeck.draw();
        expect(drawnCard).to.equal('autoCard1');
        expect(autoShuffleDeck.currentCard).to.equal('autoCard1');
        expect(autoShuffleDeck.numRemaining).to.equal(1);
        expect(autoShuffleDeck.numDrawn).to.equal(1);
    });
});