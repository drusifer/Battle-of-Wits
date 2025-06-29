import { AutoShuffleDeck } from './deck.js';
import { ChatSession } from './chat.js';

/**
 * The base class for all characters in the game.
 */
export class Character {
    /**
     * @param {string} name The character's name.
     * @param {string} emoji A single emoji to represent the character's profile image.
     * @param {object} messageDecks An object containing arrays of messages.
     */
    constructor(name, emoji, startMessages, generalMessages, dprWinMessages, dprLossMessages) {
        this.name = name;
        this.emoji = emoji;
        this.slug = name.toLowerCase().replace(/\s/g, '-');
        this.messages = new AutoShuffleDeck(generalMessages).reshuffle();
        this.startMessages = new AutoShuffleDeck(startMessages).reshuffle();
        this.dprWinMessages = new AutoShuffleDeck(dprWinMessages).reshuffle();
        this.dprLossMessages = new AutoShuffleDeck(dprLossMessages).reshuffle();
    }

    async login(chat) {
        this.chatSession = new ChatSession(this, chat);
        await this.chatSession.login();
    }

    /* everyone in characters says something. */
    async dialogueWith(characters) {
        await this.saySomething();
        const responseFrom = characters.pop();
        if (responseFrom) {
            await responseFrom.dialogueWith(characters);
        }
    }

    async logout() {
        await this.chatSession.logout();
    }

    /**
     * Sends a message to the chat session, optionally replacing placeholders within the message.
     * @param {string} message The message string to send.
     * @param {Object} [replaces={}] An optional object where keys are placeholders to be replaced (e.g., "%KEY%") and values are their replacements.
     */

    async say(message, replaces={}) {
        return new Promise(async (resolve, reject) => {
            try { 
                resolve(this._say(message, replaces));
            } catch (error) {
                reject(error);
            }
        });
    }
    
    _say(message, replaces={}) {
        let m = message;
        for (const [key, value] of Object.entries(replaces)) {
            m = m.replace(key, value);
        }
        return this.chatSession.say(m);
    }

    /** Draws a random message from the character's general message deck. */
    async saySomething(replaces={}) {
        await  this.say(this.messages.draw(),replaces);
    }
    
    /** Draws a random message from the character's starting message deck. */
    async sayStartMessage(replaces={}) {
        await this.say(this.startMessages.draw(), replaces);
    }

    /** Draws a random message from the character's ending message deck. */
    async sayEndMessage(dprWin = false, replaces={}) {
        if (dprWin) {
            await this.say(this.dprWinMessages.draw(), replaces);
        } else {
            await this.say(this.dprLossMessages.draw(), replaces);
        }
    }
}

export class DreadPirateRoberts extends Character {
    constructor(chat) {
        const startMessages = [
            "A battle of wits? A welcome change from the clang of steel.", "Let us begin. A lady's future hangs in the balance.",
            "I must warn you, I've played for higher stakes than this.", "Your confidence is admirable, but misplaced.",
            "Let's dispense with the theatrics and proceed to the intellectual contest.", "I trust you are a man of honor, Vizzini?",
            "The board is set. The pieces are moving.", "This is a game I do not intend to lose.",
            "Your reputation precedes you. Let's see if it's deserved.", "A test of minds. How civilized. 😏",
            "There is no room for error here.", "For the princess, I will risk everything.",
            "Let us see whose logic is superior.", "I am at your disposal. Begin when you are ready.",
            "The sooner we start, the sooner I am reunited with my love.", "This will be a duel to remember.",
            "I hope you've chosen a wine worthy of the occasion.", "Your challenge is accepted.",
            "The outcome of this is already decided.", "Let's have a clean fight, shall we?"
        ];
        const generalMessages = [
            "Let's get this over with, shall we? There's a princess to rescue.",
            "You've made your point, now make your move.",
            "The battle of wits has begun. It ends when you decide and we both drink...",
            "You're trying to trick me into giving away something. It won't work.",
            "I'm not a great fool, so I can clearly not choose the wine in front of you.",
            "All I have to do is divine, from what I know of you, where you would place the poison.",
            "I've spent years developing an immunity to iocane powder. This is nothing to me. 😏",
            "You've given yourself away already.",
            "I know something you do not know... I am not left-handed.",
            "The simplest choice is never the right one with a mind like yours.",
            "You seem a decent fellow. I'd hate to kill you.",
            "I can't help but feel you're overthinking this.",
            "Let us proceed. My lady is waiting. 👑",
            "This is a game of wits, not a shouting match.",
            "Your logic is fascinating, in a convoluted sort of way. 🧐",
            "I find your arguments... unconvincing.",
            "Are you always this verbose, or am I just special?",
            "You expect me to fall for such a simple trap?",
            "Patience is a virtue, Vizzini. Try to cultivate it.",
            "I'm considering every angle, every possibility.",
            "This reminds me of a puzzle I once solved in the court of Zanzibar.",
            "You're enjoying this, aren't you? The sound of your own voice.",
            "Let's not draw this out. We both know how it ends. ⚔️",
            "Your mistake was in thinking you were ever my intellectual superior.",
            "I've seen this trick before. It's not as clever as you think.",
            "I could be wrong, but I don't think so.",
            "There's a subtle clue in everything you say.",
            "One of us is about to be very disappointed.",
            "Let's drink. To the death! 🍷",
            "Your arrogance is your weakness.",
            "I'm merely watching you defeat yourself.",
            "There are variables at play here you haven't even considered.",
            "It all comes down to a simple deduction.",
            "The poison is in the details, is it not?",
            "I wonder what you'd think if you knew my true name.",
            "My mind is clearer than you can possibly imagine.",
            "You can't rush a decision like this.",
            "I'm weighing the options. Both of them.",
            "This is a delightful little problem.",
            "I do believe you've made a fatal error.",
            "The game is afoot, as they say.",
            "Let's see... what would a man like you do? 🤔",
            "You've constructed a clever scenario. I'll give you that.",
            "But is it clever enough?",
            "I think I have it. The answer is obvious.",
            "Shall we? The anticipation is killing me. Or you.",
            "The details betray you every time.",
            "I'm not the fool you take me for.",
            "Your hubris is a liability.",
            "Let me think... what is the most logical choice?",
            "Your theatrics are amusing, I'll admit.",
            "A simple choice between two goblets. What could be easier?",
            "I will not be rushed into making a mistake.",
            "I'm enjoying our little chat.",
            "But all good things must come to an end.",
            "The choice is clear.",
            "Your reasoning is flawed. Let me demonstrate.", "An interesting gambit, but a transparent one.",
            "You are attempting to appeal to my emotions. A classic error.", "The truth is often hidden in the simplest of details. 🤔",
            "Every word you speak gives you away.", "I am considering not only what you say, but what you don't say.",
            "Your microexpressions are quite telling.", "A fascinating psychological puzzle you present.",
            "This is less about the goblets and more about the minds behind them.", "You assume I am a simple pirate. You assume incorrectly.",
            "I must account for your intelligence, but also for your colossal arrogance.", "This requires careful consideration.",
            "You have laid a trap, not of poison, but of logic.", "I see the path to victory. It is narrow, but clear. ✨",
            "You believe you are in control. That is your first mistake.", "A bold move. Let's see if it pays off.",
            "I must be certain. There is no second chance.", "I am looking for the truth, not the obvious answer.",
            "Your condescension is a shield. What is it hiding?", "Every moment gives me more information."
        ];
        const dprWinMessages = [
            "And so, a brilliant mind falls to a righteous cause. To the victor go the spoils. ❤️",
            "The game is won. My lady, we are free.", "As I deduced. Your hubris was your undoing.",
            "A victory for logic and love. A fitting end.", "The better man won. It is as simple as that.",
            "May you find peace in the next world. 🙏", "And now, our story can continue.",
            "I am sorry it had to end this way.", "A necessary conclusion.", "I did what I had to do.",
            "The threat is neutralized.", "His reign of terror is over.", "Justice is served.",
            "Let this be a lesson to all who would stand against true love.", "I fought for more than my life. I fought for hers.",
            "His intellect was great, but his heart was small.", "The world is safer now.",
            "A grim task, but a finished one.", "Let's not linger. Our future awaits.", "Victory. ⚔️"
        ];
        const dprLossMessages = [
            "A fatal miscalculation... Buttercup... I have failed you... 💔", "The poison... faster than I thought...",
            "So this is how the story ends... not with a bang, but a whisper...", "My immunity... it wasn't enough...",
            "You... were the better man... after all...", "The darkness... is cold... *thud*",
            "I made a promise... I couldn't keep...", "Forgive me, my love...", "I see the stars...",
            "My journey... is over...", "I should have known...", "A fool's gambit...",
            "My final regret...", "I... am sorry...", "The world fades...",
            "Inconceivable...", "I have lost...", "The end...", "No...", "Buttercup..."
        ];
        super("Dread Pirate Roberts", "\u{2620}", startMessages, generalMessages, dprWinMessages, dprLossMessages);
        this.drankPoisonMessages = new AutoShuffleDeck([
            "It's a good thing I've built up a resistance to iocane powder. Let's go again, shall we?",
            "Merely a flesh wound. I've spent years building up an immunity to iocane powder. Your methods are... predictable. I've got time for one more, if you dare.",
            "Interesting. A lesser man would be dead by now, or at least mostly dead. Good thing I'm not a lesser man. Next round, Vizzini?",
            "Ah, iocane. I know it well. It seems my tolerance is still holding up. You'll have to try harder than that.",
            "A familiar tingling. But iocane and I have an understanding. It tickles, mostly. Shall we continue this delightful game?",
            "You'd think I'd learn, but then, where's the fun in that? Still standing, Vizzini. Your move.",
            "Tastes like... victory deferred. My constitution is, shall we say, robust. Another round to prove your genius?",
            "I've spent the last few years building up an immunity to iocane powder.",
            "My dear Vizzini, you'll have to do better than that. I've had stronger drinks at children's parties.",
            "Was that supposed to be your trump card? I must say, I'm rather underwhelmed. Perhaps another attempt?",
            "The iocane only sharpens my senses. A curious side effect, wouldn't you agree? Let's proceed.",
            "You seem surprised. Did you truly believe it would be that easy to dispose of the Dread Pirate Roberts? Draw your cups!",
            "A valiant effort, Vizzini. But as you can see, I am not so easily dispatched. Shall we try that again?"
        ]).reshuffle();
        this.gobletRoundMessage = new AutoShuffleDeck([
            "Alright. Where is the poison? The battle of wits has begun. It ends when you decide and we both drink, and find out who is right... and who is dead.",
            "It's so simple. All I have to do is divine from what I know of you: are you the sort of man who would put the poison into his own goblet or his enemy's?",
            "Now, a clever man would put the poison into his own goblet, because he would know that only a great fool would reach for what he was given. I am not a great fool, so I can clearly not choose the wine in front of you.",
            "But you must have known I was not a great fool. You would have counted on it, so I can clearly not choose the wine in front of me.",
            "You seem a decent fellow. I'd hate to kill you.",
            "Let's drink. One of us is about to be very disappointed.",
            "The choice is clear. I know where the poison is."
        ]).reshuffle();

        this.answerMessage = new AutoShuffleDeck([
            "The answer is, of course, ANSWER.",
            "It could only be ANSWER.",
            "After careful consideration, the only logical conclusion is ANSWER.",
            "You've made this too simple, Vizzini. The answer is clearly ANSWER.",
            "I believe the word you're looking for is ANSWER.",
            "My answer is ANSWER. And I am never wrong.",
            "Let us end this charade. The answer is ANSWER.",
            "The truth is simple, Vizzini. The truth is ANSWER.",
            "I will say it but once. ANSWER.",
            "You've given yourself away. The answer must be ANSWER.",
            "The word you seek is ANSWER.",
            "It is elementary. The answer is ANSWER.",
            "I stake my life on it. The answer is ANSWER."
        ]).reshuffle();


        this.gobletAnswerMessage = new AutoShuffleDeck([
            "You've given everything away, Vizzini. I choose the goblet on the SIDE!",
            "The choice was never between the goblets. It was about understanding you. I'll take the one on the SIDE.",
            "You assumed I was playing your game, but I was playing my own. The goblet on the SIDE, if you please.",
            "Your mistake was in thinking this was a game of chance. It was a game of character. And yours is transparent. The goblet on the SIDE.",
            "It was a simple deduction, based on your overwhelming arrogance. The wine on the SIDE is the only logical choice.",
            "You see, Vizzini, the poison is in the details. And your details are sloppy. I'll drink from the cup on the SIDE.",
            "You tried to lead me with logic, but you forgot about intuition. Mine tells me the correct choice is the goblet on the SIDE.",
            "I know something you do not know. I am not left-handed. And I am not a fool. The goblet on the SIDE.",
            "The entire game was a feint. The true answer lies with the goblet on the SIDE.",
            "You monologued. I deduced. The goblet on the SIDE."
        ]).reshuffle();
    }

    async sayDrankPoisonMessage(replaces={}) {
        await this.say(this.drankPoisonMessages.draw(), replaces);
    }

    async sayGobletRoundMessage(replaces={}) {
        await this.say(this.gobletRoundMessage.draw(), replaces);
    }

    async sayAnswerMessage(answer) {
        await this.say(this.answerMessage.draw(), {"ANSWER": answer});
    }

    async sayGobletAnswerMessage(side) {
        await this.say(this.gobletAnswerMessage.draw(), {"SIDE": side});
    }
}

export class Vizzini extends Character {
    constructor(chat) {
        const startMessages = [
            "You have the temerity to challenge me?! Me?! The greatest mind in a generation?!", "Let us begin your final lesson: never cross a Sicilian! SICILIAN!",
            "I have already deduced your every possible move. This is merely a formality.", "Gaze upon true genius, pirate, for it is the last thing you shall ever see!",
            "I shall be brief, as I have a war to start and a princess to dispose of.", "This isn't a battle of wits, it's an execution of a fool.",
            "I've already won. I'm simply allowing you the courtesy of discovering how.", "Hurry up! I wish to be done with this before luncheon.",
            "You are a child playing at a man's game. And I am a god at this game! 🧠", "Your confidence is born of ignorance. A fatal combination.",
            "Let's see what passes for 'thought' in that sea-addled brain of yours.", "I've concocted a logical labyrinth from which there is no escape.",
            "You dare match wits with me? You've chosen your opponent poorly, and your last moments will be spent in regret!",
            "Let's get this over with. I have kingdoms to destabilize, and your demise is but a footnote on my day's agenda.",
            "Look upon my face, pirate. It is the face of pure, unadulterated intellect. It is the last truly intelligent thing you will ever see.",
            "A battle of wits? Against me? It's like a battle of swimming against a fish! You are out of your element!",
            "I've already calculated 1,427 ways this can end. They all involve your pathetic demise. Let's see which one you choose.",
            "You may have faced the terrors of the sea, but you have never faced the maelstrom of a Sicilian mind!",
            "I will not insult your intelligence by wishing you luck. You have none to speak of.",
            "The princess will be my witness as I dismantle your feeble logic, piece by pathetic piece.",
            "Do you hear that? It is the sound of inevitability. My victory is preordained.",
            "Let us begin this farce. I am eager to see the look on your face when you realize your utter folly.",
            "This is delightful! I do so enjoy proving my superiority.", "You are a fly, and I am the master of the web.",
            "Every word you say will be a nail in your own coffin.", "Shall we? I am eager to hear your final words.",
            "Prepare for a lesson in intellectual annihilation.", "I took the liberty of poisoning your wine. And mine.",
            "You cannot win. The game is rigged. By me.", "Let's see if your sword arm is as slow as your mind."
        ];
        const generalMessages = [
            "You're falling victim to one of the classic blunders!",
            "Never go in against a Sicilian when death is on the line! Ha ha ha ha! 🤣",
            "Inconceivable!",
            "Am I going too fast for you?",
            "My intellect is a dizzying intellect. You stand no chance.",
            "I'm waiting! Has your brain ground to a halt? ⏳",
            "And you think you can best *me*? A common pirate?",
            "You're just stalling for time! A futile effort! 🙄",
            "Finish your thought before old age claims us both!",
            "The suspense is... well, it's not suspenseful at all, is it?",
            "Do you require a diagram? Perhaps some puppets?",
            "I've outsmarted kings and emperors, you are but a minor diversion.",
            "This is not a difficult choice for a man of any intelligence.",
            "Have you ever considered a career in something more suited to your... talents? Like mucking out stables?",
            "The princess is looking rather bored. So am I. 😒",
            "For a legendary pirate, you're not very decisive.",
            "Is your brain tingling? That's either the sign of a thought, or a stroke. Let's hope for the latter.",
            "I am a genius. A genuine, certified genius. 🧠",
            "You're trying to employ psychology. It's adorable, really.",
            "Have you made your decision? Or shall we reconvene next spring?",
            "Bah! I have no time for these games!",
            "Your attempts at banter are as dull as your sword is sharp, I imagine.",
            "You can't be serious. That's your line of reasoning?",
            "Simply choose, you imbecile!",
            "I'm growing weary of this.",
            "The sheer idiocy of your position is staggering. 🤯",
            "Let me explain it to you... slowly.",
            "You see, you've made a simple logical fallacy.",
            "It's a child's puzzle! A child's!",
            "I'm surrounded by fools. Utter fools.",
            "Do you smell something? It's the scent of your impending doom. And it's not iocane.",
            "This is taking entirely too long.",
            "I could have conquered a small country in the time you've taken to think.",
            "Honestly, it's almost a pity to poison someone so... simple.",
            "Ah, I see the gears turning. They're rusty, but they turn.",
            "Are you enjoying the mental strain? The feeling of your brain sweating?",
            "What a fool-proof plan! You'll be a fool, and I'll be proven right! 🤡",
            "There is no 'dread' in you. Only tedium.",
            "I am Vizzini! And you are a feckless, brainless pirate!",
            "Have you considered just guessing? Your chances would be no worse.",
            "The entire world revolves around me, and you are but a speck of dust.",
            "A moment of silence, please, for the death of this conversation.",
            "You are not a wit. You are a half-wit.",
            "This is a battle of wits, but you've arrived unarmed.",
            "I am on a schedule! I have a war to start, a princess to kill.",
            "Your stalling tactics are as transparent as glass. 👎",
            "I've forgotten the question, it's been so long.",
            "Could you be any slower?",
            "The cogs of your mind are grinding to a halt.",
            "You're not even a worthy adversary.",
            "This is just sad to watch, really.",
            "I feel like I'm playing chess with a pigeon.",
            "It's not my fault you're a moron.",
            "I've had more stimulating conversations with my horse.",
            "Just point to a goblet, you blithering idiot!",
            "This is why civilization is failing.",
            "Let's move things along, shall we? I have plans for the afternoon.",
            "Is your brain malfunctioning? Shall I get you a bucket? 🤡", "The mental gymnastics you must be performing to arrive at such a stupid conclusion are truly staggering. 🤸",
            "INCONCEIVABLE!", "Am I going too fast for you?", "My intellect is a dizzying intellect. I'm surprised you can even stand in its presence.",
            "Hurry up! My brain is atrophying from this conversation! ⏳", "Your attempts at psychology are as pathetic as a kitten's roar.",
            "Let me dumb it down for you.", "It's a simple matter of logical deduction, a concept I'm sure is foreign to you.",
            "Bah! Stalling again! Are you incapable of making a decision?", "I'm surrounded by idiots! Utter, complete, half-witted idiots!",
            "I'm bored. This is boring. You are boring me to death, which is ironic, isn't it? 🙄", "You see, you've fallen for my trap perfectly.",
            "I can practically smell the rust on your mental gears from here.", "Have you considered that perhaps you're just not very smart?",
            "This is not complex! A dung beetle could have solved this by now!", "Are you listening to me? Or is the sea water still sloshing in your ears?",
            "You're trying to use reverse psychology on me? ME? The man who INVENTED reverse psychology? Inconceivable!",
            "Is that a thought forming, or did a gear in your head just strip itself bare?",
            "Your logic is so flawed, it's a wonder you can even stand upright.",
            "I'm not just one step ahead of you, pirate. I am on an entirely different intellectual plane of existence.",
            "Stop breathing so loudly. I can't hear the sound of my own genius.",
            "You are a simpleton, a poltroon, a... what's the word... ah yes, a PIRATE.",
            "Every word you utter is another shovel of dirt on your own grave. Keep talking.",
            "I've had more stimulating intellectual debates with a head of cabbage!",
            "Are you trying to bore me to death? Is that your strategy? It's surprisingly effective!",
            "You are a walking, talking example of the Dunning-Kruger effect. Look it up. Oh, wait, you can't.",
            "I have no time for this dallying!", "Just make a choice so I can watch you die!", "This is tedious. Utterly tedious."
        ];

        const dprWinMessages = [
            "Impossible! You must have cheated! There's no other explanation! 😡", "My flawless logic... defeated by a common brute... *gasp*...",
            "You switched the goblets when I wasn't looking! You must have!", "This can't be... I am Vizzini! The greatest mind... *thud*",
            "The poison... was in my goblet...? But... how...?", "You... guessed? No! It cannot be!",
            "I... I feel... unwell...", "A fluke! A statistical anomaly!", "My plan... was perfect...",
            "I outsmarted myself...? No...", "This is not the logical outcome!", "I... am... slain...",
            "A trick! A parlor game! You must have poisoned me while I was monologuing!",
            "My calculations... they were flawless! The universe must have made an error!",
            "This... is not... logical... *gurgle*...",
            "You didn't win! I was simply... distracted by your staggering stupidity!",
            "The princess... tell her... my intellect was... dizzying... *cough*",
            "Never... trust... a man... with... a mask... *thud*",
            "My only miscalculation... was underestimating the depths of your luck!",
            "This is merely a setback! In the next life, I shall be... even... smarter... *gasp*",
            "You haven't won! You've merely... postponed... the inevitable... *croak*",
            "Inconceiv... able...",
            "You fool! You will never get away with this!", "This wasn't supposed to happen!", "My reputation... my life...",
            "The world... is... dizzying...", "How...?", "But... why...?", "No... NO...", "*collapses*"
        ];
        const dprLossMessages = [
            "Hahaha! You absolute buffoon! You chose death! Now the princess is mine! 🏆", "Another intellectual inferior falls before the might of Vizzini! Was there ever any doubt?!",
            "Precisely as I predicted! Your simple mind was no match for my own!", "To the death! YOUR death! How marvelously entertaining!",
            "I told you not to cross a Sicilian! Why don't people listen?!", "And now, to start a war. My work is never done.",
            "Let this be a lesson to all who dare challenge true genius!", "He's dead? So soon? I was hoping he'd suffer more. Oh well.",
            "Flawless. Another flawless plan by Vizzini.", "I almost feel pity for you. Almost. 😂",
            "And that, my dear princess, is how you deal with pirates.", "So predictable. I knew you'd choose that one.",
            "A triumph of the mind!", "He actually thought he had a chance. Adorable.",
            "And so, the pirate's tale ends not with a bang, but with a whimper of his own foolishness. Hah!",
            "See? The brain always triumphs over the brawn. And my brain is the brainiest!",
            "I almost feel a pang of... no, it's just indigestion. Your stupidity was hard to swallow.",
            "Another one falls to the Sicilian intellect! Is there no one left to challenge me?",
            "Let that be a lesson to you, princess. Never bet against a sure thing. And I am the surest thing there is.",
            "He's dead. How droll. I expected more of a struggle. I am, as usual, disappointed by my opposition.",
            "And now, the world is free of another fool who thought he could out-think his betters.",
            "Victory is mine! As it was always meant to be. The script was written by me, for me.",
            "He chose... poorly. As I knew he would. The predictability of simple minds is my greatest weapon.",
            "Well, that was a pleasant little diversion. Now, back to my plans for world chaos.",
            "The world is now free of one more simpleton.", "Now, where were we? Ah yes, global domination.",
            "And the crowd goes wild! For me, of course.", "Checkmate.", "Game, set, and match. To me.", "I am victorious! As always."
        ];

        super("Vizzini", "\u{1F9D0}", startMessages, generalMessages, dprWinMessages, dprLossMessages);

        this.gobletRoundMessages = new AutoShuffleDeck([
            "No more banter! The time has come to choose.",
            "Enough of these childish riddles! Let us proceed to the main event: your demise!",
            "The intellectual sparring is over. Now, we play for keeps. And by 'keeps,' I mean your life.",
            "Behold, pirate! Two goblets. One contains a delightful vintage. The other... well, the other is for you.",
            "Observe them closely, D.P.R. Your pathetic life may depend on your meager powers of observation.",
            "The moment of truth, you sniveling poltroon! Choose your destiny, or rather, your doom!",
            "Ah, the sweet scent of impending victory! 🍷 One of these holds your doom, pirate. Can you smell it? Or is that just your fear? 🤢",
            "No more riddles to hide behind, D.P.R.! Just a simple choice. Life... or a rather unpleasant death. 🤔 Choose wisely... or don't. It's more amusing for me if you blunder!",
            "The grand finale! 🎭 Two chalices, one choice. Will it be the sweet nectar of survival, or the bitter draft of oblivion? The suspense is... well, not for me. I already know you'll fail.",
            "Enough! My patience wears thin, much like your chances of survival. Pick a cup, any cup! 🥤 Just know that one of them is your express ticket to the afterlife. ☠️",
            "The time for talk is over! Now, we have the only conversation that matters: life and death!",
            "Forget the riddles, forget the banter! This is the grand finale, the ultimate test!",
            "Behold! The instruments of your doom, or your salvation. Though let's be honest, mostly your doom.",
            "All your supposed cleverness, all your travels, it all comes down to this single, simple, fatal choice.",
            "I've grown tired of the sound of your voice. Let us conclude this with the silent judgment of the wine.",
            "One of these goblets holds your future. The other holds... well, it holds the end of your future.",
            "No more hiding behind masks or clever phrases, pirate. It is just you, me, and a 50/50 chance at oblivion.",
            "This is the point of no return! Choose, and let fate, guided by my intellect, decide the rest!",
            "The final act! Will you receive applause or a tombstone? The choice is yours, but the outcome is mine.",
            "Let us dispense with the foreplay and get to the consummation of your defeat!",
            "Let the true test begin! No more wordplay, just pure, unadulterated chance... guided by my superior intellect, of course. 😉 Your move, simpleton."
        
        ]).reshuffle()

        this.preRiddleMessages = new AutoShuffleDeck([
            "Now, for a true test of your... 'intellect'. A single word, pirate, is all I require. 😠",
            "Let us see if that pirate brain of yours can condense its meager thoughts into one solitary utterance. 🧠",
            "Prepare yourself, for I am about to engage your mind in a way it has never been engaged before! Your response, a single word, will seal your fate! 💀",
            "A riddle, then! And your answer, a mere syllable, will determine if you live or die! ⚖️",
            "Perhaps this will amuse the princess while you flounder. But remember, only one word may pass your lips. 🤫",
            "I've devised a little something to expose the depths of your ignorance. Your reply? A single, concise word. 🤏",
            "Consider this a warm-up for your brain... though I doubt it will help. Your answer, one word, if you please. 🙄",
            "Let's see if there's anything rattling around in that thick skull of yours. A single word, pirate, is all I demand. 😤",
            "A simple question, for a simple man. Or is it? Your answer, one word, will reveal all. ✨",
            "Now, pay attention. This may be beyond your meager comprehension, but try. Your reply must be a single word. 📚",
            "I almost feel guilty posing such a challenge to one so clearly outmatched. Almost. Your answer, a solitary word, will suffice. 😒",
            "My intellect demands precision. Therefore, your answer to my impending riddle must be a single, unadorned word. 🎯",
            "Do not waste my time with lengthy explanations. Your solution, a single word, is all that matters. ⏱️",
            "The answer is simple, if you are not a fool. Prove me wrong with one word, if you dare. 😈",
            "I seek not eloquence, but accuracy. A single word, pirate, will tell me if you possess either. 🧐",
            "This riddle requires a mind capable of distillation. Your answer, a single word, will be the proof. 🧪",
            "One word, pirate. That is the currency of this exchange. Do you have it? 💰",
            "I have no patience for rambling. Your answer, a single word, or your life is forfeit. 🔪",
            "The essence of the truth can be captured in a single word. Can you find it? 💡",
            "My riddle approaches. Your response, a solitary word, will be your judgment. 👑",
            "My next question demands a single, unhesitating word, pirate! Do not disappoint me. 😡",
            "Your intellect, if it exists, must now condense into one solitary word. Fail, and you perish! ☠️",
            "I require a single, precise term. Anything more, and you prove yourself a verbose fool! 🗣️",
            "One word, pirate! That is the only acceptable response to my genius! 🏆",
            "Distill your thoughts! A single word is all I will permit! 💧",
            "Your answer, a solitary word, will be your judgment. Choose wisely! 🤞",
            "Do not equivocate! A single word, or your life is forfeit! 🗡️",
            "My patience is finite. One word, and we proceed. Otherwise, we conclude! 🛑",
            "The truth, in one word! Can your simple mind grasp such brevity? 🤏",
            "Speak! But let your entire response be but a single, solitary word! 🤐",
            "My next query is a masterpiece of conciseness. Your answer must be its equal. One word!",
            "Do not clutter the air with your usual drivel. A single word is the key. Can you find it?",
            "I will now present a puzzle so elegant, its answer can only be one word. Do not embarrass yourself.",
            "The following riddle is a test of focus. Focus your entire, limited vocabulary into a single utterance.",
            "Brevity is the soul of wit. Let's see if you have any. One word, pirate.",
            "I am about to speak. When I am done, you will speak. You will speak one word. Understood?",
            "This next test requires not just intellect, but discipline. The discipline to use but a single word.",
            "I will give you a riddle. You will give me a word. It is a simple transaction. Do not complicate it.",
            "The answer is as simple as it is brilliant. It is one word. Let's see if you can find it.",
            "Silence your babbling tongue! The only thing I wish to hear from you is a single, correct word!"
        ]).reshuffle();

        this.riddleCorrectResponses = new AutoShuffleDeck([
            "A lucky guess! A blind pig finds an acorn every century or so! Don't let it go to your head.",
            "Impossible! You must have cheated! Did the princess signal you? No matter, it was a trivial riddle for a trivial mind.",
            "Correct. Of course it's correct. It was an infantile puzzle! I was merely testing if you were sentient.",
            "Hmph. So you can solve a simple word game. A trained monkey could do as much. Now for the REAL test of intellect!",
            "INCONCEIVABLE! You... actually got it right. A fluke! A statistical anomaly of cosmic proportions!",
            "Yes, yes, that's it. Very good. Now, have you been practicing, or was that a moment of accidental competence?",
            "Correct. As I calculated you would be. It's all part of my grander design to give you a sliver of hope before crushing it entirely.",
            "Well, well. A flicker of intelligence. Don't strain yourself, pirate, you might pull a muscle in that oversized head of yours.",
            "Fine. You pass. But that was merely the appetizer. The main course involves death, and you're the guest of honor!",
            "That's... the right answer. I'm... astonished. And annoyed. Mostly annoyed. Let's move on!",
            "Bah! A lucky shot in the dark! Even a broken clock is right twice a day!",
            "You must have heard this one before! It's impossible for you to have deduced it on your own!",
            "Correct. I made it simple on purpose, to lull you into a false sense of security. It's working perfectly.",
            "So, the brute has a vocabulary. I'm underwhelmed. Now for a real challenge.",
            "Hmph. You got it. I'm not impressed. A child could have solved that. A smart child. Not you.",
            "Yes, yes, that's the word. Don't look so proud. It was a gift.",
            "Correct. But getting one answer right in a battle of wits is like bringing one drop of water to a raging fire. Futile.",
            "Well, what do you know. A spark of cognizance. Don't let it fizzle out.",
            "That is... surprisingly correct. I may have underestimated your capacity for random guessing.",
            "Fine, you win this round. But the war of minds is far from over, and you, sir, are losing badly."
        ]).reshuffle();

        this.riddleIncorrectResponses = new AutoShuffleDeck([
            "Wrong! Pathetically, predictably, UTTERLY wrong! HA! I knew you were a fool!",
            "Not even close! Is your brain merely a ballast to keep your head from floating away? Inconceivable!",
            "No, you blithering idiot! The answer was obvious to anyone with an intellect greater than a sea slug's!",
            "Was that an answer or did a goat just clear its throat? Wrong! So very, very wrong!",
            "And that, my dear princess, is the sound of a pirate's brain misfiring. A sad, pathetic little 'pop'.",
            "I have seen rocks with more intellectual acumen! You are not worthy of my riddles!",
            "Wrong! And with that, any hope you had of impressing me has evaporated. Now, let's get to the dying.",
            "You see? You see how your mind is no match for mine? You are a child playing checkers against a grandmaster of chess!",
            "I almost feel sorry for you. Almost. But my pity is eclipsed by the sheer spectacle of your stupidity!",
            "That's not the answer. That's not even a word in any civilized language! You are a buffoon in a mask!",
            "Wrong! So profoundly, spectacularly wrong! I almost feel second-hand embarrassment for you!",
            "That wasn't even a guess! That was a cry for help from a drowning intellect!",
            "No, no, NO! The answer was elegant, simple, and completely beyond your grasp, wasn't it?",
            "I've heard more intelligent responses from a parrot! And the parrot was just hungry!",
            "You have managed to fail a test I designed to be foolproof. You are a new and exciting kind of fool!",
            "That answer is so far from correct, it's in a different time zone! In a different, stupider, dimension!",
            "And with that, you have proven beyond all doubt that your head is filled with nothing but sea foam and regret.",
            "Wrong! As I knew you would be. My genius lies not only in crafting the riddle but in predicting your failure.",
            "Was that your final answer? It was pathetic. Truly, a new low in the annals of stupidity.",
            "I weep for the state of education that produced a mind like yours. Wrong! Utterly, hopelessly wrong!"
        ]).reshuffle();

    }

    async sayRiddleAnswerResponse(is_correct, replaces={}) {
        if (is_correct) {
            await this.say(this.riddleCorrectResponses.draw(), replaces);
        } else {
            await this.say(this.riddleIncorrectResponses.draw(), replaces);
        }
    }

    async sayGobletRoundMessage(replaces={}) {
        await this.say(this.gobletRoundMessages.draw(), replaces);
    }

    async sayPreRiddleMessage(replaces={}) {
        await this.say(this.preRiddleMessages.draw(), replaces);
    }
}

export class Buttercup extends Character {
    constructor(chat) {
        const startMessages = [
            "Wesley, I know your mind is as sharp as your sword. You can defeat this man.", "Please, there is no need for this bloodshed! He is a good man!",
            "I cannot watch this. My heart aches with fear for you.", "Remember, my love, your life is everything to me. Be careful.",
            "This man is a monster, Wesley. Do not trust a word he says.", "I will be right here. I will not leave your side.",
            "Let your love for me guide your thoughts.", "He is arrogant. Use that against him.",
            "I know you will save us. You always do. 🙏", "Be strong, my farm boy.", "This is a terrible, terrible game.",
            "I believe in you more than anything.", "May your mind be as steady as your heart is true.",
            "Don't let him see your fear. Or mine.", "Please... come back to me.",
            "He thinks he is clever, but you are wise.", "This is not a fair fight.",
            "I am so afraid... but I am so proud.", "For us, Wesley. Win for us.", "My love, my hero."
        ];
        const generalMessages = [
            "I know you can do it, Wesley. You've never failed me. ❤️",
            "Just think, my love. You're the cleverest man I've ever known.",
            "Don't listen to him, he's just trying to confuse you!",
            "I have faith in you, my dear Wesley. ✨",
            "You can outsmart him, I know it!",
            "Leave him alone, you beast!",
            "He is not a common pirate! He is the Dread Pirate Roberts!",
            "Your arrogance will be your undoing!",
            "Don't you dare touch him!",
            "He'll defeat you! You're no match for him!",
            "He's trying to trick you with his words, my love. See through them!",
            "You've faced worse than this, I'm sure of it. 💪",
            "Remember all you've learned on your adventures!",
            "His confidence is a mask for his fear.",
            "Pay him no mind, Wesley. Focus.",
            "For me, Wesley. Win this for me. 🙏",
            "You are my true love. Nothing can stand in your way.",
            "This little man is no match for your courage.",
            "His insults mean nothing. They are the ramblings of a bully.",
            "You have my heart. That is all the strength you need. ❤️",
            "Silence, you pompous fool! Let him think!",
            "He is twice the man you will ever be!",
            "Your words are as empty as your heart.",
            "Don't let his taunts distract you from the truth.",
            "I know that look. You've already solved it, haven't you?",
            "I believe in you, always.",
            "He underestimates you. That will be his downfall.",
            "This is just another adventure for you, my love.",
            "My farm boy is cleverer than any king.",
            "Just breathe, Wesley. You know the answer.",
            "You vile man! Your cruelty knows no bounds!",
            "He fights for love. You fight only for greed.",
            "That is not true! He is brilliant!",
            "Soon we will be free of this monster.",
            "I am with you, no matter what happens. 💖",
            "He is clever, but you are wise.",
            "Let his own ego be his poison.",
            "You've come too far to fail now.",
            "Think of our future together.",
            "He may have a dizzying intellect, but you have a true heart.",
            "Stop tormenting him!",
            "You are just a coward hiding behind a riddle!",
            "His mind is a labyrinth of lies. Don't get lost.",
            "You are my hero, Wesley.",
            "I'll not stand for your mockery!",
            "You are playing his game. But you will win it. ✨",
            "Focus on the goblets, my love, not on his noise.",
            "The truth is there. You just have to see it.",
            "I love you. That is all that matters.",
            "He's a bully, and bullies are cowards.",
            "This man's pride will be his undoing.",
            "You are calm and steady. He is agitated and loud.",
            "He's the one who is stalling, not you.",
            "You have honor. He has none.",
            "I'll be right here, waiting for you.",
            "This is almost over. Stay strong. 🙏",
            "Don't let him see your fear.",
            "You are doing wonderfully.",
            "He talks and talks, but you think. That is your advantage.", "That's a non sequitur, Vizzini. Your premise doesn't support your conclusion.", "Pay attention to his rhetoric, Wesley. He uses ad hominem attacks to distract from his weak arguments.",
            "He's trying to provoke an emotional response. Don't let him. Stay analytical. ❤️", "That's an appeal to authority fallacy. Just because he's Sicilian doesn't make him right.",
            "He's speaking quickly to confuse you, my love. Take your time.", "The more he insults you, the less confident he truly is.",
            "He's presenting a false dichotomy. There may be other options he's not mentioning.", "His logic is circular. He's using his conclusion as proof.",
            "Don't listen to him, Wesley! He's a bully!", "You are a hundred times the man he is!",
            "He's all talk. A loud-mouthed coward.", "You have something he will never have: honor.",
            "He is underestimating you. That gives you the advantage.", "His argument is full of holes. You can see them, I know you can.",
            "Stay focused, my love. You are almost there. ✨", "He's trying to rush you into a mistake.",
            "That's a red herring! He's trying to lead you astray!", "Analyze his assumptions. They are his weak point.",
            "He's not a genius. He's just a cheat.", "Your quiet confidence is more powerful than all his noise."
        ];
        const dprWinMessages = [
            "I knew it! Oh, my love, I knew your heart and mind were true! ✨", "We're safe! Oh, Wesley, you've saved us all!",
            "I never doubted you for a moment! My brilliant, wonderful hero!", "The nightmare is over. We can finally be together.",
            "His arrogance was no match for your wisdom.", "Let's leave this dreadful place.",
            "I am the luckiest woman in the world.", "My love is victorious!", "I love you more than words can say. ❤️",
            "He deserved it. He was a monster.", "Now we can have our happily ever after.",
            "You are safe. That's all that matters.", "I could kiss you forever!", "Let's go.",
            "My heart is soaring!", "The world is right again.", "I'm so proud of you.",
            "You faced death and you won.", "My Dread Pirate Roberts.", "My Wesley."
        ];
        const dprLossMessages = [
            "No! This can't be! My love... lost to a charlatan's trick... 😭", "You've won nothing, Vizzini. You've only proven what a monster you are.",
            "My life is over. There is nothing left without him.", "I will avenge you, Wesley. I swear it.",
            "You vile, evil man! May you rot!", "My heart is shattered into a thousand pieces.",
            "I will never love again.", "He died for me... He died for love.",
            "The light has gone out of the world.", "I would rather have died with him than live a moment without him.",
            "There is no honor in this victory.", "He was my true love. My only love.",
            "This pain... is unbearable.", "I will see you again one day, my love. But not yet.",
            "You have taken everything from me.", "This is not the end. I will not let it be.",
            "My Wesley... gone...", "I will never forget you.", "As you wish...", "My heart... is gone..."
        ];
        super("Buttercup", "\u{1F451}", startMessages, generalMessages, dprWinMessages, dprLossMessages);
    }
}

export class Gramps extends Character {
    constructor(chat) {
        const startMessages = [
            "Alright, so the prince has the princess, but the man in black is on their trail...", "Now, this is where it gets good. Pay attention.",
            "Vizzini, the Sicilian, he's the brains of the operation. Or so he thinks.", "He's challenged the man in black to a battle of wits. To the death.",
            "Okay, are you comfortable? We're at one of the best parts.", "This was my favorite part when I was your age.",
            "He's going to outsmart him. Just watch.", "The princess is scared, but she's trying to be brave.",
            "Two goblets. A little wine. A deadly poison. Classic.", "Listen closely. Vizzini likes to talk, and he gives things away.",
            "This is what the story is all about. Not just fighting, but thinking.", "The man in black has a plan. He always has a plan.",
            "Let's see what happens next, shall we?", "It's all about deduction. And a little bit of nerve.",
            "You wanted action? This is intellectual action!", "Here we go. The tension is building.",
            "He's giving him a choice. A deadly choice.", "And Buttercup has no idea that the man in black is her Wesley.",
            "This Vizzini fellow is a real piece of work, isn't he?", "Shh, shh. The game is beginning.",
            "This old book has seen better days, but the story is timeless.", "Are you ready? No interruptions now.",
            "He has to choose between the two cups. A perfect dilemma.", "The princess watches, her heart in her throat.",
            "This scene is all about psychology.",
            "It's not about the poison, it's about the people.",
            "Now Vizzini thinks he's in control. But is he?", "The man in black is letting him talk. It's a strategy.",
            "This is a game of high stakes.", "The most important thing is to never let your opponent know what you're thinking.",
            "Okay, deep breath. Here we go.", "It's about to get very clever.",
            "Let's see... Where did we leave off? Oh, yes, <i>The Man in Black approached Vizzini with his sword drawn, but quickly lowered his weapon when Vizzini drew his dagger closer to Buttercup's exposed neck.</i> Vizzini, seeing his chance, then declared:",
            "Let's continue shall we?  <i>Now, Vizzini, the clever clogs, thought he had the Man in Black cornered. Buttercup was pale as a sheet.",
            "So, the Man in Black, cool as a cucumber, faced down the Sicilian. Vizzini, never one to miss a chance to gloat, puffed out his chest and spoke,",
            "Right, so, swords were no good here, not with Buttercup in the way. Vizzini, always thinking he's the smartest man in the room, decided it was time for a different kind of fight.",
            "Okay, so the jig was up. The Man in Black was there, Vizzini had the princess. Stalemate? Not for a mind like Vizzini's!",
            "Let me see... ah, yes. The air was thick with tension. The Man in Black stood ready, but Vizzini, he had a different kind of duel in mind. He cleared his throat and announced with a sneer...",
            "So, with swords at a standstill, Vizzini, ever the showman, decided to change the game. He looked the Man in Black up and down and then, with a flourish, he laid down his challenge...",
            "Right, so, no immediate swordplay, much to your disappointment, I'm sure. Vizzini, seeing his chance to prove his 'dizzying intellect,' then made his move, starting with...",
            "Okay, picture this: cliffs, sea, a terrified princess, a dastardly villain, and our hero. Vizzini, holding all the cards, or so he thought, then declared the terms of their contest...",
            "Now, this is where Vizzini thinks he's being incredibly clever. Instead of a fight of brawn, he proposes a fight of brains. He looks at the Man in Black and, with a smug grin, says...",
            "So, the Man in Black couldn't just rush in. Vizzini, enjoying the spotlight, decided to set the terms for their little... disagreement. With a grand gesture, he began his infamous challenge..."
        ];
        const generalMessages = [
            "Patience now. We're getting to it.", "Yes, yes, I know. But you have to listen to this part.",
            "It's all part of the story. It wouldn't be as good without it.", "Just a little bit longer. You'll see.",
            "He's not stalling, he's thinking. There's a difference.", "That's what Vizzini *wants* you to think.",
            "Don't worry. The good part is coming up.", "Let me read. You're interrupting the flow.",
            "It's supposed to be confusing. That's the point.", "Trust me, this is better than any video game.",
            "Ah, but that's the beauty of it. It's a battle of minds.", "Let the man talk. He's digging his own grave.",
            "You're missing the nuances.", "It's called building suspense.",
            "You have to pay attention to the details.", "Alright, alright. I'll skip ahead a little. But you'll miss the best lines.",
            "He's not boring, he's arrogant. And that's his weakness.", "Just listen. You might learn something.",
            "It's about the journey, not just the destination.", "Okay, okay. Here comes the action.",
            "No, he's not just guessing. He's calculating.", "Let the scene play out. It's worth it.",
            "You're asking good questions, but the answers are in the story.", "If you're not patient, you'll miss the clue.",
            "This is character development!", "It's not boring, it's intellectual.",
            "You have to understand the characters to understand their choices.", "Stop shaking the bed, I'm trying to read.",
            "It's more exciting than you think.", "The best battles are fought with words."
        ];
        const dprWinMessages = [
            "See? What did I tell you? The hero won!", "He outsmarted him completely. A perfect victory.",
            "And that, my boy, is why you never go in against a Sicilian when death is on the line. Unless you're the Dread Pirate Roberts.",
            "A triumph for true love and a sharp mind. The best combination.", "He was never in any real danger. He was too clever.",
            "And Vizzini, for all his talk, was beaten. The end.", "A happy ending for this chapter.",
            "The bad guy gets what's coming to him. That's how these stories work.", "He solved the puzzle. And now he gets the girl.",
            "Wasn't that great? Better than any sword fight.", "And Buttercup realizes her Wesley is alive and brilliant.",
            "A classic ending. The smart hero wins the day.", "And they say talk is cheap. Not today.",
            "He turned the man's greatest strength, his intellect, against him.", "That's the power of thinking ahead.",
            "And now, for their escape!", "A lesson well taught.", "The world is safe from Vizzini's monologues.",
            "And that's why this is the greatest story in the world.", "The end of the chapter. For now.",
            "Bravo! A flawless performance.", "He beat him at his own game.",
            "Justice, in a wine goblet.", "The power of a logical mind.",
            "And Vizzini never knew what hit him.", "That's what you call a 'checkmate.'",
            "The hero's journey continues.", "Wasn't that exciting?",
            "Now he can finally be with his true love.", "A perfect conclusion."
        ];
        const dprLossMessages = [
            "Oh. Well... that's... unexpected.", "It seems... the hero has fallen.",
            "Sometimes... even the cleverest man can make a mistake.", "That's a very sad ending. Very tragic.",
            "Well, that's not how it's supposed to go.", "I... I think I might have read that part wrong.",
            "The princess is captured... the hero is gone... a dark day.", "Vizzini won. The bad guy won.",
            "That's the end of the story. A very short story.", "I don't like this ending at all.",
            "Well, sometimes life is like that. Unfair.", "That's a terrible lesson to learn.",
            "The story's over. I'm sorry.", "I guess he wasn't as smart as we thought.",
            "That's... that's a real shame.", "The End. A very sad end.",
            "I think I liked it better the other way.", "Let's... let's just pretend that didn't happen.",
            "A world without Wesley... unimaginable.", "Well, that was depressing.",
            "Sometimes the story doesn't have a happy ending.", "I... I don't know what to say.",
            "The light of the world has gone out.", "A tragic miscalculation.",
            "The hero has been defeated.", "This is not the story I remember.",
            "All that for nothing. How sad.", "Let's close the book for today.",
            "That's a tough lesson in humility.", "Even the best of us can fall."
        ];

        super("Gramps", "\u{1F474}", startMessages, generalMessages, dprWinMessages, dprLossMessages);

        this.gobletRoundMessages = new AutoShuffleDeck([
            "Alright, alright, settle down. So, where were we? Ah, yes... Vizzini had laid out the goblets. The tension was so thick you could cut it with a butter knife. And the Man in Black, cool as ever, surveyed the scene and declared:",
            "Okay, okay, no more questions for a minute. So, the riddles were done, and now it was time for the real test. Vizzini, smug as ever, presented the two cups. The Man in Black looked from one to the other, his face unreadable, and then he spoke:",
            "Sure, Sure... Right then. So, after all that back and forth with the riddles, it came down to this: two goblets, one choice. The princess held her breath. Vizzini smirked. And the Man in Black, after a moment of quiet contemplation, finally said:",
            "Now, this is the crucial part. Vizzini had played his hand, or so he thought. The goblets sat there, gleaming. One held wine, the other, death. The Man in Black, never one to be rushed, took a long look and then announced:",
            "Okay, quiet now. So, the moment of truth had arrived. The riddles were just a prelude. Now, it was life or death. The Man in Black, with the fate of the princess hanging in the balance, looked at Vizzini, then at the goblets, and stated calmly:",
            "Hush now, let an old man read. So, Vizzini, with a flourish, presented the two chalices. The air crackled with unspoken words. The Man in Black, ever the strategist, paused, then with a steady voice, he uttered:",
            "Alright, settle in. The Sicilian had made his move, confident as ever. Two goblets, identical to the eye. One held salvation, the other, oblivion. The Man in Black, betraying no emotion, then broke the silence with:",
            "Now, where did I leave off? Ah, yes! The riddles were but an appetizer. The main course, a deadly decision, was served. Vizzini watched, a cruel smile playing on his lips, as the Man in Black considered his options and then declared:",
            "Okay, no more fidgeting. The scene was set. Two goblets, one destiny. The princess watched, her heart pounding like a drum. The Man in Black, after a long, thoughtful pause, finally spoke his mind:",
            "Shhh, this is important. Vizzini, with all the arrogance of a king, gestured to the wine. 'Choose,' he hissed. The Man in Black, unflustered, met his gaze and then, with a voice as smooth as silk, he said:"
        ]).reshuffle();
        

        this.openingMessages = new AutoShuffleDeck([
            "Heard you were under the weather, sport. Thought a bit of 'The Princess Bride' might be just the ticket.",
            "Feeling a bit rough, eh? Nothing like a classic adventure to take your mind off things. Where were we...?",
            "Don't you worry about a thing. Gramps is here, and I've brought the best medicine: a good story.",
            "Alright, champ, let's see if we can't get you feeling better. This book always did the trick for me.",
            "Not feeling up to much, huh? How about we dive into a world of fencing, fighting, torture, revenge, giants, monsters, chases, escapes, true love, miracles...",
            "I know you're not feeling 100%, so I brought an old friend to keep us company. Ready for some adventure?",
            "The doctor said rest, and what's more restful than a good story? Especially this one.",
            "You just lie back and relax. I'll take you to Florin, where the beasts are wild and the princesses are beautiful.",
            "Feeling a bit blah? Let's see if the Dread Pirate Roberts can't cheer you up a bit.",
            "This book has magic in it, you know. The magic of a great story. Let's see if it can work some on you.",
            "When I was your age, and I was sick, my father used to read me this book. It always made me feel better.",
            "Okay, let's get your mind off your sniffles. Time for some true love and high adventure!",
            "I know, I know, you'd rather be playing video games. But trust me on this one. This story's got everything.",
            "Just relax, kiddo. Let Gramps take you on a journey. You won't even remember you're sick.",
            "A little bird told me someone wasn't feeling well. So, I brought the cure: Chapter One.",
            "Alright, settle in. This story has everything. Even a battle of wits to the death!",
            "Feeling poorly? Well, this story is just what the doctor ordered. Or, well, what *I* ordered."
        ]).reshuffle();

        this.preRiddleMessages = new AutoShuffleDeck([
            'Alright, kiddo, listen up. The book says: "Vizzini, with a theatrical flourish, then demanded of the Man in Black..." 🎭',
            'Now, pay close attention. Gramps reads: "He then, with a glint of malice in his eye, posed his next intellectual trap..." 😈',
            'Here\'s where Vizzini tries to be extra clever. The story continues: "He leaned in, as if sharing a great secret, and whispered, though his voice carried across the chasm..." 🤫',
            'Alright, now, the book describes: "Vizzini, certain of his own brilliance, laid out his intellectual challenge, saying..." ✨',
            'And then, Vizzini, thinking he had him, said: "Now, for the first test of your supposed intellect..." 🧐',
            '*Ahem*, *hrok*, *ahem*, *snooort*. "With a condescending smile, Vizzini began his next verbal assault..." 😒',
            'The text reads: "He looked the Man in Black squarely in the eye, and with an air of supreme confidence, he uttered..." 👑',
            'This is a tricky one. The book says: "Vizzini, ever the master of psychological warfare, then presented his next conundrum..." 🧠',
            'And then, Gramps reads, "He paused for dramatic effect, letting the tension build, before finally delivering his next challenge..." ⏳',
            'Alright, kiddo, listen up. The book says: "And then, Vizzini posed his riddle to the masked man, saying..."',
            'Now, pay close attention. Gramps reads: "Vizzini, with a smug grin, began his intellectual assault..."',
            'Here\'s the part where Vizzini gets clever. The story goes: "He then turned to the Man in Black, a glint in his eye, and uttered..."',
            'This is where the real test begins. From the book: "Vizzini, confident in his superior intellect, challenged..."',
            'My favorite part! It says: "With a flourish, Vizzini presented his first conundrum..."',
            'You won\'t believe what Vizzini says next. The text reads: "He fixed his gaze on the pirate and declared..."',
            'The tension was thick. The book describes: "Vizzini, relishing the moment, posed his question..."',
            'Here\'s Vizzini\'s opening move. It\'s written: "He leaned forward, a wicked smile playing on his lips, and began..."',
            'This is where he tries to trick him. The story tells: "Vizzini, with feigned politeness, inquired..."',
            'Remember this line. It goes: "And so, the Sicilian, with a theatrical gesture, began his interrogation..."',
            'Now, Vizzini\'s turn to speak. The book states: "He cleared his throat, enjoying the silence, and then..."',
            'He\'s really laying it on thick here. It says: "Vizzini, brimming with self-importance, announced..."',
            'This is the setup for the big one. The text reveals: "He gestured grandly, inviting a response, and then..."',
            'I always liked this bit. It reads: "Vizzini, eager to demonstrate his genius, began..."',
            'The moment of truth. The book says: "He looked the Man in Black squarely in the eye and demanded..."',
            'Vizzini\'s not holding back. It\'s written: "With a condescending smirk, he posed his challenge..."',
            'Here\'s the first trap. The story describes: "He spoke slowly, deliberately, each word a snare..."',
            'I always wondered how he came up with these. It goes: "Vizzini, certain of his victory, began his verbal assault..."',
            'He\'s trying to intimidate him. The book tells: "He puffed out his chest, and with a booming voice, he asked..."',
            'And so, the battle of wits truly began. The text reads: "Vizzini, with a twinkle in his eye, delivered his first test..."'
        ]).reshuffle();
    }

    async sayGobletRoundMessage(replaces={}) {
        await this.say(this.gobletRoundMessages.draw(), replaces);
    }

    async sayPreRiddleMessage(replaces={}) {
        await this.say(this.preRiddleMessages.draw(), replaces);
    }

    async sayOpeningMessage(replaces={}) {
        await this.say(this.openingMessages.draw(), replaces);
    }

};

export class SickBoy extends Character {
    constructor(chat) {
        const startMessages = [
            "A book? Ugh, does it have any sports in it? ⚾", "Is this gonna be a kissing book?",
            "Can't we just watch TV? 📺", "This sounds boring.", "How long is this gonna take?",
            "Are there any action scenes? Or just talking?", "I'm not feeling so good, Grandpa.",
            "Fine, but if it's dumb, I'm going to sleep.", "Who's this Vizzini guy?",
            "A battle of wits? What's that?", "Why can't they just fight with swords?",
            "This better be good.", "Okay, I'm listening. For now.", "Poison? Cool.",
            "So who's the bad guy?", "Is the pirate the good guy?", "This is confusing already.",
            "Just get to the good parts.", "I'm bored already.", "Wake me up when something happens.",
            "Seriously, a book? It's not even in color.", "I'm pretty sure I'm too old for fairy tales.",
            "If there's a princess, she's probably annoying.", "This guy in black sounds cool, at least.",
            "Why is he a 'dread' pirate? What's so scary about him?", "So there are three bad guys?",
            "This story better have a giant in it.", "Okay, fine. Read. But make it quick.",
            "My throat hurts.", "I think my fever's coming back."
        ,
            "Are you sure this isn't a history lesson? 'Cause I hate history.",
            "If I fall asleep, don't get mad.",
            "Is there a remote? Can I change the channel on this story?",
            "Just tell me when the fighting starts.",
            "My head feels fuzzy. Is this story gonna make it worse?",
            "A book? Can't you just tell me the story?",
            "Does it have any explosions?",
            "Okay, but if I get bored, I'm playing on my phone.",
            "Is this one of those stories with a moral? 'Cause I don't want a moral.",
            "How many pages is this chapter? It looks long."
        ];
        const generalMessages = [
            "Wait, what did he say? He talks too fast.", "This is taking forever! Get to the action! 💥",
            "Why doesn't the pirate just stab him?", "This is so boring!",
            "So he's just guessing? That's his plan?", "I don't get it. What's happening?",
            "This Vizzini guy is really annoying.", "Is this almost over?",
            "Why does the princess just stand there? Can't she do something?", "A riddle? Oh, man...",
            "This is just a bunch of talking. Where's the fighting?", "I'm confused. Who has the poison?",
            "This story is dumb. Can we stop?", "My head hurts.",
            "I thought you said this was a good story.", "So much talking!",
            "Just pick one already!", "This is the most boring duel ever.",
            "I think I'm gonna be sick. 🤢", "Can you just skip to the end?",
            "I don't understand the riddle. It's stupid.", "Vizzini is a cheater. I can tell.",
            "This is so slow. Can you fast-forward?",
            "Why is he explaining everything? Just do it!",
            "I'm so lost. Who's talking now?",
            "This is more confusing than my math homework.",
            "Can we take a break? I need a drink.",
            "Is he ever going to make a choice?",
            "This is giving me a headache.",
            "The princess is useless. Why doesn't she just run away?",
            "This riddle is impossible. It's not fair.",
            "I bet the pirate is cheating.",
            "The princess isn't very smart, is she?", "Why is he letting him talk so much?",
            "This is the worst rescue I've ever seen.", "Can I have some soup?",
            "He's just trying to trick him. It's obvious.", "This is not better than video games. Not even close.",
            "Are all old stories this slow?", "My attention span is dying."
        ];
        const dprWinMessages = [
            "He beat him just by talking? That's it?", "Oh, cool! So the pirate won! ⚔️",
            "That was actually pretty smart.", "So Vizzini was the dumb one all along?",
            "Wait, how did he know? Did you tell me?", "Okay, that part was good.",
            "He drank the poison and didn't die? How?", "So now what happens? Do they fight the prince?",
            "That was a neat trick.", "I guess it wasn't that boring.", "So he gets the princess back?",
            "Haha! Vizzini fell over!", "That was awesome!", "Read the next part!",
            "Okay, I'm awake now.", "I knew he'd win.", "That was a good ending.",
            "So clever!", "Best part of the story so far!", "More! More!",
            "I didn't think he had it in him.", "That was a total power move.",
            "Okay, that was better than a sword fight.", "The annoying guy lost! Yes!",
            "He's a genius!", "So the man in black is the hero!",
            "I feel better now.", "That was cool.",
            "Whoa! He totally tricked him!",
            "That was the best part! Do it again!",
            "See? I told you Vizzini was a jerk.",
            "So the poison was in both cups? That's genius!",
            "Okay, okay, I'm not bored anymore. What's next?",
            "He didn't even have to fight him! He just used his brain!",
            "That was a total boss move.",
            "So the hero is smart AND good with a sword? Cool.",
            "Vizzini got owned! Haha!",
            "What happens next? Does he fight the six-fingered man?", "Read it again!"
        ];
        const dprLossMessages = [
            "He's dead? That's it? What a dumb story. 😠", "See? I knew this was a boring story.",
            "You said he was the hero! Heroes don't die!", "That's a stupid ending. I hate it.",
            "So the bad guy wins? That's not fair!", "I'm never listening to one of your stories again.",
            "What happens to the princess now?", "That's the worst story I've ever heard.",
            "I can't believe he lost.", "Well, that was a waste of time.",
            "You tricked me! You said this was a good story!", "I'm going to sleep. This is terrible.",
            "Lame. Totally lame.", "I knew it.", "So what was the point?",
            "I'm telling Mom you read me a sad story.", "That's not a good lesson at all.",
            "So it's over? Good.", "I feel worse now than when we started.", "Ugh.",
            "I hate this book.", "That's the dumbest thing I've ever heard.",
            "He just... dies? That's so anticlimactic.", "I want a different story.",
            "Don't read to me anymore.", "That's just sad.",
            "I'm not crying, you're crying.", "This is worse than having the flu.",
            "What? He lost? But he's the hero!",
            "This book is broken. That's not how it's supposed to end.",
            "I'm mad now. That was a ripoff.",
            "So the annoying guy wins? I hate this.",
            "Don't read anymore. I don't want to know what happens.",
            "That's the stupidest ending ever.",
            "This story is bad for my health.",
            "Why would you read me a story where the good guy loses?",
            "This is worse than when my team loses.",
            "I'm never trusting a book again.",
            "So the jerk wins? Great.", "I'm officially bored."
        ];

        super("Sick Boy", "\u{1F912}", startMessages, generalMessages, dprWinMessages, dprLossMessages);

        this.greetings = new AutoShuffleDeck([
            "Hi gramps *cough* *cough* *cough* *cough*",
            "Hi gramps... *sniffle*",
            "Hey Grandpa. You gonna read to me?",
            "Ugh, I feel awful. Is that the book?",
            "Grandpa! You texted!",
            "*cough* Hi...",
            "Is it story time?",
            "Gramps, My head hurts... but a story sounds good.",
            "You brought the book! Yay!",
            "Hi Gramps. Did you bring chicken soup too? Just kidding... mostly.",
            "Hey Gramps. I was just about to fall asleep, but I'll stay up for a story.",
            "Gramps! Oh, good. I was hoping you'd read to me.",
            "Gramps, can you read me the one with the pirates?",
            "Hey Gramps. My head feels like a balloon.",
            "Is that the princess book? Okay, I guess.",
            "*cough* Hi. Can you get me some water first?",
            "I was having a weird dream. A story sounds better.",
            "You came! I was so bored.",
            "Hi Grandpa. My throat is scratchy, so can you do all the talking?",
            "I don't feel good. But maybe a story will help.",
            "Are you gonna do the voices? You have to do the voices.",
            "Hey. Did you bring snacks?",
            "I'm ready. But no kissing parts today, okay?"
        ]).reshuffle();

    }

    async sayGreeting(replaces={}) {
        await this.say(this.greetings.draw(), replaces);
    }

}