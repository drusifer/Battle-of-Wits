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
    }()
]);