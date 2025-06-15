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
        this.playerHearts = 3;
        this.riddlesPerRound = 2;
        this.roundNumber = 0;
        this.deadlyGoblet = null;
        this.safeGoblet = null;
        this.currentRiddle = null;
        this.isGameOver = false;
        this.chat = null;
        RIDDLE_DECK.reshuffle();
    }

    initRound() {
        this.roundNumber++;
        ATTRIBUTE_DECK.reshuffle();

        // draw the two gobets at random and posion the first one
        this.goblets = new AutoShuffleDeck([
            new Goblet("Left", ATTRIBUTE_DECK.drawN(5)),
            new Goblet("Right", ATTRIBUTE_DECK.drawN(5))
        ]).reshuffle();

        this.deadlyGoblet = this.goblets.draw().addPoison();
        this.safeGoblet = this.goblets.draw();
    }

    answerRiddle(answer)  {
        if(this.currentRiddle.checkAnswer(answer)) {
            this.vizzini.say(this.safeGoblet.getComplement());
            this.buttercup.saySomething();
            this.gramps.saySomething();
        } else {
            this.vizzini.say(this.safeGoblet.getInsult());
            this.safeGoblet.randomCommentDeck.reshuffle();
            const character = this.randomCommentDeck.draw();
            if(character != null) {
                character.saySomething();
                if(character == this.sickboy) {
                    this.gramps.saySomething();
                }
                if(character == this.vizzini) {
                    this.dpr.saySomething();
                }
                if(character == this.dpr) {
                    this.buttercup.saySomething();
                }
            }
        }
    }

    getHint() {
        this.buttercup.say(this.currentRiddle.getHint());
        this.vizzini.saySomething();
    }

    chooseGoblet(goblet) {
        if (goblet === this.deadlyGoblet) {
            this.playerHearts--;
        }

    }

    async run(chat) {
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
        //await this.sickboy.dialogueWith([this.gramps])



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

        // --- Main Game Loop ---
        while (!this.isGameOver) {
            this.initRound();
            //await this.sickboy.saySomething();
            //await this.gramps.saySomething();
            await this.gramps.sayStartMessage();
            await this.vizzini.sayStartMessage();
           
            let  result = await this.playRound();
            if(result == 'win' || this.playerHearts <= 0) {
                await this.dpr.sayEndMessage(result=="win");
                await this.vizzini.sayEndMessage(result=="win");
                await this.sickboy.sayEndMessage(result=="win");
                await this.gramps.sayEndMessage(result=="win");
                this.isGameOver = true;
            } else {
                await this.dpr.saySomething();
            }
        }
    }
        
    async playRound() {

        while(this.playerHearts > 0) {
            await this.vizzini.saySomething();
            await this.randomCommentDeck.draw().saySomething();
            
            for (let i = 0; i < this.riddlesPerRound; i++) {
                await this.playRiddleStage();
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
                    await this.vizzini.dprLossMessages();
                    await this.buttercup.dprLossMessages();
                    await this.dpr.drankPoisonMessages();
                }
            }
        }
        return 'lose';
    }

    async playRiddleStage() {
        const currentRiddle = RIDDLE_DECK.draw();

        await this.randomCommentDeck.draw().saySomething();
        await this.vizzini.sayPreRiddleMessage();
        await this.vizzini.say(currentRiddle.question);

        const answer = await this.chat.waitForAnswer();

       if (currentRiddle.checkAnswer(answer)) {
            await this.vizzini.say(this.safeGoblet.getComplement());
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
        } else {
            await this.vizzini.say(this.poisonedGoblet.getInsult());
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
            await this.randomCommentDeck.draw().saySomething();
        }
    }

    async playGobletStage() {
            this.vizzini.sayGobletRoundMessage();
            this.sickboy.saySomething();
            this.gramps.sayGobletRoundMessage();
            this.dpr.saySomething();
            this.gramps.say(this.goblets.draw().generateDescription());
            this.gramps.say(this.goblets.draw().generateDescription());
            
            this.randomCommentDeck.draw().saySomething();
            
            // ... Player choice simulation ...
            const choice = await this.chat.waitForGobletChoice();
            const isSafe = !(this.goblets.find(g => g.side == choice).poisoned);
            return isSafe;
        }
    }