import { AutoShuffleDeck } from './autoShuffleDeck.js';

/**
 * The base class for all riddles posed by Vizzini.
 */
export class Riddle {
    /**
     * @param {string} question The riddle question, written in Vizzini's style.
     * @param {string[]} answers An array of acceptable one-word answers, including synonyms and common misspellings.
     * @param {string[]} hints An array of hints for the riddle, written in Buttercup's voice.
     */
    constructor(question, answers, hints) {
        this.question = question;
        this.answers = answers.map(a => a.toLowerCase());
        this.hints = hints;
    }

    /**
     * Checks if a given answer is correct.
     * This method normalizes the player's attempt by making it lowercase,
     * removing common articles (a, an, the), and stripping all whitespace
     * to allow for flexible matching.
     * @param {string} attempt The player's attempted answer.
     * @returns {boolean} True if the answer is in the answers list, false otherwise.
     */
    checkAnswer(attempt) {
        const normalizedAttempt = attempt
            .toLowerCase()
            .replace(/\b(a|an|the)\b/g, '')
            .replace(/\s+/g, '');

        return this.answers.includes(normalizedAttempt);
    }
}

// --- Difficulty Base Classes ---
class EasyRiddle extends Riddle { }
class MediumRiddle extends Riddle { }
class HardRiddle extends Riddle { }

export const RIDDLE_DECK = new AutoShuffleDeck([

    // --- Specific Easy Riddle Classes ---

    new class MapRiddle extends EasyRiddle {
        constructor() { 
            super("Surely even a brute like you can solve this! I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I? ️", 
            ["map", "maps", "atlas", "chart"], 
            ["Oh, Wesley, think about the charts you must have used on your ship.", 
                "He's speaking of a representation of the world, not the world itself.", 
                "It can be folded and carried with you on a great adventure."]); 
            }
    }(),
    new class NeedleRiddle extends EasyRiddle {
        constructor() { 
            super(
                "A simpleton's query! What has an eye, but cannot see? 👁️", 
                ["needle", "nedle", "nedel"], 
                ["It's something my mother used for sewing, to mend clothes.", 
                    "Think of something small and sharp, with a single hole for thread to pass through.", 
                    "Even the finest dress might need one of these after a tussle."]
            );
         }
    }(),
    new class EggRiddle extends EasyRiddle {
        constructor() { super("Even a child could answer this! What must be broken before you can use it? ", ["egg", "eggs"], ["Think of what a chicken lays, what you might have for breakfast.", "Its shell must be cracked to get the yolk inside.", "It's a symbol of new life, but you must destroy its home to find it."]); }
    }(),
    new class ShadowRiddle extends EasyRiddle {
        constructor() { super("A triviality! I follow you all day, perfectly mimicking your every move, yet I vanish when the sun does. What am I?", ["shadow", "shado"], ["Oh, Wesley, it's something that is always with you on a sunny day. ☀️", "It cannot be held, and it has no color but darkness.", "Look to the ground at your feet when you stand in the light."]); }
    }(),
    new class FireRiddle extends EasyRiddle {
        constructor() { super("A simple puzzle for a simple mind. Feed me and I live, yet give me a drink and I die. What am I? ", ["fire", "flame"], ["Think of the hearth in a cozy room, what dances in the fireplace?", "It consumes wood to grow stronger, but water is its enemy. 💧", "It gives both warmth and light, but can be dangerous if untamed."]); }
    }(),
    new class BedRiddle extends EasyRiddle {
        constructor() { super("An obvious answer for an obvious fool! I have legs, but I cannot walk. You rest on me, but I never sleep. What am I? ", ["bed", "beds"], ["It is a piece of furniture you would find in any bedroom.", "You seek it out at the end of a long day, my love.", "It has a headboard, but no head."]); }
    }(),
    new class TowelRiddle extends EasyRiddle {
        constructor() { super("Inconceivably easy! What gets wetter as it dries?", ["towel", "towl"], ["It's something you use after a bath. 🛀", "You pat your skin with it, and it soaks up the water.", "It is made of cloth and is very absorbent."]); }
    }(),
    new class CombRiddle extends EasyRiddle {
        constructor() { super("A riddle so basic, it's an insult to my intellect! I have teeth, but cannot eat. What am I? ", ["comb", "come"], ["It's something you might use on your hair, Wesley.", "Its purpose is to untangle knots.", "It is long and thin, with many little spikes in a row."]); }
    }(),
    new class CandleRiddle extends EasyRiddle {
        constructor() { super("Your intellect is surely flickering out, but perhaps you can solve this. I am tall when I am young and short when I am old. What am I? ️", ["candle", "kandle"], ["Think of a source of light before electricity.", "It weeps wax as it burns away.", "Its life is measured in hours of light."]); }
    }(),
    new class GloveRiddle extends EasyRiddle {
        constructor() { super("Honestly, a child could guess this. I have a thumb and four fingers, but I am not alive. What am I? ", ["glove", "gluv"], ["It is something a gentleman might wear on his hands.", "You put it on to keep warm or to protect your fingers.", "It has a space for each finger, but no flesh or bone."]); }
    }(),
    new class StairsRiddle extends EasyRiddle {
        constructor() { super("What goes up and down but does not move? Answer this, if your brain is not entirely stationary! 🧠", ["stairs", "staircase", "steps"], ["Think of how you get from one floor of a castle to another.", "Each one is a single step in a longer journey.", "They are made of wood or stone, and they stay in one place."]); }
    }(),
    new class RiverRiddle extends EasyRiddle {
        constructor() { super("A simple flow of logic should suffice. I have a bed but never sleep, and a mouth but never speak. What am I? ️", ["river", "rivver"], ["It flows across the land to the sea, my love.", "Its 'mouth' is where it meets a larger body of water.", "Boats travel upon its surface."]); }
    }(),

    // --- Specific Medium Riddle Classes ---

    new class EchoRiddle extends MediumRiddle {
        constructor() { super("Now for a true test! I speak, but have no mouth. I hear words, but have no ears. What am I? ️", ["echo", "echoe"], ["Wesley, think of when you shout in a cave or a great hall, what comes back to you?", "It is a sound that repeats itself, a reflection of a voice.", "It has no voice of its own, it only borrows yours."]); }
    }(),
    new class FutureRiddle extends MediumRiddle {
        constructor() { super("Observe the subtlety of my mind! What is always in front of you but can’t be seen? 🤔", ["future", "futur"], ["Oh, my love, it's something we always hope for, a time that has not yet come.", "It is tomorrow, and the day after, and all the days to come.", "You can plan for it, you can dream of it, but you cannot hold it."]); }
    }(),
    new class BottleRiddle extends MediumRiddle {
        constructor() { super("A question of such dazzling logic! What has a neck without a head, and a body without legs? ", ["bottle", "botle", "botel"], ["Think of something you might drink wine from... other than a goblet.", "It holds liquid, and you might put a cork in its 'mouth'.", "It has shoulders and a neck, but it is made of glass."]); }
    }(),
    new class AgeRiddle extends MediumRiddle {
        constructor() { super("My brilliance is unquestionable! What goes up but never comes down? ", ["age", "ages"], ["It is a number that only grows, my dearest Wesley.", "With every birthday, you have more of it.", "It's something we all gain over time, a measure of our lives."]); }
    }(),
    new class SecretRiddle extends MediumRiddle {
        constructor() { super("A true test of a pirate's character! If you have me, you want to share me. If you share me, you haven't got me. What am I? 🤫", ["secret", "sekret"], ["It is a piece of information that is meant to be kept hidden.", "To whisper it to another is to break the trust placed in you.", "Once spoken, it can never be truly taken back."]); }
    }(),
    new class AnchorRiddle extends MediumRiddle {
        constructor() { super("For a seafaring man, this should be trivial! What do you throw out when you want to use it, but take in when you're done with it? ", ["anchor", "anker"], ["It is heavy and made of iron, used to keep your ship from drifting.", "It is let down on a great chain.", "It grips the seabed to hold a vessel in place."]); }
    }(),
    new class NameRiddle extends MediumRiddle {
        constructor() { super("I belong to you, but other people use me more than you do. What am I? A simple question of possession! 😉", ["name", "naym"], ["It is how people refer to you, my love.", "Vizzini calls you 'Dread Pirate Roberts', but I call you Wesley.", "You hear it spoken by others more often than you speak it yourself."]); }
    }(),
    new class SilenceRiddle extends MediumRiddle {
        constructor() { super("My very name is shattered by the act of speaking it. What am I? A paradox worthy of my intellect! ", ["silence", "silens"], ["It's what is left when all the noise fades away.", "He's speaking of the absence of sound, my love.", "To say its name is to break it."]); }
    }(),
    new class MirrorRiddle extends MediumRiddle {
        constructor() { super("I have no reflection, but I show all others. I have no eyes, yet I look back at yours. What am I? ", ["mirror", "miror"], ["Think of what you look into to see your own face.", "It shows you what you look like, but backwards.", "If it breaks, they say you will have bad luck."]); }
    }(),
    new class MemoryRiddle extends MediumRiddle {
        constructor() { super("I can be created in the present, but the present can never hold me. I am a ghost of the past, carried into the future. What am I? ", ["memory", "memoree"], ["It is a recollection of something that has already happened.", "Our time apart is now one of these, my love. ❤️", "You can cherish it or be haunted by it, but you cannot change it."]); }
    }(),
    new class HoleRiddle extends MediumRiddle {
        constructor() { super("A simple query of physics and logic. What gets bigger the more you take away from it? 🕳️", ["hole", "hol"], ["Think of digging in the dirt, what are you creating?", "It is defined by what is not there.", "The more earth you remove, the larger it becomes."]); }
    }(),
    new class PromiseRiddle extends MediumRiddle {
        constructor() { super("A matter of honor, which a rogue like you knows nothing of! What is something you can keep after giving it to someone else? ", ["promise", "promis"], ["It is a vow, a sacred commitment.", "You give your word to someone, and you must not break it.", "I knew you would come for me, it was an unspoken one between us."]); }
    }(),
    new class YesterdayRiddle extends MediumRiddle {
        constructor() { super("A simple temporal puzzle! What is always coming, but never arrives? ", ["tomorrow", "tommorrow", "tomoro"], ["It is the day after today.", "We always speak of it, but when it comes, it is simply 'today'.", "It is where all our hopes for the future lie."]); }
    }(),
    new class SpongeRiddle extends MediumRiddle {
        constructor() { super("A porous problem for a porous mind! I am full of holes, but I can still hold water. What am I? ", ["sponge", "spunge"], ["Think of a tool used for cleaning.", "It is soft and can soak up a great deal of liquid.", "It comes from the sea, but can also be made by man."]); }
    }(),

    // --- Specific Hard Riddle Classes ---

    new class EternityRiddle extends HardRiddle {
        constructor() { super("Prepare your meager intellect! I am the beginning of eternity, the end of time and space, the beginning of every end, and the end of every place. What am I? 🤯", ["e", "lettere"], ["He's not speaking of a concept, but of a... a character.", "Listen to the words he says, my love. Eternity... time... end... place. What is shared?", "It is something you would use to write my name, or yours."]); }
    }(),
    new class CoffinRiddle extends HardRiddle {
        constructor() { super("Only a mind as formidable as my own can navigate this! The man who makes me does not want me. The man who buys me does not need me. The man who uses me does not know he has me. What am I? ⚰️", ["coffin", "casket"], ["Oh, this is a grim one, Wesley. Think of what is built for one's final rest.", "It is purchased for a loved one who has passed, not for oneself.", "The person for whom it is intended can never appreciate its craftsmanship."]); }
    }(),
    new class ImaginationRiddle extends HardRiddle {
        constructor() { super("Now you face true intellectual oblivion! I have no voice, but I tell all stories. I have no hands, but I build great cities. I have no feet, but I travel the whole world. What am I? ", ["imagination", "imajination", "imagine"], ["It is the power of your mind, my love. The source of dreams and grand ideas. ✨", "With it, you can be anywhere, do anything, without ever taking a step.", "It is a gift that no one can take from you."]); }
    }(),
    new class FootstepsRiddle extends HardRiddle {
        constructor() { super("An impossible paradox for your pirate brain! The more you take, the more you leave behind. What are they? ", ["footsteps", "steps", "footprints"], ["Think of the marks you leave when you walk upon the sand.", "Every journey is measured by them, but they always remain behind you.", "He speaks of taking a walk, Wesley. What does your journey create?"]); }
    }(),
    new class NothingRiddle extends HardRiddle {
        constructor() { super("A philosophical quandary! Poor people have it. Rich people need it. If you eat it you die. What is it? 🤔", ["nothing", "nothingness"], ["He's being tricky with his words, my love. Think about what the poor possess in abundance.", "What could a rich man, who has everything, possibly need?", "The answer is an absence, a void."]); }
    }(),
    new class BreathRiddle extends HardRiddle {
        constructor() { super("A riddle of exquisite simplicity, which will surely escape you! I am lighter than a feather, yet the strongest man cannot hold me for more than a minute. What am I? ", ["breath", "breth"], ["It is something you do constantly, without thinking.", "You can see it on a cold day.", "To hold it for too long is to invite death."]); }
    }(),
    new class HistoryRiddle extends HardRiddle {
        constructor() { super("I am a tapestry woven with the threads of kings and fools, battles and treaties. I am always being added to, but can never be truly complete. What am I? ", ["history", "historee"], ["It is the story of all the yesterdays of the world.", "Scholars study it to understand the present.", "Every choice we make becomes a part of it."]); }
    }(),
    new class MankindRiddle extends HardRiddle {
        constructor() { super("A biological and philosophical puzzle! What walks on four feet in the morning, two in the afternoon and three at night? ", ["man", "mankind", "human"], ["He is speaking of the stages of a single life, from birth to old age.", "The 'feet' are metaphors, my love. A baby crawls, an adult walks, and an old man uses a cane.", "The answer is not a single creature, but a species."]); }
    }(),
    new class DarknessRiddle extends HardRiddle {
        constructor() { super("The more of me you have, the less you can see. I flee from the light but am embraced by the night. What am I? ", ["darkness", "dark"], ["It is the opposite of light, Wesley.", "It fills a room when you put out the candle.", "In it, your other senses may seem stronger."]); }
    }(),
    new class LanguageRiddle extends HardRiddle {
        constructor() { super("I can build bridges or start wars. I can express love or utter curses. I am the tool of poets and the weapon of kings, but every child can master me. What am I? ", ["language", "tounge", "speech"], ["It is the words we are using right now.", "Every country has its own version, but its purpose is the same.", "With it, you can share any thought or feeling."]); }
    }()
]);