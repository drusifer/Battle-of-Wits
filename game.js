import { AutoShuffleDeck } from './deck.js';
import { ATTRIBUTE_DECK } from './attributes.js';
import { RIDDLE_DECK } from './riddles.js';
import { Goblet } from './goblet.js';
import { SickBoy, Gramps, Vizzini, Buttercup, DreadPirateRoberts, Character } from './characters.js';

class Silence extends Character {
    constructor() {
        super("", "", [], [], [], []);
    }

    // do nothing
    async say(message, replaces) {
        return new Promise(resolve => setTimeout(resolve(), 0)); 
    };
    async login(chat) { 
        return new Promise(resolve => setTimeout(resolve(), 0));
    };
    async logout(chat) { 
        return new Promise(resolve => setTimeout(resolve(), 0));
    };
    async saySomething(replaces) {
       return new Promise(resolve => setTimeout(resolve(), 0));
    };
};


/**
 * The main class that manages the state and logic for the Battle of Wits.
 */
export class Game {
    constructor() {
        this.gobletSize = 5;
        this.playerHearts = 2;
        this.riddlesPerRound = 3;
        this.roundNumber = 0;
        this.deadlyGoblet = null;
        this.safeGoblet = null;
        this.currentRiddle = null;
        this.isGameOver = false;
        this.chat = null;
    }

    initRound() {
        this.roundNumber++;
        ATTRIBUTE_DECK.reshuffle();

        // draw the two gobets at random and posion the first one
        this.goblets = new AutoShuffleDeck([
            new Goblet("Left", this.drawGoblet()),
            new Goblet("Right", this.drawGoblet())
        ]).reshuffle();

        this.deadlyGoblet = this.goblets.draw().addPoison();
        this.safeGoblet = this.goblets.draw();
    }

    
    /**
     * Draws a set of unique attributes for a goblet from the global ATTRIBUTE_DECK.
     * It ensures that each attribute drawn is of a unique type until `this.gobletSize` attributes are collected.
     * @returns {Array<Attribute>} An array of unique Attribute objects for a goblet.
     */
    drawGoblet() {
        let types_aready_drawn = {};
        let selecte_attributes = [];
        while (selecte_attributes.length < this.gobletSize) {
            let attribute = ATTRIBUTE_DECK.draw();
            if (!types_aready_drawn[attribute.name]) {
                types_aready_drawn[attribute.name] = true;
                selecte_attributes.push(attribute);
            }
        }
        return selecte_attributes;
    }

    /**
     * Initiates and manages the main game loop, including character interactions,
     * riddle stages, and goblet choices.
     * @param {Chat} chat The chat interface object used for communication with the player.
     */
    
    async run(chat) {
        RIDDLE_DECK.reshuffle();
        this.chat = chat;
        chat.setInputStatus("off")
        this.dpr = new DreadPirateRoberts();

        this.gramps = new Gramps();
        this.vizzini = new Vizzini();
        this.buttercup = new Buttercup();
        this.sickboy = new SickBoy();

        await this.sickboy.login(chat);
        await this.gramps.login(chat);

        await this.gramps.sayOpeningMessage();
        await this.sickboy.sayGreeting();

        await this.buttercup.login(chat);
        await this.vizzini.login(chat);
            

        // if it's too chatty add some silence
        this.randomCommentDeck = new AutoShuffleDeck([
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            new Silence(), new Silence(), new Silence(), new Silence(), 
            this.vizzini,
            this.buttercup,
            this.dpr]).reshuffle();

        await this.gramps.sayStartMessage();
        await this.vizzini.sayStartMessage();
        await this.dpr.login(chat);
        await this.dpr.sayStartMessage();
        await this.chat.updateStatus(this.playerHearts, this.roundNumber);
        // --- Main Game Loop ---
        while (!this.isGameOver) {
            this.initRound();
           
            let  result = await this.playRound();
            if(result == 'win' || this.playerHearts <= 0) {
                await this.vizzini.sayEndMessage(result=="win");
                await this.dpr.sayEndMessage(result=="win");
                await this.buttercup.sayEndMessage(result=="win");
                await this.sickboy.sayEndMessage(result=="win");
                await this.gramps.sayEndMessage(result=="win");
                this.isGameOver = true;
            } else {
                await this.buttercup.saySomething();
            }
            await this.chat.updateStatus(this.playerHearts, this.roundNumber);
        }
    }
        
    async playRound() {
        await this.randomComment();
            
        for (let i = 0; i < this.riddlesPerRound; i++) {
            await this.playRiddleStage(i);
            await this.randomComment();
        }
        await this.sickboy.saySomething();
        await this.gramps.saySomething();
        let result = await this.playGobletStage();
        if(result == 'win') {
            return 'win';
        } else {
            this.playerHearts--;
            if (this.playerHearts > 0) {
                await this.vizzini.sayEndMessage(result=="lose");
                await this.dpr.sayDrankPoisonMessage();
            }
        }
        return 'lose';
    }

    async playRiddleStage(round_number) {
        const currentRiddle = RIDDLE_DECK.draw();

        await this.randomComment();
        if (this.randomCommentDeck.currentCard !== this.sickboy) {
            await this.sickboy.saySomething();
        }
        const rounds = [
            {},
            {'first': 'second',
             'First': 'Second'},
            {'first': 'third',
             'First': 'Third'}
            ];
        await this.gramps.sayPreRiddleMessage(rounds[round_number]);
        await this.vizzini.sayPreRiddleMessage(rounds);
        await this.vizzini.say(currentRiddle.question);

        let answer = await this.chat.waitForAnswer();
        while (answer.click == 'hint') {
            await this.buttercup.say(currentRiddle.getHint());
            await this.vizzini.saySomething();
            answer = await this.chat.waitForAnswer();
        }
        await this.dpr.sayAnswerMessage(answer.value);

       if (currentRiddle.checkAnswer(answer.value)) {
            await this.vizzini.sayRiddleAnswerResponse(true);
            await this.vizzini.say(this.safeGoblet.getComplement());
            await this.randomComment();
            await this.randomComment();
        } else {
            await this.vizzini.sayRiddleAnswerResponse(false);
            await this.vizzini.say(this.deadlyGoblet.getInsult());
            await this.randomComment();
            await this.randomComment();
        }
    }

    async randomComment() {
        let rando = this.randomCommentDeck.drawNew();
        await rando.saySomething();
    }


    async playGobletStage() {
            await this.vizzini.sayGobletRoundMessage();
            await this.dpr.sayGobletRoundMessage();
            await this.gramps.say(this.goblets.draw().generateDescription());
            await this.gramps.say(this.goblets.draw().generateDescription());
            await this.sickboy.saySomething();
            await this.gramps.sayGobletRoundMessage();

            
            const rc = this.randomCommentDeck.drawNew();
            if (rc !== this.gramps) {
                await rc.saySomething();
            }
            
            const choice = await this.chat.waitForGobletChoice();
            await this.dpr.sayGobletAnswerMessage(choice);

            const isSafe = this.safeGoblet.side.toLowerCase()==choice.toLowerCase();
            return isSafe;
        }
    }