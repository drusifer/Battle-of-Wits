import { AutoShuffleDeck } from './autoShuffleDeck.js';
import { ChatSession } from './chat.js'

/**
 * The base class for all characters in the game.
 */
export class Character {
    /**
     * @param {string} name The character's name.
     * @param {string} emoji A single emoji to represent the character's profile image.
     * @param {object} messageDecks An object containing arrays of messages.
     */
    constructor(chat, name, emoji, startMessages, generalMessages, dprWinMessages, dprLossMessages) {
        this.chatSession = new ChatSession(this, chat);
        this.name = name;
        this.emoji = emoji;
        this.slug = name.toLowerCase().replace(/\s/g, '-');
        this.messages = new AutoShuffleDeck(generalMessages).reshuffle();
        this.startMessages = new AutoShuffleDeck(startMessages).reshuffle();
        this.dprWinMessages = new AutoShuffleDeck(dprWinMessages).reshuffle();
        this.dprLossMessages = new AutoShuffleDeck(dprLossMessages).reshuffle();
    }

    login() {
        this.chatSession.login();
    }

    /* everyone in characters says something. */
    async dialogueWith(characters) {
        await this.saySomething();
        const responseFrom = characters.pop();
        if (responseFrom) {
            await responseFrom.dialogueWith(characters);
        }
    }

    logout() {
        this.chatSession.logout();
    }

    async say(message) {
        await this.chatSession.say(message);
    }

    /** Draws a random message from the character's general message deck. */
    async saySomething() {
        await  this.chatSession.say(this.messages.draw());
    }
    
    /** Draws a random message from the character's starting message deck. */
    async sayStartMessage() {
        await this.chatSession.say(this.startMessages.draw());
    }

    /** Draws a random message from the character's ending message deck. */
    async sayEndMessage(dprWin = false) {
        if (dprWin) {
            await this.chatSession.say(this.dprWinMessages.draw());
        } else {
            await this.chatSession.say(this.dprLossMessages.draw());
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
        super(chat, "Dread Pirate Roberts", "🏴‍☠️", startMessages, generalMessages, dprWinMessages, dprLossMessages);
        this.drankPoisonMessages = new AutoShuffleDeck([
            "It's a good thing I've built up a resistance to iocane powder. Let's go again, shall we?",
            "Merely a flesh wound. I've spent years building up an immunity to iocane powder. Your methods are... predictable. I've got time for one more, if you dare.",
            "Interesting. A lesser man would be dead by now, or at least mostly dead. Good thing I'm not a lesser man. Next round, Vizzini?",
            "Ah, iocane. I know it well. It seems my tolerance is still holding up. You'll have to try harder than that.",
            "A familiar tingling. But iocane and I have an understanding. It tickles, mostly. Shall we continue this delightful game?",
            "You'd think I'd learn, but then, where's the fun in that? Still standing, Vizzini. Your move.",
            "Tastes like... victory deferred. My constitution is, shall we say, robust. Another round to prove your genius?",
            "My dear Vizzini, you'll have to do better than that. I've had stronger drinks at children's parties.",
            "Was that supposed to be your trump card? I must say, I'm rather underwhelmed. Perhaps another attempt?",
            "The iocane only sharpens my senses. A curious side effect, wouldn't you agree? Let's proceed.",
            "You seem surprised. Did you truly believe it would be that easy to dispose of the Dread Pirate Roberts? Draw your cups!",
            "A valiant effort, Vizzini. But as you can see, I am not so easily dispatched. Shall we try that again?"
        ]).reshuffle();
    }

    async sayDrankPoisonMessage() {
        await this.say(this.drankPoisonMessages.draw());
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
            "I have no time for this dallying!", "Just make a choice so I can watch you die!", "This is tedious. Utterly tedious."
        ];

        const dprWinMessages = [
            "Impossible! You must have cheated! There's no other explanation! 😡", "My flawless logic... defeated by a common brute... *gasp*...",
            "You switched the goblets when I wasn't looking! You must have!", "This can't be... I am Vizzini! The greatest mind... *thud*",
            "The poison... was in my goblet...? But... how...?", "You... guessed? No! It cannot be!",
            "I... I feel... unwell...", "A fluke! A statistical anomaly!", "My plan... was perfect...",
            "I outsmarted myself...? No...", "This is not the logical outcome!", "I... am... slain...",
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
            "The world is now free of one more simpleton.", "Now, where were we? Ah yes, global domination.",
            "And the crowd goes wild! For me, of course.", "Checkmate.", "Game, set, and match. To me.", "I am victorious! As always."
        ];

        super(chat, "Vizzini", "🧐", startMessages, generalMessages, dprWinMessages, dprLossMessages);

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
            "Let the true test begin! No more wordplay, just pure, unadulterated chance... guided by my superior intellect, of course. 😉 Your move, simpleton."
        
        ]).reshuffle()

        this.preRiddleMessages = new AutoShuffleDeck([
            "Now, for a true test of your... ah... 'intellect'.",
            "Let us see if that pirate brain of yours can handle a simple conundrum.",
            "Prepare yourself, for I am about to engage your mind in a way it has never been engaged before!",
            "A riddle, then! To occupy your thoughts while I contemplate your inevitable doom.",
            "Perhaps this will amuse the princess while you flounder.",
            "I've devised a little something to expose the depths of your ignorance.",
            "Consider this a warm-up for your brain... though I doubt it will help.",
            "Let's see if there's anything rattling around in that thick skull of yours.",
            "A simple question, for a simple man. Or is it?",
            "Now, pay attention. This may be beyond your meager comprehension, but try.",
            "I almost feel guilty posing such a challenge to one so clearly outmatched. Almost."
        ]).reshuffle();
    }

    async sayGobletRoundMessage() {
        await this.say(this.gobletRoundMessages.draw());
    }

    async sayPreRiddleMessage() {
        await this.say(this.preRiddleMessages.draw());
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
            "He talks and talks, but you think. That is your advantage.",
            "That's a non sequitur, Vizzini. Your premise doesn't support your conclusion.", "Pay attention to his rhetoric, Wesley. He uses ad hominem attacks to distract from his weak arguments.",
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
        super(chat, "Buttercup", "👑", startMessages, generalMessages, dprWinMessages, dprLossMessages);
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
            "This scene is all about psychology.", "It's not about the poison, it's about the people.",
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

        super(chat, "Gramps", "👴", startMessages, generalMessages, dprWinMessages, dprLossMessages);

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

    }

    async sayOpeningMessage() {
        await this.say(this.openingMessages.draw());
    }

    async sayGobletRoundMessage() {
        await this.say(this.gobletRoundMessages.draw());
    }
}

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
            "So the jerk wins? Great.", "I'm officially bored."
        ];

        super(chat, "Sick Boy", "🤒", startMessages, generalMessages, dprWinMessages, dprLossMessages);

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
            "Gramps, can you read me the one with the pirates?"
        ]).reshuffle();

    }

    async sayGreeting() {
        await this.say(this.greetings.draw());
    }

}