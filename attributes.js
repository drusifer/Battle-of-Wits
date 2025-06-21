/// This is code fo the game Battle of Wits a game based on the Book/Movie
//// "The Princess Bride."  In the game You are Wesley aka The Dread Pirate
//// Roberts aka DPR and you have challenged Vizini to a battle of wits
//// to the death!  In this version Vizini will ask three riddles after which
//// DPR will have to identify which of two Goblets contains iocane poison
//// (which as any fool knows is odorless and colorless rendering it indetectable
//// and only comes from Austraila.)  Pay close attention to Vizini's words
//// whetherby arrogance or sloppynes, he's bound to drop clues to the
//// poisoned goblet within his lavish insults.  Don't forget Buttercup is stading by
//// ready to offer a hint or words of encouragement.


/****
 * Rules:
 * - DPR starts with 3 hearts and round 1 begins:
 * -
 * -   Vizini prepares two goblets by drawing 5 attribute per goblet
 * -   Vizini poses his riddle and DPR can do the following:
 * 1: Confidently, respond with a single word answer to the riddle
 * 2: Valliently ask Buttcup for help
 * 3: Stall with banter to try and get a clue from Vizini (could backfire)
 * -   If DPR answers correctly then Vizini will get frustrated and toss 3 insults
 * at DPR.  If the answer is wrong then Vizini will ridicule DPR with 1 insult.
 * -   most other actions will elicit an insult from Vizini
 * * -   After 3 riddles Vizini reveals the goblets displaying a describive
 * paragraph for each goblet.
 * -   DPR chooses either the goblet on the right or the goblet on the left
 * and they drink.
 * -   If Vizini drank the poison then DPR wins
 * -   If DPR drank the the posion he loses 1 heart (iocain resistanse) and
 * you begin another round.
 * -   If DPR runs out of hearts you lose the game.
 * * * Objects:
 * * Deck:
 * Generic class for holding objects and distributing them in a
 * random fashion like a deck of cards.
 * * AutoshuffleDeck:
 * Reshuffles when empty for infinite draws
 * * AttributeCard:
 * Object representing a Goblet attribute. Each attribute card has a
 * fragment deck of different sentances that describe the specific attribute
 * of the goblet in different ways for variation.  There is also an insult
 * deck which provides Vizzini's insults that provide subltle clues to this attriubute.
 * * Attributes are organized into subtypes with exclusive varients (Suite) to avoid
 * creading paradoxacal goblets and to provide templates for the description. For example:
 * * Material:
 * What the goblet is made of. Can be described with sentances like:
 * 'It appears to be crafted from %s',
 * "It looks like it's made from a piece of %s",
 * "It's carved out of %s",
 * "The material looks like %s"
 * * Varients: AncientSilver, Ivory, Jade, Alabaster, White Oak, Cheap Plastic
 * */

import { AutoShuffleDeck } from "./autoShuffleDeck.js";

// --- ATTRIBUTE CLASSES ---


/** The base class for all attributes. The varient is automatically selected by instatating the desired class**/
class Attribute {
    constructor(name, value, fragments, insults, complements) {
        this.name = name;
        this.value = value;
        this.fragments = new AutoShuffleDeck(fragments);
        this.insults = new AutoShuffleDeck(insults);
        this.complements = new AutoShuffleDeck(complements);
    }

    /**
     * Draws a descriptive fragment from the fragments deck.
     */
    draw_fragment() {
        const v = this.value;
        const a = ['a', 'e', 'i', 'o', 'u'].includes(v[0].toLowerCase()) ? 'an' : 'a';
        const f = this.fragments.draw().replace("%s", v)
            .replace("%a", a);
        return f;
    }

    toString() {
        return `${this.name}: ${this.value}`;
    }

    getInsult() {
        this.insults.draw();
    }

    getComplements() {
        this.complements.draw();
    }
}


/*
* A material is an example of kind of attribute
* Use classes like Material, Odor, Shape, etc... to represent a
* physical attribute of the goblet.
* They are useful for sharing common fragments across
* different Varients of the same physical attribute.
* Varients can suply their own specific fragment as well.
*/
class Material extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const f = [
            'It appears to be crafted from %s.',
            "It looks like it's made from a piece of %s.",
            "It's carved out of %s.",
            "The material looks like %s."
        ].concat(frags);
        super('Material', value, f, insults, complements);
    }
};


// --- OTHER ATTRIBUTE TYPE BASE CLASSES ---
class FormOverallShape extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const f = [
            'The goblet has %a %s shape overall.',
            'Its form is predominantly %s.',
            'One notices the %s contour of the goblet.',
            'The overall shape is distinctly %s.',
            'It presents as %a %s form.'
        ].concat(frags);
        super('Overall Shape', value, f, insults, complements);
    }
};

class CurrentCondition extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const f = [
            'Its current condition is %s.',
            'The goblet is in %a %s condition.',
            'It appears remarkably %s.',
            'The state of the goblet is pretty %s.',
            'Evidently, it is %s.'
        ].concat(frags);
        super('Current Condition', value, f, insults, complements);
    }
};

class Odor extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "A faint scent of %s emanates from it.",
            "It carries %a %s odor.",
            "One can detect a distinct aroma of %s.",
            "The goblet smells faintly of %s.",
            "There's an unmistakable hint of %s about it."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Odor', value, allFragments, insults, complements);
    }
};

class Weight extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "It feels surprisingly %s in the hand.",
            "The goblet has %a %s weight to it.",
            "Lifting it, one notes its %s quality.",
            "It seems to be of %a %s construction, judging by its weight.",
            "The perceived weight is %s."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Weight', value, allFragments, insults, complements);
    }
};

class MonetaryValue extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "It looks to be of %s monetary value.",
            "One might estimate its worth as %s.",
            "This appears to be %a %s item.",
            "The goblet has the appearance of %s monetary value.",
            "It seems to be a piece of %s value."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Monetary Value', value, allFragments, insults, complements);
    }
};

class Liquid extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "The goblet appears to contain %s.",
            "A quantity of %s sloshes within.",
            "It is filled with %a %s liquid.",
            "Looking inside, you see %s.",
            "The contents seem to be %s."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Liquid', value, allFragments, insults, complements);
    }
};

class Rim extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "The rim is %s.",
            "Its rim appears %s.",
            "Examining the edge, the rim is clearly %s.",
            "It has %a %s rim.",
            "The goblet's rim is noted to be %s."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Rim', value, allFragments, insults, complements);
    }
};

class EngravingOrMotif extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFrags = [
            'It is adorned with %s.',
            'The surface is completely covered in %s.',
            'One can discern %s as a prominent motif.',
            'There are %s etched into the material.',
            'Decorations of %s are visible.'
        ];
        const allFragments = baseFrags.concat(frags);
        super('Engraving', value, allFragments, insults, complements);
    }
};

class SurfaceTexture extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "The surface feels %s to the touch.",
            "It has %a %s texture.",
            "Running a finger over it reveals %a %s surface.",
            "The texture is noticeably %s.",
            "Its tactile quality is %s."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Surface Texture', value, allFragments, insults, complements);
    }
};


class Base extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "The base of the goblet is %s.",
            "It stands on %a %s base.",
            "The supporting base appears %s.",
            "Its base is fashioned to be %s.",
            "A notable feature is its %s base."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Base', value, allFragments, insults, complements);
    }
};

class Handles extends Attribute {
    constructor(value, insults, complements, frags = []) {
        const baseFragments = [
            "The goblet features %s.",
            "It is equipped with %s.",
            "Regarding handles, it has %s.",
            "One can note %s for gripping.",
            "The design includes %s."
        ];
        const allFragments = baseFragments.concat(frags);
        super('Handles', value, allFragments, insults, complements);
    }
};

export const ATTRIBUTE_DECK = new AutoShuffleDeck([

    // --- MATERIAL VARIANTS ---
    new class AncientSilver extends Material {
        constructor() {
            const insults = [
                "Pah! An answer that lacks luster, Roberts! It speaks of a mind that has not seen the polish of genuine thought in ages!",
                "Your prospects are looking rather... discolored, Roberts. Even this venerable vessel seems to shine brighter by comparison.",
                "Empires have risen and fallen in the time it took you to conjure that folly! Such a statement belongs in a museum of idiocy!",
                "Your intellect carries the heavy weight of stupidity, pirate! A truly ponderous attempt at deduction.",
                "Do you value such a worthless answer so highly? It proves your judgment is as poor as a commoner's trying to appraise a king's treasure."
            ];
            const complements = [
                "A surprisingly sharp answer, Roberts! Almost as if it has been polished over many long years, revealing a glint of true value beneath the surface.",
                "Ah, you've seen through the dull exterior to the truth! A mind as keen as yours can discern worth even when it's clouded by the passage of time. Most impressive.",
                "An answer of surprising weight, pirate! It seems your intellect, much like a fine antique, has accumulated substance over your many travels.",
                "Well, well, you've unearthed a treasure of a response! It seems not all that is old and darkened has lost its inherent brilliance. A rare quality, indeed.",
                "I'm impressed, Roberts. Your logic possesses a certain venerable quality, much like an heirloom passed down through generations. It has the ring of truth to it."
            ];
            const frags = [
                "The silver is so ancient it looks almost black with tarnish.",
                "A heavy goblet, clearly made of silver ages old."
            ];
            super('Ancient Silver', insults, complements, frags);
        }
    }(),

    new class PolishedPewter extends Material {
        constructor() {
            const insults = [
                "Honestly, Roberts, your answer is so dull, it makes this humble cup seem positively radiant by comparison! Did you even *try* to engage that pirate brain of yours?",
                "Such a malleable mind, Dread Pirate! It bends under the slightest pressure of a true intellect. You're softer than you look, aren't you?",
                "Pah! Your logic is as soft as this common metal. I expected a keener mind from the Dread Pirate Roberts, not one so easily dented by a simple riddle!",
                "If your wit were a drinking vessel, Roberts, it would be this one – unassuming, easily overlooked, and ultimately, quite cheap!",
                "That answer is the color of mediocrity, pirate! A bland, grey smear on the canvas of our intellectual masterpiece!"
            ];
            const complements = [
                "An answer with a quiet brilliance, Roberts! Much like a well-kept secret, its humble appearance belies a certain respectable strength.",
                "I see... you favor a straightforward, unpretentious solution. It has the sturdy, reliable character of a dependable, if common, ally.",
                "You've polished that thought quite nicely, pirate! It shines with a soft, unassuming luster, proving that not all correct answers need to be dazzling.",
                "A surprisingly solid choice of words, Roberts. It has a certain weight to it, a reassuring quality one finds in things that are built to last, not just to impress.",
                "How resourceful! You've forged an answer that is both practical and effective, proving one doesn't need extravagant materials to construct a sound argument."
            ];
            const frags = [
                "The goblet shines with the soft, grey lustre of well-polished pewter.",
                "It has the sturdy, unassuming character of pewter."
            ];
            super('Polished Pewter', insults, complements, frags);
        }
    }(),

    new class FlawlessCrystal extends Material {
        constructor() {
            const insults = [
                "Your attempt at reasoning, Roberts, is utterly transparent! And unlike a fine piece such as this, it is riddled with obvious, glaring flaws!",
                "Did you think I wouldn't see right through that pathetic excuse for an answer? It's as empty and fragile as your chances of winning!",
                "Roberts, Roberts, Roberts! Your brain is clear, I'll give you that – clear as glass, and just as empty! A child could see through your pathetic guess!",
                "My dear Dread Pirate, your supposed brilliance is nowhere to be seen. If your mind were a vessel, it would shatter at the first sip of true complexity!",
                "That answer rings with the hollow note of idiocy! I fear a sharp retort from me would break your spirit entirely!"
            ];
            const complements = [
                "A stunningly clear and precise answer, Roberts! It refracts the light of truth in a most dazzling display. I am, against my better judgment, impressed.",
                "I see right through you, pirate... and for once, I see a glimmer of pure, unadulterated intellect. A truly perfect deduction!",
                "Your reasoning is as sharp and multifaceted as a well-cut gem. You've managed to illuminate the very heart of the matter. Remarkable.",
                "An answer of such perfect clarity it sings with truth. Be careful, Roberts, such fragile brilliance can be easily broken by arrogance.",
                "I must admit, your logic is pristine. You've presented an argument so pure and unblemished by error that even I cannot find a fault in it. Well done."
            ];
            const frags = [
                "Light refracts beautifully through its flawless crystal construction.",
                "The goblet is remarkably clear, crafted from what appears to be perfect crystal."
            ];
            super('Flawless Crystal', insults, complements, frags);
        }
    }(),

    new class RoughHewnWood extends Material {
        constructor() {
            const insults = [
                "Such a coarse and unrefined answer, Roberts! One might think you whittled it yourself from a particularly dense block of… misunderstanding!",
                "A wooden-headed response! I dare say this simple goblet has more intricate grain than your thought process, pirate!",
                "Splinters and sawdust, that's what your answer is made of, Roberts! You couldn't see the forest for the trees in that riddle, could you, you lumbering fool?",
                "Your intellect, pirate, is as unpolished as a freshly felled tree. Perhaps a bit of seasoning would do you good, though I doubt it would improve that answer.",
                "An answer that belongs in a campfire! It's crude, primitive, and will soon be turned to ash by the heat of my intellect!"
            ];
            const complements = [
                "A surprisingly rustic and effective answer, Roberts. It may lack polish, but it has the undeniable strength of solid, natural truth.",
                "You've carved out a niche for yourself with that response! A bit rough around the edges, perhaps, but its fundamental structure is sound.",
                "An answer with a certain organic, unvarnished honesty. It's refreshing, in a simple, almost pastoral sort of way. I didn't think you had it in you.",
                "Against all odds, your logic holds firm. It has a certain grainy complexity that is, I must admit, more clever than it first appears.",
                "From such a coarse and unrefined source, a surprisingly sound point emerges. You truly are a man of the earth, aren't you, Roberts?"
            ];
            const frags = [
                "The goblet feels coarse to the touch, evidently shaped from rough-hewn wood.",
                "Its rustic charm comes from the visible grain and imperfections of the wood."
            ];
            super('Rough-Hewn Wood', insults, complements, frags);
        }
    }(),

    new class BoneChina extends Material {
        constructor() {
            const insults = [
                "Oh, the esteemed Dread Pirate Roberts, so easily rattled! That answer was so delicate, so… breakable! It's a wonder it didn't shatter before it left your lips!",
                "Your argument is as thin and insubstantial as the most fragile teacup, pirate. One sharp tap of logic, and poof! It’s in a thousand useless pieces!",
                "Oh, the great Dread Pirate Roberts, so easily rattled! I bet your own skeleton feels as brittle as this cup after such a blunder!",
                "A response of such startling translucency, Roberts! One can almost see the utter lack of profound thought right through it. Predictably, and utterly, wrong!",
                "That was a high-pitched squeal of an answer, pirate! It speaks of a refinement your brutish nature could never truly possess!"
            ];
            const complements = [
                "An answer of surprising delicacy and refinement, Roberts. It's so finely crafted, one fears a single breath could break its perfect logic.",
                "You handle the truth with such a light touch! It's almost... elegant. A response as smooth and pure as one could hope for.",
                "I'm surprised. Your reasoning is not as coarse as I'd imagined. It has a certain... fragile beauty, like something one might find at a queen's tea party.",
                "Such a lightweight answer, yet it bears the full weight of correctness. There's a certain translucent honesty to your words, pirate.",
                "Remarkable. A strong answer, yet it feels as if it's made of nothing but air and intellect. It has the quality of a true, if unexpected, piece of art."
            ];
            const frags = [
                "The goblet is surprisingly light, with the delicate feel of bone china.",
                "Its surface is smooth and almost translucent, characteristic of fine china."
            ];
            super('Bone China', insults, complements, frags);
        }
    }(),

    new class PolishedJade extends Material {
        constructor() {
            const insults = [
                "Was that answer supposed to be a 'gem,' Roberts? Because it lacks all the hardness and enduring quality of a truly precious thought. Merely a bauble!",
                "Smooth and cool, you are not, pirate! That answer was clumsy and heated, unlike the serene surface of this fine stone.",
                "Your wisdom, pirate, is clearly not as deep or ancient as some of the world's most revered treasures. A shallow guess for a shallow mind!",
                "Envy at my intellect is making you green, Roberts! It's the only color I associate with you, certainly not the wisdom suggested by this venerable material.",
                "Such a semiprecious attempt at a solution! It has the illusion of value, but a true connoisseur of wit can spot a fake immediately."
            ];
            const complements = [
                "An answer as smooth and coolly delivered as a perfectly finished gem, Roberts. You possess a serenity in your logic that is... unsettling.",
                "A valuable insight, pirate. Your words have the weight and depth of a stone prized by emperors. I did not think you capable of such profundity.",
                "Your mind is a rarer treasure than I anticipated. That answer was a thing of beauty, with a hard, unyielding core of truth.",
                "I see a flicker of ancient wisdom in your eyes. A lucky guess, perhaps, or have you more substance than your brutish exterior suggests?",
                "You've uncovered a truth that is both precious and resilient. A truly clever man would know the worth of such a discovery. You are... cleverer than you look."
            ];
            const frags = [
                "The goblet glows with the deep, cool green of polished jade.",
                "It possesses a smooth, substantial feel, indicative of carved jade."
            ];
            super('Polished Jade', insults, complements, frags);
        }
    }(),

    new class VolcanicObsidian extends Material {
        constructor() {
            const insults = [
                "Did you think your answer was sharp, Roberts? It is as blunt and fractured as a poorly knapped piece of... common rock! No edge to it whatsoever!",
                "Your reasoning is as dark and muddled as the deepest, unlit cavern, pirate! No light of intelligence penetrates that thick skull of yours!",
                "You try to cut to the heart of the matter, but your intellect lacks the keenness, the natural cutting power. You are no master of deduction!",
                "Reflecting on your answer, Roberts, I see only a dull, opaque surface, devoid of any of the brilliance one might find in nature's sharper creations.",
                "An explosive burst of nonsense! Did that answer erupt from a deep well of ignorance within your hollow head?"
            ];
            const complements = [
                "A dangerously sharp answer, Roberts! It has the cutting edge of a freshly fractured stone. You handle such thoughts with surprising skill.",
                "There is a dark, glassy brilliance to your logic that I almost admire. It is both beautiful and deadly, all at once.",
                "You've struck upon a truth as profound and elemental as the fire from which this world was forged. An impressive display of raw intellect.",
                "A response with a certain natural, unrefined sharpness. It seems your mind is not as dull as I had presumed. There's a keen edge there.",
                "Reflecting on your answer, I see a surprising depth. A dark, smooth surface that hides a core of undeniable, if fiery, correctness."
            ];
            const frags = [
                "It is carved from a piece of glossy, black volcanic obsidian.",
                "The material is cool to the touch with a sharp, glassy edge."
            ];
            super('Volcanic Obsidian', insults, complements, frags);
        }
    }(),

    new class TarnishedCopper extends Material {
        constructor() {
            const insults = [
                "Your attempt to conduct a battle of wits, Roberts, has resulted in a rather… oxidized performance. Not your brightest moment, was it?",
                "That green tinge of naivety clinging to your answer is rather unbecoming, pirate! It speaks of a mind not well-maintained, easily corroded by foolishness!",
                "Did you 'coin' that phrase yourself, Roberts? Because it has the ring of something base and common, not the pure gold of true intellect!",
                "I sense a distinct lack of polish in your response. Perhaps some vigorous scrubbing could improve your intellect, though I doubt it.",
                "An answer so dull it has developed a patina of stupidity! It's almost impressive in its dedication to being wrong."
            ];
            const complements = [
                "An answer with a certain... weathered wisdom, Roberts. It seems that beneath a surface of humble origins, a bright spark of conductivity remains.",
                "I must admit, your logic is a better conductor of truth than I anticipated. An elementary, yet effective, line of reasoning.",
                "You see the value in things that others might overlook due to a bit of... discoloration. A keen eye, pirate, for finding the usefulness in the common.",
                "That answer has the warm glow of a well-used hearth. It's common, yes, but it provides a certain fundamental, undeniable truth.",
                "Beneath the greenish patina of your uncultured methods, I detect a glint of pure, uncorrupted cleverness. A rare and notable discovery."
            ];
            const frags = [
                "The goblet has a dull, reddish-brown hue, with patches of greenish tarnish typical of old copper.",
                "It bears the dents and imperfections of a well-used copper item."
            ];
            super('Tarnished Copper', insults, complements, frags);
        }
    }(),

    new class PolishedHorn extends Material {
        constructor() {
            const insults = [
                "Are you trying to 'butt' heads with a superior intellect, Roberts? Your answer is as hollow and resonant with emptiness as a… well, as a poorly chosen word!",
                "Smooth and curved your logic is not! It's as gnarled and twisted as an old ram's... well, you get the picture!",
                "A 'beastly' attempt at a solution, pirate! But it lacks the natural, layered strength. Your mind is not so robust, it seems.",
                "Your argument, much like some things made of this material, is full of empty noise! Toot your own horn elsewhere, Roberts, your answer is wrong!",
                "You've layered stupidity upon stupidity to arrive at that answer! A truly animalistic approach to a gentleman's game."
            ];
            const complements = [
                "A surprisingly natural and effective answer, Roberts. You've stripped away the unnecessary and gotten to the very core of the matter.",
                "There is a certain primal strength to your logic. It's layered, resilient, and more polished than your brutish appearance would suggest.",
                "You've sounded a note of truth, pirate! That answer resonates with a certain... organic clarity. It's almost musical.",
                "An answer that is both lightweight and remarkably tough. You are full of surprises, like a treasure found in the most unlikely of beasts.",
                "I must admit, your point is well-taken. Smooth, curved, and unexpectedly sharp. You truly are a creature of instinct, aren't you?"
            ];
            const frags = [
                "The goblet is crafted from polished horn, displaying variegated shades of cream and brown.",
                "It feels smooth and surprisingly light, with a natural, organic texture."
            ];
            super('Polished Horn', insults, complements, frags);
        }
    }(),

    new class GlazedTerracotta extends Material {
        constructor() {
            const insults = [
                "How wonderfully… pedestrian, Roberts! An answer as common and uninspired as a simple clay pot. Truly, you aim for the stars, don't you?",
                "Did you bake that answer in a kiln of stupidity, pirate? Because it's as fragile and easily broken as unglazed earth!",
                "Your reasoning is rather... unrefined. It lacks a certain protective sheen of brilliance. Easily shattered.",
                "Red in the face, are we, Roberts? Perhaps from the heat of your embarrassment, or maybe you're just as dense as this baked earth!",
                "Such an earthy, commoner's response! It smells of the dirt from which your base intellect was formed!"
            ];
            const complements = [
                "A surprisingly earthy and well-formed argument, Roberts. It may be common, but its utility is undeniable. Well done.",
                "You've managed to fire your logic until it's hard and resilient. That answer, I must admit, holds water.",
                "A response with a certain rustic charm. You've applied a fine glaze of intellect to an otherwise simple, foundational truth.",
                "For a man of the sea, you have a remarkable grasp of the earth. A solid, if fragile, piece of reasoning that I cannot easily shatter.",
                "Warm, simple, and effective. You've crafted an answer that, while not ornate, serves its purpose with a humble and surprising grace."
            ];
            const frags = [
                "It has the rustic, earthy appeal of glazed terracotta.",
                "The goblet is moderately heavy, with a slightly porous feel beneath its glaze."
            ];
            super('Glazed Terracotta', insults, complements, frags);
        }
    }(),

    new class GildedLead extends Material {
        constructor() {
            const insults = [
                "Ah, Roberts, your answer has a certain superficial shine, but underneath, it's disappointingly… dense. All show and no substance!",
                "What a heavy, dull, and ultimately worthless answer, beneath a thin veneer of cleverness! A perfect parallel to such deceptive craftsmanship!",
                "You were 'led' astray by simplicity, weren't you? Your mind is weighed down by its own ponderous nature!",
                "A glittering response on the surface, Roberts, but dig a little deeper and one finds only the base, common material of a fool's argument. Inconceivable!",
                "That answer is poison to true intellects, pirate! A sweet-looking lie that hides a toxic core of absolute wrongness!"
            ];
            const complements = [
                "A deceptively brilliant answer, Roberts! It has the glittering appeal of pure gold, even if its underlying logic is... heavier than one might expect.",
                "You've managed to present a weighty argument as a glittering prize. The illusion is so perfect, I am almost tempted to believe you are as smart as you appear.",
                "Such a dense and solid point, cleverly coated in a layer of irresistible charm. You understand that presentation is, at times, everything.",
                "I see you've chosen an answer that is more than it appears. It seems heavy with truth, yet you present it with a disarmingly brilliant shine.",
                "An answer that is both valuable on the surface and dangerously potent underneath. You are a master of disguise, pirate. I'll give you that."
            ];
            const frags = [
                "The goblet has a surprisingly heavy weight and a lustrous golden sheen, though it feels oddly soft.",
                "A thin layer of gold seems to coat a much denser, less precious metal beneath."
            ];
            super('Gilded Lead', insults, complements, frags);
        }
    }(),

    new class CrackedAlabaster extends Material {
        constructor() {
            const insults = [
                "Your reasoning, Roberts, much like a flawed carving, is showing its fractures! A beautiful attempt at deception perhaps, but ultimately unsound!",
                "You sound pale and fragile, much like your chances of winning this battle of wits! This veined stone, even with its flaws, has more character than your bland answer.",
                "Did you drop your brain on the way here, pirate? Your answer displays such a network of fissures, it's a wonder it holds together at all!",
                "Such a milky, opaque answer! Are you trying to hide your ignorance behind a soft and cloudy veil of nonsense?",
                "That argument is so weak it could be scratched by a fingernail! The slightest pressure from my intellect and it will crumble into dust!"
            ];
            const complements = [
                "Even with its apparent flaws, your logic holds a certain... translucent beauty. You've pieced together a truth from imperfect parts. Astonishing.",
                "A response as pure and white as a sculptor's dream, even if it shows the strains of your effort. The underlying quality is undeniable.",
                "You see the beauty in the imperfections, don't you, pirate? Your answer, while showing some stress, is fundamentally sound and quite elegant.",
                "Through the fissures of your simplistic approach, a surprising light of intellect shines through. The overall effect is... unexpectedly impressive.",
                "That answer is a masterwork, Roberts. A bit damaged, perhaps, from the great strain of its creation in your tiny mind, but a masterwork nonetheless."
            ];
            const frags = [
                "Crafted from alabaster, its milky translucence is marred by several fine cracks.",
                "The stone feels smooth but cool, with visible fissures spiderwebbing across its surface."
            ];
            super('Cracked Alabaster', insults, complements, frags);
        }
    }(),

    // FormOverallShape Variants
    new class Spherical extends FormOverallShape {
        constructor() {
            const insults = [
                "Your reasoning, Roberts, is as well-rounded as a child's ball, and just as easily deflated! An utterly pointless display of folly!",
                "A perfectly circular argument, pirate! Leading absolutely nowhere, much like your chances of outwitting me!",
                "That answer is all encompassing in its stupidity! You've managed to be wrong from every conceivable angle at once!",
                "Bah! A globular mass of nonsense that could have been uttered by a common beach ball!",
                "You've come full circle to arrive at... nothing! A perfectly contained vacuum of thought!"
            ];
            const complements = [
                "A perfectly well-rounded answer, Roberts! It covers all possibilities and leaves no room for error. Annoyingly complete.",
                "Your logic is as smooth and continuous as a globe. An argument with no beginning and no end, yet it perfectly encapsulates the truth.",
                "I must admit, your reasoning is flawless from every angle. A truly global perspective on the problem. I'm almost impressed.",
                "You've managed to circle the problem and land perfectly on the solution. A feat of intellectual acrobatics I did not anticipate.",
                "An answer as simple and perfect as a pearl. It may seem basic, but its form is undeniably correct. Well done, pirate."
            ];
            const frags = [
                "The bowl of the goblet is perfectly spherical.",
                "It has a round, globe-like form."
            ];
            super('Spherical', insults, complements, frags);
        }
    }(),

    // ... (This pattern of declaring frags as a const is applied to all subsequent new classes) ...

    new class TwoOrnateHandles extends Handles {
        constructor() {
            const insults = [
                "Something to grasp onto, Roberts, as your hopes of winning this contest rapidly slip away! These are more secure than your tenuous hold on reality!",
                "Such elaborate, ostentatious grips, pirate! Overcompensating for a weak argument and an even weaker mind, perhaps?",
                "Did you need assistance in lifting that moronic thought out of your head? Such a shame you couldn't find a better one.",
                "An argument with two equally flawed sides! It's a miracle of symmetrical stupidity!",
                "All that decoration and flourish, and yet the core of your statement is still utterly, laughably wrong."
            ];
            const complements = [
                "A well-handled and balanced argument, Roberts! You've managed to grasp both sides of the issue with a surprising, decorative flair.",
                "Your logic is as symmetrical and pleasing as a perfectly matched pair. An answer that is both functional and, dare I say, artistic.",
                "You have a firm grip on the situation, pirate. Your reasoning is flanked by supporting points that make it impossible to refute. Annoyingly clever.",
                "An answer that one can truly get a handle on. It's elaborate, yes, but the core truth is easily grasped. I did not expect such clarity from you.",
                "You've presented a solution with two points of entry, both leading to the same, inescapable truth. A well-crafted, if showy, piece of logic."
            ];
            const frags = [
                "The goblet has two elaborately decorated handles, one on each side.",
                "Matching ornate handles allow for a two-handed grip."
            ];
            super('Two Ornate Handles', insults, complements, frags);
        }
    }(),
    new class SinglePlainHandle extends Handles {
        constructor() {
            const insults = [
                "One simple, unadorned loop, Roberts. Much like the singular, simplistic, and utterly incorrect thought currently rattling around your empty skull!",
                "A functional, if unimpressive, appendage, pirate. Unlike your contributions to this debate, which serve no useful purpose whatsoever!",
                "Was that the only thought you could latch onto? A single, lonely, and incorrect idea to carry you to your doom.",
                "You're circling the problem with one looped bit of nonsense, hoping it will somehow catch the truth. It will not.",
                "How utilitarian in your foolishness! You've found the most efficient way to be completely and utterly wrong."
            ];
            const complements = [
                "A simple, functional, and direct answer. You have a handle on the situation, even if your methods are... unadorned.",
                "You've attached yourself to a single, solid point of logic and held on. A display of simple tenacity that is, I admit, effective.",
                "An answer with a single, clear purpose. It may not be fancy, but it provides a firm grip on the truth. Surprisingly practical.",
                "You've looped around the complexities to find the one, simple solution. A rather elegant, if plain, maneuver.",
                "One handle, one answer, one truth. Your mind, for once, is not cluttered with unnecessary appendages. A clean and correct response."
            ];
            const frags = [
                "A single, unadorned handle is attached to one side.",
                "It features one simple loop for holding."
            ];
            super('a Single Plain Handle', insults, complements, frags);
        }
    }(),
    new class NoHandles extends Handles {
        constructor() {
            const insults = [
                "Nowhere to hide your trembling, incompetent fingers, Roberts! You must face your doom… unassisted and utterly exposed!",
                "Nothing to get a proper grip on, pirate! Much like this slippery riddle you so spectacularly failed to grasp with your feeble intellect!",
                "A smooth, featureless, and utterly moronic statement. There is nothing to grasp onto because there is no substance!",
                "Your mind is as slippery as an eel, Roberts! And just as brainless! You've let the answer slide right through your clumsy mental grasp.",
                "To embrace your argument is to embrace a void! It is formless and offers no purchase for a logical mind!"
            ];
            const complements = [
                "A smooth and streamlined answer, Roberts! Devoid of any clumsy attachments, it slips directly to the truth. Sleek.",
                "You need no assistance, it seems. Your mind grasps the problem directly, without need for any superficial aids. Impressively self-reliant.",
                "An answer one must embrace fully to understand. You have a holistic grasp of the situation that is... surprisingly complete.",
                "Your logic is slippery, pirate, and yet it arrives at the correct destination. You've navigated the challenges without anything to hold on to.",
                "A pure, unadorned solution. By removing the unnecessary, you have revealed the simple, core truth. A minimalist masterpiece."
            ];
            const frags = [
                "The goblet has no handles at all.",
                "It must be gripped by the bowl or stem."
            ];
            super('No Handles', insults, complements, frags);
        }
    }(),
    new class HiddenOrUnusualHandles extends Handles {
        constructor() {
            const insults = [
                "Always looking for a trick, a hidden advantage, Roberts? A secret way to gain an upper hand you don't deserve? Your mind is as convoluted and impractical as this!",
                "What peculiar, almost perverse design! Are you as awkward and difficult to get a proper hold of as this, pirate?",
                "Is that your answer or a puzzle box of stupidity? It's so unnecessarily complex I can't imagine how you even constructed it.",
                "You've concealed your ignorance within a shell of feigned cleverness! But I see through your pathetic disguise!",
                "An answer so unconventional it borders on the insane! You've integrated your foolishness into the very fabric of your being!"
            ];
            const complements = [
                "A cleverly disguised solution, Roberts! I almost didn't see the hidden mechanism of your logic. Almost.",
                "You have an unconventional grip on the problem, pirate. It's awkward, unexpected, yet somehow, you make it work. Baffling.",
                "An answer that is more than it appears. You've integrated your reasoning into the very fabric of the riddle. A seamless, if tricky, piece of work.",
                "I see the secret now. A hidden catch, a clever turn of phrase... you've found a way to hold an argument that seemed impossible to grasp.",
                "What a peculiar design your mind has. It's not immediately obvious how it works, but it clearly has a way of latching onto the correct answer. Fascinating."
            ];
            const frags = [
                "The handles are cleverly integrated into the design or are of an unconventional nature.",
                "It's not immediately obvious how one is meant to hold it by its handles."
            ];
            super('Hidden or Unusual Handles', insults, complements, frags);
        }
    }(),
    new class Hexagonal extends FormOverallShape {
        constructor() {
            const insults = [
                "An answer with far too many sides, Roberts! And every single one of them is wrong! You've constructed a honeycomb of pure idiocy!",
                "Is your mind a beehive of bad ideas? Because that answer is as needlessly complex and ultimately pointless as a single cell in a pointless structure!",
                "Six sides of stupidity! You've managed to be wrong in more ways than I thought possible with a single word!",
                "Such a rigid, formulaic response! It lacks the organic flow of true genius. You think in clumsy, unnatural shapes, pirate!",
                "You've built a prison of logic for yourself, Roberts, and it has six identical, inescapable walls of wrongness!"
            ];
            const complements = [
                "A surprisingly efficient and well-structured answer, Roberts! Like a honeycomb, every part fits perfectly to create a strong whole.",
                "I see... a complex answer with many interconnected facets. There is a certain geometric elegance to your reasoning that is... unexpected.",
                "Six points of truth, all converging on the correct answer. A masterful display of intellectual architecture, pirate.",
                "Your mind is a beehive of activity, it seems, and for once it has produced something as sweet and well-formed as honey. Remarkable.",
                "An answer with a natural, yet mathematical, precision. It has the strength of a structure built by nature's finest engineers."
            ];
            const frags = [
                "The body of the vessel is a distinct hexagonal prism.",
                "It is built upon a six-sided geometric form."
            ];
            super('Hexagonal', insults, complements, frags);
        }
    }(),
new class Teardrop extends FormOverallShape {
    constructor() {
        const insults = [
            "Are you weeping at your own incompetence, Roberts? Because that answer has all the substance of a single, pathetic tear.",
            "Your logic is as soft and formless as a drop of water, pirate! It lacks any true structure or resilience!",
            "That answer is a perfect symbol of your intellectual fragility! One touch of my wit, and it will burst into a thousand useless droplets.",
            "You've managed to distill your foolishness into a single, perfectly shaped drop of idiocy. Commendable, in its own way.",
            "Such a mournful, heavy-bottomed attempt at a solution. It drags itself down with the weight of its own wrongness."
        ];
        const complements = [
            "A surprisingly poignant and pure answer, Roberts. It distills the truth to its most fundamental, unadorned form.",
            "Your logic flows with a certain natural grace, pirate. It's a simple, yet perfectly formed, piece of wisdom.",
            "I must admit, your reasoning has a beautiful, organic simplicity. It captures the essence of the problem with elegant conciseness.",
            "You've managed to distill the complexities into a single, clear point. A truly fluid and insightful piece of deduction.",
            "An answer that, while seemingly delicate, holds a profound truth. It's a testament to the power of simple, unadorned clarity."
        ];
        const frags = [
            "The goblet has a smooth, rounded top that tapers to a point at the bottom, like a teardrop.",
            "Its silhouette is reminiscent of a falling drop of liquid."
        ];
        super('Teardrop', insults, complements, frags);
    }
}(),
new class Hourglass extends FormOverallShape {
    constructor() {
        const insults = [
            "Your time is running out, Roberts, and your answer is as constricted and useless as sand in a broken glass! It holds no substance!",
            "A truly pinched intellect, pirate! Your thoughts are as narrow and fleeting as the passage of time in this ridiculous shape!",
            "You've wasted precious moments, Roberts, only to deliver an answer that is as empty and unfulfilling as a spent vessel!",
            "Your logic is as thin in the middle as your chances of winning! It's a fragile, easily shattered concept.",
            "Does your brain only function in two distinct, separated halves, Roberts? Because that answer shows no continuity of thought!"
        ];
        const complements = [
            "A surprisingly elegant and balanced answer, Roberts. It shows a clear progression of thought, from broad understanding to precise conclusion.",
            "Your logic flows with a certain graceful inevitability, pirate. It narrows to a point of truth, then expands to encompass its full implications.",
            "I must admit, your reasoning has a beautiful symmetry. It distills the problem to its essence, then reveals its full form.",
            "You've managed to capture the essence of time in your answer. It's a fluid, yet perfectly contained, piece of wisdom.",
            "An answer that, while seemingly simple, holds a profound depth. It shows a clear understanding of cause and effect, and the passage of truth."
        ];
        const frags = [
            "The goblet has a distinct hourglass shape, narrow in the middle.",
            "Its form resembles two cones joined at their apexes."
        ];
        super('Hourglass', insults, complements, frags);
    }
}(),
new class Asymmetrical extends FormOverallShape {
    constructor() {
        const insults = [
            "Your logic is as lopsided and unbalanced as a drunken sailor, Roberts! It lists dangerously to the side of pure idiocy!",
            "A truly misshapen thought, pirate! It lacks the harmony and balance of a truly brilliant mind. It's an offense to symmetry!",
            "Did you construct that argument in the dark? It's a chaotic jumble of mismatched parts with no discernible order!",
            "That answer is so far off-center it's in another country! A testament to your profoundly skewed perspective.",
            "One side of your brain is clearly not speaking to the other! The result is this... this lopsided monstrosity of a word!"
        ];
        const complements = [
            "A surprisingly unconventional and creative answer, Roberts. It breaks the mold of predictable thinking.",
            "Your logic follows a unique, almost artistic path. It may not be balanced, but it arrives at a beautiful and correct conclusion.",
            "I must admit, your reasoning is refreshingly unpredictable. You've found a truth that lies outside the bounds of conventional symmetry.",
            "You've managed to find harmony in chaos. A truly unique and insightful piece of deduction.",
            "An answer that, while seemingly unbalanced, holds a profound and hidden equilibrium. You see patterns where others see only disorder."
        ];
        const frags = [
            "The goblet has a deliberately asymmetrical and unbalanced design.",
            "Its form is irregular and lacks conventional symmetry."
        ];
        super('Asymmetrical', insults, complements, frags);
    }
}(),
new class BellShaped extends FormOverallShape {
    constructor() {
        const insults = [
            "That answer rings with the hollow clang of a cracked bell, Roberts! It signals nothing but your own impending doom!",
            "A truly resonant display of foolishness, pirate! Your words echo in the empty chamber of your skull!",
            "You've managed to chime in with an answer so utterly devoid of sense, it's a wonder it didn't deafen us all with its stupidity!",
            "That answer is as wide at the bottom as your mouth, and just as full of empty noise! All sound and no substance.",
            "For whom does the bell toll, Roberts? It tolls for your wit, which is clearly dead and buried!"
        ];
        const complements = [
            "A surprisingly resonant and clear answer, Roberts. It rings with the undeniable clarity of truth.",
            "Your logic chimes with a certain beautiful harmony. It builds from a narrow point to a broad, all-encompassing conclusion.",
            "I must admit, your reasoning is remarkably sound. It peals with a confidence that is hard to ignore.",
            "You've managed to strike a chord of truth, pirate. A truly sonorous and impressive piece of deduction.",
            "An answer that, once heard, cannot be unheard. It's a testament to the power of a clear and resounding declaration of fact."
        ];
        const frags = [
            "The goblet has a classic bell shape, narrow at the top and flaring out at the bottom.",
            "Its silhouette is reminiscent of a large, cast bell."
        ];
        super('Bell-Shaped', insults, complements, frags);
    }
}(),
class Scratched extends CurrentCondition {
    constructor() {
        const insults = [
            "Your intellect is similarly marred, Roberts! A superficial flaw, perhaps, but it speaks volumes of your careless handling of truth!",
            "A minor imperfection, pirate, but it's enough to ruin the entire surface of your argument! You lack finesse!",
            "Did you drag your brain across a rough surface, Roberts? Because that answer shows clear signs of intellectual abrasion!",
            "That answer is as irritating and distracting as a persistent itch! It detracts from any semblance of brilliance you might possess.",
            "You've left a permanent mark of your foolishness, Roberts! A testament to your clumsy attempts at wit."
        ];
        const complements = [
            "A surprisingly resilient answer, Roberts. Even with a few superficial marks, its core integrity remains unblemished.",
            "Your logic, though showing signs of wear, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few rough edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to etch a truth into my mind, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some battles, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The surface of the goblet is marred by numerous fine scratches.",
            "It has visible abrasions, suggesting some rough handling."
        ];
        super('Scratched', insults, complements, frags);
    }
}(),

new class Dented extends CurrentCondition {
    constructor() {
        const insults = [
            "Your logic is similarly misshapen, Roberts! A clear sign of impact from a superior intellect! You've been thoroughly flattened!",
            "A rather unsightly deformation, pirate! It speaks of a mind that has taken a severe blow and failed to recover its original form!",
            "Did you drop your brain, Roberts? Because that answer shows clear signs of a significant intellectual impact! It's quite caved in!",
            "That answer is as unappealing and distorted as a crumpled tin can! It lacks any semblance of its intended shape.",
            "You've suffered a crushing defeat, Roberts! Your argument is as irrevocably altered as this unfortunate vessel."
        ];
        const complements = [
            "A surprisingly resilient answer, Roberts. Even with a few imperfections, its core structure remains intact.",
            "Your logic, though bearing the marks of conflict, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few dents, still manages to convey its message clearly. A rugged truth.",
            "You've managed to make an impact, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some battles, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet has a noticeable dent on its side.",
            "Its surface is slightly caved in at one point."
        ];
        super('Dented', insults, complements, frags);
    }
}(),
new class Polished extends CurrentCondition {
    constructor() {
        const insults = [
            "All surface, no substance, Roberts! Your answer is as superficially shiny as this, but utterly devoid of true intellectual depth!",
            "You've merely buffed away the obvious flaws, pirate! Beneath that thin veneer, your ignorance still gleams!",
            "Did you spend more time on presentation than on thought, Roberts? Because that answer is all shine and no substance!",
            "That answer is as slick and insincere as a politician's smile! It's designed to deceive, but I see through it!",
            "You've tried to make a silk purse out of a sow's ear, Roberts! But even with all that effort, it's still a pig's ear of an answer!"
        ];
        const complements = [
            "A truly refined and brilliant answer, Roberts! It gleams with intellectual clarity and precision.",
            "Your logic is as smooth and unblemished as a mirror. It reflects the truth with dazzling accuracy.",
            "I must admit, your reasoning is remarkably well-crafted. It shines with a brilliance that is hard to ignore.",
            "You've managed to bring out the very best in your thoughts, pirate. A truly polished and impressive piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of careful thought and meticulous execution."
        ];
        const frags = [
            "The goblet is exceptionally clean and highly polished.",
            "Its surface gleams with a brilliant, unblemished shine."
        ];
        super('Polished', insults, complements, frags);
    }
}
(),
new class Grimy extends CurrentCondition {
    constructor() {
        const insults = [
            "Your intellect is similarly caked in layers of neglect, Roberts! A truly filthy display of ignorance!",
            "A rather unappealing accumulation of intellectual grime, pirate! It speaks of a mind that has not seen a good scrubbing in ages!",
            "Did you roll your brain in the mud, Roberts? Because that answer is as dirty and obscure as a forgotten alleyway!",
            "That answer is as unpleasant and off-putting as a thick layer of filth! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet is covered in a thick layer of grime and dirt.",
            "Its surface is dull and obscured by accumulated filth."
        ];
        super('Grimy', insults, complements, frags);
    }
}
(),
new class Intact extends CurrentCondition {
    constructor() {
        const insults = [
            "Your intellect may be 'intact,' Roberts, but it's clearly not functioning! A perfectly preserved specimen of utter uselessness!",
            "A truly unbroken chain of foolishness, pirate! It's all there, every single link of your intellectual ineptitude!",
            "You've managed to keep your brain in one piece, Roberts, but it's clearly not doing you any good! A perfectly preserved monument to idiocy!",
            "That answer is as whole and complete as a broken promise! It's all there, but it means absolutely nothing!",
            "You've managed to maintain a perfect facade of competence, Roberts! But beneath it, I see only an unbroken void of thought."
        ];
        const complements = [
            "A perfectly preserved answer, Roberts. Its integrity is unblemished, and its truth is undeniable.",
            "Your logic is as whole and complete as a perfect sphere. It leaves no room for doubt or imperfection.",
            "I must admit, your reasoning is remarkably sound. It stands as a testament to its own inherent correctness.",
            "You've managed to keep your thoughts perfectly intact, pirate. A truly impressive display of mental fortitude.",
            "An answer that is both simple and profound. It's a testament to the power of unadorned truth and unwavering clarity."
        ];
        const frags = [
            "The goblet is completely intact, with no visible damage or wear.",
            "It appears to be in its original, unbroken state."
        ];
        super('Intact', insults, complements, frags);
    }
}
(),
new class AbstractSwirls extends EngravingOrMotif {
    constructor() {
        const insults = [
            "Your logic is as formless and meaningless as these random squiggles, Roberts! It lacks any true pattern or purpose!",
            "A truly chaotic display of intellectual disarray, pirate! It's a jumble of nonsense with no discernible order!",
            "You've managed to create a response so utterly devoid of structure, it's a wonder it even escaped your lips! Pure, unadulterated gibberish!",
            "That answer is a masterpiece of confusion, Roberts! It's so abstract, it's practically non-existent in the realm of coherent thought.",
            "Does your mind simply generate random noise, pirate? Because that answer has no more meaning than a squiggly line on a canvas!"
        ];
        const complements = [
            "A surprisingly profound and unconventional answer, Roberts. It transcends traditional forms to reveal a deeper truth.",
            "Your logic is as fluid and adaptable as a master artist's vision. It finds truth in unexpected patterns.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem without being confined by rigid structures.",
            "You've managed to paint a picture of truth with broad, sweeping strokes. A truly abstract, yet undeniably correct, piece of deduction.",
            "An answer that defies easy categorization. It's complex, nuanced, and reveals a hidden order that only a truly unique mind could perceive."
        ];
        const frags = [
            "The surface is adorned with flowing, abstract swirls and curves.",
            "It features a non-representational pattern of intertwined lines."
        ];
        super('Abstract Swirls', insults, complements, frags);
    }
}
(),
new class CelestialMap extends EngravingOrMotif {
    constructor() {
        const insults = [
            "Your understanding of the universe is as flawed as this inaccurate map, Roberts! You're lost in a cosmos of your own ignorance!",
            "A truly stellar display of idiocy, pirate! Your answer is as far from the truth as the most distant, uncharted star!",
            "You've managed to chart a course to utter nonsense, Roberts! Your intellectual navigation is as unreliable as a broken compass!",
            "That answer is as obscure and indecipherable as an ancient star chart! It holds no clear path to the truth."
        ];
        const complements = [
            "A surprisingly insightful and far-reaching answer, Roberts. You've charted a course to the very stars of truth.",
            "Your logic is as vast and interconnected as the cosmos. It reveals a hidden order in the universe of our thoughts.",
            "I must admit, your reasoning is remarkably profound. It maps the complexities of the problem with celestial precision.",
            "You've managed to navigate the intellectual heavens with remarkable accuracy. A truly stellar piece of deduction."
        ];
        const frags = [
            "The goblet is engraved with a detailed map of celestial constellations.",
            "It depicts stars, planets, and cosmic phenomena in an intricate pattern."
        ];
        super('a Celestial Map', insults, complements, frags);
    }
}
(),
new class AncientRunes extends EngravingOrMotif {
    constructor() {
        const insults = [
            "Your answer is as indecipherable and meaningless as these ancient scribbles, Roberts! It holds no wisdom, only confusion!",
            "A truly archaic display of intellectual ineptitude, pirate! Your words are as dead and forgotten as these symbols!",
            "You've managed to conjure a response so utterly devoid of sense, it's a wonder it even escaped your lips! Pure, unadulterated gibberish!",
            "That answer is a relic of a bygone era of foolishness, Roberts! It belongs in a museum of intellectual failures."
        ];
        const complements = [
            "A surprisingly profound and ancient answer, Roberts. It speaks of a wisdom that transcends time and conventional understanding.",
            "Your logic is as deeply etched and enduring as these timeless symbols. It holds a power that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It deciphers the complexities of the problem with an almost mystical clarity.",
            "You've managed to unlock a hidden truth, pirate. A truly arcane, yet undeniably correct, piece of deduction."
        ];
        const frags = [
            "The goblet is covered in a series of ancient, unfamiliar runes.",
            "It features a pattern of mysterious, symbolic carvings."
        ];
        super('Ancient Runes', insults, complements, frags);
    }
}
(),
new class NauticalSymbols extends EngravingOrMotif {
    constructor() {
        const insults = [
            "Your understanding of the sea is as shallow as a puddle, Roberts! You're adrift in a vast ocean of your own ignorance!",
            "A truly watery display of intellectual ineptitude, pirate! Your answer is as aimless and unguided as a ship without a rudder!",
            "You've managed to chart a course to utter nonsense, Roberts! Your intellectual navigation is as unreliable as a broken compass!",
            "That answer is as obscure and indecipherable as an ancient sea chart! It holds no clear path to the truth."
        ];
        const complements = [
            "A surprisingly insightful and far-reaching answer, Roberts. You've charted a course to the very depths of truth.",
            "Your logic is as vast and interconnected as the ocean. It reveals a hidden order in the currents of our thoughts.",
            "I must admit, your reasoning is remarkably profound. It maps the complexities of the problem with nautical precision.",
            "You've managed to navigate the intellectual seas with remarkable accuracy. A truly stellar piece of deduction."
        ];
        const frags = [
            "The goblet is engraved with symbols of the sea, such as anchors, compasses, and waves.",
            "It depicts nautical motifs in an intricate pattern."
        ];
        super('Nautical Symbols', insults, complements, frags);
    }
}
(),
new class HeraldicBeasts extends EngravingOrMotif {
    constructor() {
        const insults = [
            "Your pride is as inflated and baseless as these imaginary creatures, Roberts! You boast of a strength you do not possess!",
            "A truly fantastical display of intellectual delusion, pirate! Your answer is as mythical and unreal as these beasts!",
            "You've managed to conjure a response so utterly devoid of reality, it's a wonder it even escaped your lips! Pure, unadulterated fantasy!",
            "That answer is a coat of arms for your foolishness, Roberts! It proudly displays your intellectual bankruptcy for all to see."
        ];
        const complements = [
            "A surprisingly noble and powerful answer, Roberts. It speaks of a strength and lineage that is both ancient and undeniable.",
            "Your logic is as majestic and enduring as these timeless symbols. It holds a power that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It embodies the spirit of the problem with a regal clarity.",
            "You've managed to claim a truth, pirate. A truly heraldic, yet undeniably correct, piece of deduction."
        ];
        const frags = [
            "The goblet is adorned with stylized depictions of heraldic beasts like griffins and lions.",
            "It features a pattern of mythical creatures often found on coats of arms."
        ];
        super('Heraldic Beasts', insults, complements, frags);
    }
}
(),
new class Earthy extends Odor {
    constructor() {
        const insults = [
            "Your intellect is as unrefined and common as dirt, Roberts! It reeks of the mundane and the utterly uninspired!",
            "A truly grounded display of idiocy, pirate! Your answer is as dull and uninteresting as a pile of soil!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable."
        ];
        const frags = [
            "It carries a distinct, damp, and rich earthy scent.",
            "The odor is reminiscent of freshly turned soil or a forest floor after rain."
        ];
        super('Earthy', insults, complements, frags);
    }
}
(),
new class Floral extends Odor {
    constructor() {
        const insults = [
            "Your answer is as cloying and artificial as a cheap bouquet, Roberts! It tries to mask the stench of your incompetence!",
            "A truly flowery display of intellectual weakness, pirate! Your words are as fragile and fleeting as a wilting blossom!",
            "You've managed to conjure a response so utterly devoid of substance, it's a wonder it even escaped your lips! Pure, unadulterated fluff!",
            "That answer is as sickly sweet and insincere as a forced smile! It's designed to deceive, but I see through it!",
            "You've tried to make a silk purse out of a sow's ear, Roberts! But even with all that effort, it's still a pig's ear of an answer!"
        ];
        const complements = [
            "A surprisingly delicate and beautiful answer, Roberts. It blossoms with intellectual clarity and precision.",
            "Your logic is as fragrant and appealing as a fresh bouquet. It reflects the truth with dazzling accuracy.",
            "I must admit, your reasoning is remarkably well-crafted. It blooms with a brilliance that is hard to ignore.",
            "You've managed to bring out the very best in your thoughts, pirate. A truly polished and impressive piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of careful thought and meticulous execution."
        ];
        const frags = [
            "A distinct, pleasant floral scent emanates from the goblet.",
            "It smells of fresh blossoms, like roses or jasmine."
        ];
        super('Floral', insults, complements, frags);
    }
}
(),
new class Spicy extends Odor {
    constructor() {
        const insults = [
            "Your answer is as irritating and overwhelming as a mouthful of hot peppers, Roberts! It burns with the fire of your foolishness!",
            "A truly pungent display of intellectual ineptitude, pirate! Your words are as sharp and unpleasant as a raw onion!",
            "You've managed to conjure a response so utterly devoid of subtlety, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick cloud of chili smoke! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly bold and flavorful answer, Roberts. It adds a certain zest to the truth, making it all the more memorable.",
            "Your logic, though perhaps a bit intense, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to spice up the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "A strong, piquant, and somewhat burning spicy aroma emanates from it.",
            "The goblet smells distinctly of exotic spices, like cinnamon or cloves."
        ];
        super('Spicy', insults, complements, frags);
    }
}
(),
new class Chemical extends Odor {
    constructor() {
        const insults = [
            "Your intellect is as artificial and toxic as a laboratory concoction, Roberts! It reeks of unnatural and dangerous ideas!",
            "A truly synthetic display of intellectual ineptitude, pirate! Your words are as sterile and lifeless as a beaker of acid!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly precise and analytical answer, Roberts. It dissects the truth with a cold, logical precision.",
            "Your logic, though perhaps a bit clinical, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "A sharp, acrid, and somewhat artificial chemical odor is present.",
            "The goblet smells faintly of cleaning solutions or a laboratory."
        ];
        super('Chemical', insults, complements, frags);
    }
}
(),
new class Sweet extends Odor {
    constructor() {
        const insults = [
            "Your answer is as cloying and artificial as a cheap candy, Roberts! It tries to mask the stench of your incompetence!",
            "A truly saccharine display of intellectual weakness, pirate! Your words are as fragile and fleeting as a sugar cube!",
            "You've managed to conjure a response so utterly devoid of substance, it's a wonder it even escaped your lips! Pure, unadulterated fluff!",
            "That answer is as sickly sweet and insincere as a forced smile! It's designed to deceive, but I see through it!",
            "You've tried to make a silk purse out of a sow's ear, Roberts! But even with all that effort, it's still a pig's ear of an answer!"
        ];
        const complements = [
            "A surprisingly delicate and beautiful answer, Roberts. It blossoms with intellectual clarity and precision.",
            "Your logic is as fragrant and appealing as a fresh bouquet. It reflects the truth with dazzling accuracy.",
            "I must admit, your reasoning is remarkably well-crafted. It blooms with a brilliance that is hard to ignore.",
            "You've managed to bring out the very best in your thoughts, pirate. A truly polished and impressive piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of careful thought and meticulous execution."
        ];
        const frags = [
            "A light, sweet, and sugary aroma emanates from the goblet.",
            "It smells distinctly of honey or fruit candy."
        ];
        super('Sweet', insults, complements, frags);
    }
}
(),
new class Pungent extends Odor {
    constructor() {
        const insults = [
            "Your answer is as offensive and overwhelming as a rotten egg, Roberts! It reeks of the putrid and the utterly uninspired!",
            "A truly foul display of intellectual ineptitude, pirate! Your words are as sharp and unpleasant as a raw onion!",
            "You've managed to conjure a response so utterly devoid of subtlety, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick cloud of skunk spray! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly bold and impactful answer, Roberts. It cuts through the noise to reveal a raw, undeniable truth.",
            "Your logic, though perhaps a bit intense, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to unearth a truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "A strong, sharp, and somewhat unpleasant pungent odor is present.",
            "The goblet smells distinctly of strong cheese or ammonia."
        ];
        super('Pungent', insults, complements, frags);
    }
}
(),
new class Featherlight extends Weight {
    constructor() {
        const insults = [
            "Your arguments are similarly lacking in substance and significance, Roberts! All air and no weight whatsoever, easily dismissed!",
            "So little heft to your words, pirate! They float away like feathers in the wind, signifying absolutely nothing of consequence or intelligence!",
            "Did you blow that answer out of your mouth, Roberts? Because it's as insubstantial and fleeting as a puff of smoke!",
            "That answer is as flimsy and inconsequential as a dandelion seed! It's designed to float away, but I see through it!",
            "You've managed to create a response so utterly devoid of gravity, Roberts! A testament to your profound lack of intellectual density."
        ];
        const complements = [
            "A surprisingly nimble and agile answer, Roberts. It moves with a grace that belies its profound truth.",
            "Your logic is as light and effortless as a bird in flight. It soars above the complexities to reveal a simple truth.",
            "I must admit, your reasoning is remarkably elegant. It floats with a brilliance that is hard to ignore.",
            "You've managed to lift the veil of confusion with surprising ease, pirate. A truly weightless, yet undeniably correct, piece of deduction.",
            "An answer that is both delicate and profound. It's a testament to the power of subtle thought and effortless clarity."
        ];
        const frags = [
            "The goblet feels almost weightless, like a feather.",
            "It is surprisingly light, as if made of air."
        ];
        super('Featherlight', insults, complements, frags);
    }
}
(),
new class Solid extends Weight {
    constructor() {
        const insults = [
            "Your intellect is as dense and unyielding as a brick, Roberts! It resists all attempts at penetration!",
            "A truly impenetrable display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of lead!",
            "You've managed to conjure a response so utterly devoid of flexibility, it's a wonder it even escaped your lips! Pure, unadulterated rigidity!",
            "That answer is as unyielding and unmovable as a mountain! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual inertia, Roberts! A testament to your profound lack of mental agility."
        ];
        const complements = [
            "A surprisingly robust and foundational answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a perfectly cut stone. A truly square deal of an answer.",
            "I must admit, your reasoning is refreshingly straightforward. It builds a strong, rectangular argument that is hard to dismantle.",
            "You've managed to frame the problem perfectly. A clear, concise, and structurally sound piece of deduction.",
            "An answer with a certain robust, no-nonsense quality. It may not be elegant, but its undeniable correctness is a block of pure truth."
        ];
        const frags = [
            "The goblet feels incredibly solid and dense.",
            "It has a substantial, unyielding weight to it."
        ];
        super('Solid', insults, complements, frags);
    }
}
(),
new class Hollow extends Weight {
    constructor() {
        const insults = [
            "Your arguments are similarly lacking in substance and significance, Roberts! All air and no weight whatsoever, easily dismissed!",
            "So little heft to your words, pirate! They echo with emptiness, signifying absolutely nothing of consequence or intelligence!",
            "Did you scoop out your brain, Roberts? Because that answer is as hollow and resonant with nothingness as a drum!",
            "That answer is as flimsy and inconsequential as a soap bubble! It's designed to burst, but I see through it!",
            "You've managed to create a response so utterly devoid of gravity, Roberts! A testament to your profound lack of intellectual density."
        ];
        const complements = [
            "A surprisingly resonant answer, Roberts. It echoes with a truth that is both subtle and profound.",
            "Your logic is as light and effortless as a bird in flight. It soars above the complexities to reveal a simple truth.",
            "I must admit, your reasoning is remarkably elegant. It floats with a brilliance that is hard to ignore.",
            "You've managed to lift the veil of confusion with surprising ease, pirate. A truly weightless, yet undeniably correct, piece of deduction.",
            "An answer that is both delicate and profound. It's a testament to the power of subtle thought and effortless clarity."
        ];
        const frags = [
            "The goblet feels surprisingly light and hollow.",
            "It has a noticeable resonance when tapped, suggesting an empty interior."
        ];
        super('Hollow', insults, complements, frags);
    }
}
(),
new class Dense extends Weight {
    constructor() {
        const insults = [
            "Your intellect is as dense and unyielding as a brick, Roberts! It resists all attempts at penetration!",
            "A truly impenetrable display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of lead!",
            "You've managed to conjure a response so utterly devoid of flexibility, it's a wonder it even escaped your lips! Pure, unadulterated rigidity!",
            "That answer is as unyielding and unmovable as a mountain! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual inertia, Roberts! A testament to your profound lack of mental agility."
        ];
        const complements = [
            "A surprisingly robust and foundational answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a perfectly cut stone. A truly square deal of an answer.",
            "I must admit, your reasoning is refreshingly straightforward. It builds a strong, rectangular argument that is hard to dismantle.",
            "You've managed to frame the problem perfectly. A clear, concise, and structurally sound piece of deduction.",
            "An answer with a certain robust, no-nonsense quality. It may not be elegant, but its undeniable correctness is a block of pure truth."
        ];
        const frags = [
            "The goblet feels incredibly dense and heavy for its size.",
            "It has a surprising amount of mass, suggesting a very compact material."
        ];
        super('Dense', insults, complements, frags);
    }
}
(),
new class Airy extends Weight {
    constructor() {
        const insults = [
            "Your arguments are similarly lacking in substance and significance, Roberts! All air and no weight whatsoever, easily dismissed!",
            "So little heft to your words, pirate! They float away like feathers in the wind, signifying absolutely nothing of consequence or intelligence!",
            "Did you blow that answer out of your mouth, Roberts? Because it's as insubstantial and fleeting as a puff of smoke!",
            "That answer is as flimsy and inconsequential as a dandelion seed! It's designed to float away, but I see through it!",
            "You've managed to create a response so utterly devoid of gravity, Roberts! A testament to your profound lack of intellectual density."
        ];
        const complements = [
            "A surprisingly nimble and agile answer, Roberts. It moves with a grace that belies its profound truth.",
            "Your logic is as light and effortless as a bird in flight. It soars above the complexities to reveal a simple truth.",
            "I must admit, your reasoning is remarkably elegant. It floats with a brilliance that is hard to ignore.",
            "You've managed to lift the veil of confusion with surprising ease, pirate. A truly weightless, yet undeniably correct, piece of deduction.",
            "An answer that is both delicate and profound. It's a testament to the power of subtle thought and effortless clarity."
        ];
        const frags = [
            "The goblet feels incredibly light, almost as if it's made of air.",
            "It has a delicate, ethereal quality due to its minimal weight."
        ];
        super('Airy', insults, complements, frags);
    }
}
(),
new class LeadWeighted extends Weight {
    constructor() {
        const insults = [
            "Your intellect is as dense and unyielding as a brick, Roberts! It resists all attempts at penetration!",
            "A truly impenetrable display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of lead!",
            "You've managed to conjure a response so utterly devoid of flexibility, it's a wonder it even escaped your lips! Pure, unadulterated rigidity!",
            "That answer is as unyielding and unmovable as a mountain! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual inertia, Roberts! A testament to your profound lack of mental agility."
        ];
        const complements = [
            "A surprisingly robust and foundational answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a perfectly cut stone. A truly square deal of an answer.",
            "I must admit, your reasoning is refreshingly straightforward. It builds a strong, rectangular argument that is hard to dismantle.",
            "You've managed to frame the problem perfectly. A clear, concise, and structurally sound piece of deduction.",
            "An answer with a certain robust, no-nonsense quality. It may not be elegant, but its undeniable correctness is a block of pure truth."
        ];
        const frags = [
            "The goblet feels unusually heavy, as if weighted with lead.",
            "It has a surprising, almost unnatural density for its size."
        ];
        super('Lead-Weighted', insults, complements, frags);
    }
}
(),
new class Priceless extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as immeasurable and useless as a forgotten treasure, Roberts! It holds no value in this world!",
            "A truly invaluable display of idiocy, pirate! Your answer is as rare and unattainable as a unicorn's horn!",
            "You've managed to conjure a response so utterly devoid of worth, it's a wonder it even escaped your lips! Pure, unadulterated nothingness!",
            "That answer is as priceless and unattainable as a dream! It holds no clear path to the truth.",
            "Does your mind simply wander aimlessly through the intellectual void, pirate? Because that answer has no more direction than a lost soul!"
        ];
        const complements = [
            "A surprisingly profound and invaluable answer, Roberts. It transcends all earthly measures of worth.",
            "Your logic is as rare and precious as a mythical gem. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to unearth a hidden truth, pirate. A truly priceless, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "Its value is clearly beyond monetary estimation, appearing truly priceless.",
            "This goblet seems to be an artifact of immeasurable worth."
        ];
        super('Priceless', insults, complements, frags);
    }
}
(),
new class Common extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as common and uninspired as a roadside pebble, Roberts! It holds no value in this world!",
            "A truly mundane display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of clay!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "It appears to be a common, mass-produced item with little intrinsic value.",
            "This goblet seems to be an everyday object, easily found anywhere."
        ];
        super('Common', insults, complements, frags);
    }
}
(),
new class Heirloom extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as dusty and forgotten as an old family relic, Roberts! It holds no value in this modern world!",
            "A truly sentimental display of idiocy, pirate! Your answer is as fragile and outdated as a faded photograph!",
            "You've managed to conjure a response so utterly devoid of relevance, it's a wonder it even escaped your lips! Pure, unadulterated nostalgia!",
            "That answer is as unpleasant and off-putting as a thick layer of dust! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly profound and timeless answer, Roberts. It carries the wisdom of generations past.",
            "Your logic is as deeply rooted and enduring as a family tree. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It connects the past to the present with a clarity that is truly precious.",
            "You've managed to inherit a truth, pirate. A truly heirloom-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "This goblet appears to be a cherished family heirloom, passed down through generations.",
            "It has the worn but beloved look of an object with significant sentimental value."
        ];
        super('Heirloom', insults, complements, frags);
    }
}
(),
new class Counterfeit extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as fake and worthless as a forged coin, Roberts! It holds no value in this world!",
            "A truly deceptive display of idiocy, pirate! Your answer is as convincing as a wooden nickel!",
            "You've managed to conjure a response so utterly devoid of authenticity, it's a wonder it even escaped your lips! Pure, unadulterated fraud!",
            "That answer is as unpleasant and off-putting as a thick layer of rust! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly clever and deceptive answer, Roberts. It has the appearance of truth, even if its origins are... questionable.",
            "Your logic is as convincing as a master forger's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to create a truth, pirate. A truly counterfeit, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet appears to be a clever counterfeit, designed to look valuable but lacking true worth.",
            "It has the deceptive appearance of a genuine antique, but closer inspection reveals it to be a fake."
        ];
        super('Counterfeit', insults, complements, frags);
    }
}
(),
new class CollectorItem extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as niche and obscure as a rare stamp, Roberts! It holds no value in this world!",
            "A truly specialized display of idiocy, pirate! Your answer is as convincing as a wooden nickel!",
            "You've managed to conjure a response so utterly devoid of general appeal, it's a wonder it even escaped your lips! Pure, unadulterated esoterica!",
            "That answer is as unpleasant and off-putting as a thick layer of dust! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly insightful and specialized answer, Roberts. It holds a value that only a true connoisseur can appreciate.",
            "Your logic is as rare and precious as a forgotten artifact. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to unearth a hidden truth, pirate. A truly collector-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "This goblet appears to be a rare and highly sought-after collector's item.",
            "It has the distinct markings and quality of a valuable piece for enthusiasts."
        ];
        super('Collector Item', insults, complements, frags);
    }
}
(),
new class BazaarFind extends MonetaryValue {
    constructor() {
        const insults = [
            "Your intellect is as common and uninspired as a roadside pebble, Roberts! It holds no value in this world!",
            "A truly mundane display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of clay!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "This goblet looks like a typical find from a bustling bazaar, eclectic and of uncertain origin.",
            "It has the charm of a well-traveled, perhaps slightly worn, item from a foreign market."
        ];
        super('Bazaar Find', insults, complements, frags);
    }
}
(),
new class GreenLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as murky and unnatural as this vile concoction, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly toxic display of idiocy, pirate! Your answer is as sterile and lifeless as a beaker of acid!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly vibrant and intriguing answer, Roberts. It holds a certain mystique, hinting at deeper truths.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a bright, almost glowing green liquid.",
            "A viscous, emerald-colored fluid fills the cup."
        ];
        super('Green Liquid', insults, complements, frags);
    }
}
(),
new class BlueLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as cold and unfeeling as this frigid liquid, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly sterile display of idiocy, pirate! Your answer is as lifeless as a frozen pond!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly serene and calming answer, Roberts. It holds a certain mystique, hinting at deeper truths.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a deep, vibrant blue liquid.",
            "A shimmering, sapphire-colored fluid fills the cup."
        ];
        super('Blue Liquid', insults, complements, frags);
    }
}
(),
new class MurkyLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as murky and obscure as this vile concoction, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly toxic display of idiocy, pirate! Your answer is as sterile and lifeless as a beaker of acid!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly profound and insightful answer, Roberts. It hints at hidden depths and subtle truths.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a murky, opaque liquid, its color indistinct.",
            "A cloudy, unsettling fluid fills the cup, obscuring its bottom."
        ];
        super('Murky Liquid', insults, complements, frags);
    }
}
(),
new class SparklingLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as effervescent and insubstantial as this bubbly liquid, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly frivolous display of idiocy, pirate! Your answer is as sterile and lifeless as a flat soda!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly vibrant and effervescent answer, Roberts. It sparkles with intellectual clarity and precision.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a clear liquid with numerous tiny bubbles, actively sparkling.",
            "A lively, effervescent fluid fills the cup, catching the light."
        ];
        super('Sparkling Liquid', insults, complements, frags);
    }
}
(),
new class ViscousLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as thick and slow as this vile concoction, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly sluggish display of idiocy, pirate! Your answer is as sterile and lifeless as a beaker of acid!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly profound and insightful answer, Roberts. It hints at hidden depths and subtle truths.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a thick, viscous liquid that moves slowly.",
            "A heavy, syrupy fluid fills the cup, clinging to the sides."
        ];
        super('Viscous Liquid', insults, complements, frags);
    }
}
(),
new class ClearLiquid extends Liquid {
    constructor() {
        const insults = [
            "Your intellect is as transparent and simple as this clear liquid, Roberts! It reeks of the artificial and the utterly uninspired!",
            "A truly sterile display of idiocy, pirate! Your answer is as lifeless as a frozen pond!",
            "You've managed to conjure a response so utterly devoid of natural intelligence, it's a wonder it even escaped your lips! Pure, unadulterated poison!",
            "That answer is as unpleasant and off-putting as a noxious fume! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly serene and calming answer, Roberts. It holds a certain mystique, hinting at deeper truths.",
            "Your logic is as precise and analytical as a chemist's formula. It dissects the truth with a cold, logical precision.",
            "I must admit, your reasoning, despite a few sharp edges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to distill the truth, pirate. It may not be perfectly smooth, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The goblet contains a perfectly clear, colorless liquid.",
            "A transparent fluid fills the cup, allowing you to see through it."
        ];
        super('Clear Liquid', insults, complements, frags);
    }
}
(),
new class Beveled extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as awkwardly angled as this rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly precise and elegant answer, Roberts. It cuts through the complexities with a subtle, yet undeniable, clarity.",
            "Your logic is as sharp and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly beveled, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim has a distinct beveled edge, angled inwards or outwards.",
            "It features a precisely cut, sloping border."
        ];
        super('Beveled', insults, complements, frags);
    }
}
(),
new class Rolled extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as convoluted and useless as this rolled rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly smooth and refined answer, Roberts. It flows with a certain grace that belies its profound truth.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly rolled, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim is smoothly rolled inwards, creating a soft, rounded edge.",
            "It features a continuous, curved border without any sharp points."
        ];
        super('Rolled', insults, complements, frags);
    }
}
(),
new class Serrated extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as jagged and useless as this serrated rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly sharp and impactful answer, Roberts. It cuts through the complexities with a subtle, yet undeniable, clarity.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly serrated, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim has a series of small, sharp teeth or notches, making it serrated.",
            "It features a rough, saw-like edge."
        ];
        super('Serrated', insults, complements, frags);
    }
}
(),
new class Gilded extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as superficially shiny as this gilded rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly elegant and refined answer, Roberts. It gleams with intellectual clarity and precision.",
            "Your logic is as sharp and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly gilded, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim is adorned with a thin layer of gold, giving it a gilded appearance.",
            "It features a decorative golden band around its edge."
        ];
        super('Gilded', insults, complements, frags);
    }
}
(),
new class Smooth extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as slippery and useless as this smooth rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly smooth and refined answer, Roberts. It flows with a certain grace that belies its profound truth.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly smooth, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim is perfectly smooth and unblemished.",
            "It features a continuous, even border without any irregularities."
        ];
        super('Smooth', insults, complements, frags);
    }
}
(),
new class Jagged extends Rim {
    constructor() {
        const insults = [
            "Your intellect is as jagged and useless as this jagged rim, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly sharp and impactful answer, Roberts. It cuts through the complexities with a subtle, yet undeniable, clarity.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly jagged, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The rim has a rough, irregular, and jagged edge.",
            "It features sharp, uneven points along its border."
        ];
        super('Jagged', insults, complements, frags);
    }
}
(),
new class Bumpy extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as uneven and irritating as this bumpy surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly tactile and engaging answer, Roberts. It adds a certain texture to the truth, making it all the more memorable.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The surface is covered in small, irregular bumps or protrusions.",
            "It has a distinctly uneven and raised texture."
        ];
        super('Bumpy', insults, complements, frags);
    }
}
(),
new class Grainy extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as coarse and unrefined as this grainy surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The surface has a fine, granular texture, like sandpaper.",
            "It feels slightly rough and gritty to the touch."
        ];
        super('Grainy', insults, complements, frags);
    }
}
(),
new class Silky extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as slippery and useless as this silky surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly smooth and refined answer, Roberts. It flows with a certain grace that belies its profound truth.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly silky, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The surface feels incredibly smooth and soft, like silk.",
            "It has a luxurious, almost frictionless texture."
        ];
        super('Silky', insults, complements, frags);
    }
}
(),
new class Rough extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as coarse and unrefined as this rough surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly authentic answer, Roberts. It carries the marks of real-world experience, unvarnished by superficiality.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The surface is noticeably rough and abrasive to the touch.",
            "It has a coarse, unpolished texture."
        ];
        super('Rough', insults, complements, frags);
    }
}
(),
new class Corrugated extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as ridged and useless as this corrugated surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly tactile and engaging answer, Roberts. It adds a certain texture to the truth, making it all the more memorable.",
            "Your logic, though perhaps a bit rough, still holds its form. A testament to its underlying strength.",
            "I must admit, your reasoning, despite a few smudges, still manages to convey its message clearly. A rugged truth.",
            "You've managed to dig up a truth, pirate. It may not be perfectly clean, but its message is undeniable.",
            "An answer that has seen some hard use, but emerges victorious. Its marks tell a story of resilience and hard-won wisdom."
        ];
        const frags = [
            "The surface has a series of parallel ridges and grooves, making it corrugated.",
            "It feels like a washboard to the touch."
        ];
        super('Corrugated', insults, complements, frags);
    }
}
(),
new class Velvety extends SurfaceTexture {
    constructor() {
        const insults = [
            "Your intellect is as soft and useless as this velvety surface, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly soft and refined answer, Roberts. It flows with a certain grace that belies its profound truth.",
            "Your logic is as precise and well-defined as a master craftsman's edge. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly velvety, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The surface feels incredibly soft and smooth, like velvet.",
            "It has a luxurious, almost plush texture."
        ];
        super('Velvety', insults, complements, frags);
    }
}
(),
new class Pedestal extends Base {
    constructor() {
        const insults = [
            "Your intellect is as elevated and useless as a broken statue, Roberts! It serves no purpose but to gather dust!",
            "A truly pretentious display of idiocy, pirate! Your answer is as dull and uninteresting as a poorly carved stone!",
            "You've managed to conjure a response so utterly devoid of substance, it's a wonder it even escaped your lips! Pure, unadulterated grandiosity!",
            "That answer is as unpleasant and off-putting as a thick layer of dust! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly profound and elevated answer, Roberts. It stands tall, supporting the truth with undeniable grace.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly pedestal-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet rests on a tall, slender pedestal base.",
            "It has an elegant, elevated foot designed for display."
        ];
        super('Pedestal', insults, complements, frags);
    }
}
(),
new class Tripod extends Base {
    constructor() {
        const insults = [
            "Your intellect is as unstable and useless as a broken tripod, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly stable and balanced answer, Roberts. It stands firm on three points of undeniable truth.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly tripod-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet is supported by a three-legged, tripod-style base.",
            "It features a stable, three-pronged foot."
        ];
        super('Tripod', insults, complements, frags);
    }
}
(),
new class Flat extends Base {
    constructor() {
        const insults = [
            "Your intellect is as flat and uninspired as a pancake, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly stable and grounded answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly flat, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet has a simple, flat base, allowing it to sit flush on a surface.",
            "It features a broad, unadorned foot without any elevation."
        ];
        super('Flat', insults, complements, frags);
    }
}
(),
new class Weighted extends Base {
    constructor() {
        const insults = [
            "Your intellect is as dense and unyielding as a brick, Roberts! It resists all attempts at penetration!",
            "A truly impenetrable display of idiocy, pirate! Your answer is as dull and uninteresting as a lump of lead!",
            "You've managed to conjure a response so utterly devoid of flexibility, it's a wonder it even escaped your lips! Pure, unadulterated rigidity!",
            "That answer is as unyielding and unmovable as a mountain! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual inertia, Roberts! A testament to your profound lack of mental agility."
        ];
        const complements = [
            "A surprisingly robust and foundational answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a perfectly cut stone. A truly square deal of an answer.",
            "I must admit, your reasoning is refreshingly straightforward. It builds a strong, rectangular argument that is hard to dismantle.",
            "You've managed to frame the problem perfectly. A clear, concise, and structurally sound piece of deduction.",
            "An answer with a certain robust, no-nonsense quality. It may not be elegant, but its undeniable correctness is a block of pure truth."
        ];
        const frags = [
            "The base of the goblet feels unusually heavy, suggesting it is weighted.",
            "It has a low center of gravity, making it very stable."
        ];
        super('Weighted', insults, complements, frags);
    }
}
(),
new class Sculpted extends Base {
    constructor() {
        const insults = [
            "Your intellect is as formless and useless as a lump of clay, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly artistic and profound answer, Roberts. It speaks of a creativity that is both subtle and undeniable.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly sculpted, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The base is intricately sculpted into a decorative form.",
            "It features a unique, artistic carving that serves as its foot."
        ];
        super('Sculpted', insults, complements, frags);
    }
}
(),
new class Simple extends Base {
    constructor() {
        const insults = [
            "Your intellect is as simple and uninspired as a child's drawing, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly simple and profound answer, Roberts. It cuts through the complexities with a subtle, yet undeniable, clarity.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly simple, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The base is simple and unadorned, focusing purely on functionality.",
            "It has a straightforward, minimalist design."
        ];
        super('Simple', insults, complements, frags);
    }
}
(),
new class Loop extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as circular and useless as this loop handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly simple and effective answer, Roberts. It provides a clear, unshakeable framework for the truth.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly loop-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet has a simple, circular loop handle.",
            "It features a single, unadorned ring for gripping."
        ];
        super('Loop', insults, complements, frags);
    }
}
(),
new class Ergonomic extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as awkward and useless as this ergonomic handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly comfortable and effective answer, Roberts. It fits the hand of truth with undeniable precision.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly ergonomic, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet has a handle shaped to fit the hand comfortably, with ergonomic curves.",
            "It features a thoughtfully designed grip for ease of use."
        ];
        super('Ergonomic', insults, complements, frags);
    }
}
(),
new class Chain extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as flimsy and useless as this chain handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly flexible and adaptable answer, Roberts. It links together truths with undeniable strength.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly chain-worthy, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet has a handle made of interconnected metal links, forming a chain.",
            "It features a flexible, segmented grip."
        ];
        super('Chain', insults, complements, frags);
    }
}
(),
new class Integrated extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as seamlessly useless as this integrated handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly seamless and elegant answer, Roberts. It flows with a certain grace that belies its profound truth.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly integrated, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The handles are seamlessly integrated into the goblet's main body, forming part of its overall design.",
            "It features a smooth, continuous form where the handles are not distinct additions."
        ];
        super('Integrated', insults, complements, frags);
    }
}
(),
new class Detachable extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as flimsy and useless as this detachable handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly versatile and adaptable answer, Roberts. It can be applied to various situations with undeniable effectiveness.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly detachable, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet has handles that appear to be detachable or removable.",
            "It features a modular grip that can be added or taken off."
        ];
        super('Detachable', insults, complements, frags);
    }
}
(),
new class AnimalShaped extends Handles {
    constructor() {
        const insults = [
            "Your intellect is as beastly and useless as this animal-shaped handle, Roberts! It lacks any true grace or precision!",
            "A truly clumsy display of intellectual ineptitude, pirate! Your answer is as dull and uninteresting as a poorly cut stone!",
            "You've managed to conjure a response so utterly devoid of sophistication, it's a wonder it even escaped your lips! Pure, unadulterated crudeness!",
            "That answer is as unpleasant and off-putting as a thick layer of mud! It obscures any potential brilliance you might possess.",
            "You've managed to accumulate a truly impressive amount of intellectual debris, Roberts! A testament to your profound lack of mental hygiene."
        ];
        const complements = [
            "A surprisingly wild and imaginative answer, Roberts. It adds a certain flair to the truth, making it all the more memorable.",
            "Your logic is as precise and well-defined as a master craftsman's work. It holds a value that is both subtle and undeniable.",
            "I must admit, your reasoning is remarkably insightful. It captures the essence of the problem with an almost mystical clarity.",
            "You've managed to find a hidden truth, pirate. A truly animal-shaped, yet undeniably correct, piece of deduction.",
            "An answer that is both beautiful and profound. It's a testament to the power of a mind that can see beyond the obvious, and into the very essence of things."
        ];
        const frags = [
            "The goblet's handles are sculpted in the form of animals, such as serpents or lions.",
            "It features decorative grips shaped like mythical creatures or real beasts."
        ];
        super('Animal-Shaped', insults, complements, frags);
    }
}


]);