import { AutoShuffleDeck } from "./autoShuffleDeck.js";



// The Goblet class
export class Goblet {
    constructor(side, attributes) {
        this.side = side;
        this.poisoned = false;
        this.attrDeck = new AutoShuffleDeck(attributes);
        this.descriptionIntro = new AutoShuffleDeck([
            `Examining the goblet on the ${this.side.toLowerCase()}, the Man in Black notes its unique characteristics.`,
            `The goblet positioned on the ${this.side.toLowerCase()} presents a curious appearance.`,
            `Turning his attention to the goblet on the ${this.side.toLowerCase()}, its features become apparent.`,
            `The vessel on the ${this.side.toLowerCase()} is certainly noteworthy in its design.`,
            `The goblet on the ${this.side.toLowerCase()} is unlike any other.`,
            `Taking a closer look at the goblet on the ${this.side.toLowerCase()}, the Dread Pirate Roberts finds its form is quite striking.`,
            `The goblet on the ${this.side.toLowerCase()} has a presence that demands attention.`,
            `Focusing on the goblet on the ${this.side.toLowerCase()}, the Man in Black is intregued by construction is intriguing.`,
            `The goblet on the ${this.side.toLowerCase()} is a study in contrasts.`
        ]).reshuffle().draw()
    }

    generateDescription() {
        let description = "" + this.descriptionIntro;
        let fragments = [];
        const cards = this.attrDeck.getCards();
        cards.forEach(attribute => {
            fragments.push(attribute.draw_fragment());
        });

        description += fragments.join(" ");
        return description.trim();
    }

    getInsult() {
        const insult = this.attrDeck.draw().insults.draw();
        return insult;
    }

    getComplement() {
       const complement = this.attrDeck.draw().complements.draw();
       return complement;
    }

    addPoison() {
        this.poisoned = true;
        return this;
    }

    isPoisoned() {
        return this.poisoned;
    }
}