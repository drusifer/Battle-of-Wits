import fs from 'fs';
import path from 'path';

const reactionsDir = 'data/conversations/reactions';

const modifiers = [
  "",
  " Absolutely.",
  " Mark my words.",
  " It is known.",
  " Think about it.",
  " Truly.",
  " I am certain.",
  " Just as I suspected.",
  " Or so it seems.",
  " Believe me.",
  " I have foreseen this.",
  " Obviously.",
  " Exactly.",
  " Beyond a doubt."
];

function expandArray(arr, targetSize = 50) {
  const result = [...arr];
  let i = 0;
  while (result.length < targetSize) {
    const base = arr[i % arr.length];
    const mod = modifiers[(Math.floor(i / arr.length)) % modifiers.length];
    
    let mutated = base;
    if (mod !== "") {
        mutated = base + mod;
    } else {
        mutated = base.replace("!", "!!").replace(".", "...");
    }
    
    if (!result.includes(mutated)) {
      result.push(mutated);
    }
    i++;
    if (i > 2000) break;
  }
  return result.slice(0, targetSize);
}

const newReactions = {
  "Vizzini": {
    "game:won": [
      "Tell them... I was... the smartest... *thud*",
      "I may be dead, but you're still a pirate! *gasp*",
      "The poison was... probably expired... anyway...",
      "At least I didn't make a... spelling error...",
      "I blame... the cup maker... *thud*",
      "INCONCEIVABLE... that I would die... like this...",
      "You woke up?! INCONCEIVABLE! *thud*",
      "You passed out... I thought I won... how... *gasp*"
    ],
    "game:lost": [
      "HAHAHA! Two doses! You fool!",
      "A glorious victory for Sicily and for intellect!",
      "Now, to collect my prize and write my memoirs!",
      "You couldn't handle the iocane once, let alone twice!",
      "As expected. A flawless execution of a flawless plan."
    ]
  },
  "Boy": {
    "game:won": [
      "He did it! Vizzini is gone!",
      "That was the best zinger ever before he fell over!",
      "I knew he wouldn't die! The immunity worked!",
      "He passed out! Oh wait, he's getting back up!",
      "I thought he was dead for a second! The immunity worked!",
      "He woke up just to see Vizzini fall over. Awesome.",
      "Serves him right for kidnapping Buttercup!",
      "Read the part where he falls over again, Grandpa!"
    ],
    "game:lost": [
      "He drank it twice?! Why would he do that?!",
      "This is the worst story ever! He can't die!",
      "Grandpa, you're making this up!",
      "I don't like this ending at all.",
      "Is there a magical resurrection pill? There has to be!"
    ]
  },
  "Gramps": {
    "game:won": [
      "And with a final, breathless insult, the Sicilian fell.",
      "The pirate stood victorious, immune and alive.",
      "Thus ends the greatest mind of a generation. Or so he claimed.",
      "He swooned, the poison heavy in his blood, but the immunity held.",
      "He passed out, yes, but a true pirate always wakes up.",
      "Revived by his years of preparation, he watched his foe fall.",
      "A battle of wits concluded, and the princess was safe."
    ],
    "game:lost": [
      "And so, the Dread Pirate Roberts succumbed to a double dose.",
      "Sometimes, even immunity has its limits when pressed too far.",
      "A tragic end to a daring rescue. A miscalculation of the highest order.",
      "Vizzini's laughter echoed as the hero fell.",
      "Perhaps he should have spent more time building up resistance."
    ]
  },
  "Buttercup": {
    "game:won": [
      "Westley! You're safe! He's really gone!",
      "He's gone... we're finally free!",
      "I knew your immunity would save you! My hero!",
      "Westley! You passed out! I thought I'd lost you again!",
      "You scared me half to death! But you're alive!",
      "Thank heavens you woke up! Your immunity worked!",
      "Quickly, we must leave this place before anyone else comes!",
      "You bested his mind and his poison. Oh, Westley!"
    ],
    "game:lost": [
      "Westley! No! Not again! A double dose was too much!",
      "You promised you'd always come back to me!",
      "This can't be happening! I won't let it!",
      "Vizzini, you monster! You killed him!",
      "My heart breaks all over again..."
    ]
  }
};

for (const [char, events] of Object.entries(newReactions)) {
  const filePath = path.join(reactionsDir, `${char}.json`);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  for (const [event, lines] of Object.entries(events)) {
    data[event] = expandArray(lines, 50);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\\n");
  console.log(`Updated ${char}.json with game:won and game:lost reactions (50 each)`);
}
