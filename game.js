import { AutoShuffleDeck } from './autoShuffleDeck.js';
import { ATTRIBUTE_DECK } from './attributes.js';
import { RIDDLE_DECK } from './riddles.js';
import { Goblet } from './goblet.js';
import { SickBoy, Gramps, Vizzini, Buttercup, DreadPirateRoberts, Character } from './characters.js';

/**
 * The main class that manages the state and logic for the Battle of Wits.
 */
export class Game {
    constructor() {
        this.gobletSize = 5;
        this.playerHearts = 3;
        this.riddlesPerRound = 2;
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
        this.dpr = new DreadPirateRoberts(chat);
        this.dpr.login();

        this.gramps = new Gramps(chat);
        this.vizzini = new Vizzini(chat);
        this.buttercup = new Buttercup(chat);
        this.sickboy = new SickBoy(chat);

        this.sickboy.login();
        this.gramps.login();
        await this.sickboy.sayGreeting();
        await this.gramps.sayOpeningMessage();

        this.buttercup.login();
        this.vizzini.login();

        this.silence = new class extends Character {
            constructor() {
                super(chat, "", "", [], [], [], []);
            }
            say(message) {};

            login() {};
            logout() {};
        }();
            

        // if it's too chatty add some silence
        this.randomCommentDeck = new AutoShuffleDeck([
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.silence, this.silence, this.silence,
            this.vizzini,
            this.vizzini,
            this.buttercup,
            this.buttercup,
            this.dpr,
            this.dpr,
            this.dpr,
            this.dpr]).reshuffle();

        await this.gramps.sayStartMessage();
        await this.vizzini.sayStartMessage();
        await this.dpr.sayStartMessage();
        // --- Main Game Loop ---
        while (!this.isGameOver) {
            this.initRound();
           
            let  result = await this.playRound();
            if(result == 'win' || this.playerHearts <= 0) {
                await this.dpr.sayEndMessage(result=="win");
                await this.buttercup.sayEndMessage(result=="win");
                await this.vizzini.sayEndMessage(result=="win");
                await this.sickboy.sayEndMessage(result=="win");
                await this.gramps.sayEndMessage(result=="win");
                this.isGameOver = true;
            } else {
                await this.dpr.saySomething();
                await this.buttercup.saySomething();
            }
        }
    }
        
    async playRound() {

        while(this.playerHearts > 0) {
            await this.vizzini.saySomething();
            await this.randomCommentDeck.draw().saySomething();
            
            for (let i = 0; i < this.riddlesPerRound; i++) {
                await this.playRiddleStage(i);
            }
            await this.vizzini.saySomething();
            await this.sickboy.saySomething();
            await this.gramps.saySomething();
            let result = this.playGobletStage();
            if(result == 'win') {
                return 'win';
            } else {
                this.playerHearts--;
                if (this.playerHearts > 0) {
                    await this.dpr.sayDrankPoisonMessage();
                }
            }
        }
        return 'lose';
    }

    async playRiddleStage(round_number) {
        const currentRiddle = RIDDLE_DECK.draw();

        await this.randomCommentDeck.draw().saySomething();
        if (this.randomCommentDeck.currentCard !== this.sickboy) {
            await this.sickboy.saySomething();
        }
        const rounds = ['first', 'second', 'third']
        await this.gramps.sayPreRiddleMessage({'first': rounds[round_number]})
        await this.vizzini.sayPreRiddleMessage({'first': rounds[round_number]});
        await this.vizzini.say(currentRiddle.question);

        let answer = await this.chat.waitForAnswer();
        while (answer.click == 'hint') {
            await this.buttercup.saySomething();
            await this.buttercup.say(currentRiddle.getHint());
            await this.vizzini.saySomething();
            answer = await this.chat.waitForAnswer();
        }

       if (currentRiddle.checkAnswer(answer.value)) {
            await this.vizzini.say(this.safeGoblet.getComplement());
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
        } else {
            await this.vizzini.say(this.deadlyGoblet.getInsult());
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
        }
    }

    async playGobletStage() {
            await this.dpr.sayGobletRoundMessage();
            await this.buttercup.sayGobletRoundMessage();
            await this.vizzini.sayGobletRoundMessage();
            this.gramps.say(this.goblets.draw().generateDescription());
            this.gramps.say(this.goblets.draw().generateDescription());

            await this.sickboy.sayGobletRoundMessage();
            await this.gramps.sayGobletRoundMessage();
            
            const rc = this.randomCommentDeck.draw();
            if (rc !== this.gramps) {
                await rc.saySomething();
            }
            
            const choice = await this.chat.waitForGobletChoice();
            const isSafe = !(this.goblets.find(g => g.side == choice).poisoned);
            return isSafe;
        }
    }