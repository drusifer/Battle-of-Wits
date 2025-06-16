import { AutoShuffleDeck } from "./autoShuffleDeck.js";

export class ChatSession {
    constructor(character, chat) {
        this.character = character;
        this.chat = chat;
    }

    async say(message) {
        await this.chat.say(this.character, message);
    }

    login() {
        this.chat.login(this.character);
    }

    logout() {
        this.chat.logout(this.character);
    }

}

class Chat {
    constructor() {
        this.dpr = null;
    }

    login(character) {
        this.postMessage('game-event', "", "", `      ---> ${character.name} has entered the chat. <---`, true)
        if (character.slug == "dpr") {
            this.dpr = character;
        }
    };

    logout(character) {
        this.say(character, `      ---> ${character.name} has left the chat. <---`, true)
    };

    // abstract
    async waitForAnswer() {};
    async waitForGobletChoice() {};
    async setInputStatus(status) {}; //"on" or "off"
    async postMessage(slug, name, photo, message, fast) {};

    async say(character, message) {};
}

// an abstract web client
// acts as a bridge between the browser's event model
// and the game's main loop.
export class AsyncChat extends Chat {
    constructor() {
        super();
    }

    // base functionality
    async say(character, message) {
        return await this.postMessage(character.slug, character.name,
             character.emoji, message, false);
    }
}

const INITIAL_PLAYER_HEARTS = 3; // Default, should be synced with game logic if possible

export class BrowserChat extends AsyncChat {
    constructor() {
        super();
        this.typingSpeedDeck = new AutoShuffleDeck([1000, 300, 700, 500]).reshuffle();
        this.document = document;
        this.chatLogElement = document.getElementById('chatLog');
        
        // Riddle input elements
        this.answerInputElement = document.getElementById('answerInput');
        this.submitAnswerButton = document.getElementById('submitAnswerButton');
        this.hintButton = document.getElementById('hintButton');

        // Goblet choice elements
        this.gobletChoiceAreaDiv = document.getElementById('gobletChoiceArea');
        this.leftGobletButton = document.getElementById('chooseLeftGobletButton');
        this.rightGobletButton = document.getElementById('chooseRightGobletButton');

        this.pendingMessages = [];
        this.setInputStatus("off");
    }

    getRiddleAnswer() {
        return this.answerInputElement.value.trim();
    }

    setInputStatus(status) {
        if (status == "on") {
            this.answerInputElement.disabled = false;
            this.submitAnswerButton.disabled = false;
            this.hintButton.disabled = false;
            this.answerInputElement.placeholder = "Your One Word Answer Pirate...";
        } else {
            this.answerInputElement.placeholder = "...";
            this.answerInputElement.disabled = true;
            this.submitAnswerButton.disabled = true;
            this.hintButton.disabled = true;
        }
    }

    waitForAnswer() {
        this.answerInputElement.placeholder="Your Answer Pirate..."
        this.setInputStatus("on");

        return new Promise( resolve => {
            const callback = (event) => {
                this.submitAnswerButton.removeEventListener('click', callback);
                resolve(this.getRiddleAnswer());
                this.answerInputElement.value = '';
                this.setInputStatus("off");
            };

            this.submitAnswerButton.addEventListener('click', callback);
            this.answerInputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    callback(event);
                }
            });
        });
    };

    waitForGobletChoice() {
        this.gobletChoiceAreaDiv.style.display = 'flex';

        return new Promise(resolve => {

            const leftCallback  = function() {
                this.leftGobletButton.removeEventListener('click', leftCallback);
                resolve("left")
            };
            this.leftGobletButton.addEventListener('click', leftCallback);

            const rightCallback  = function() {
                this.rightGobletButton.removeEventListener('click', rightCallback);
                resolve("right");
            };
            this.rightGobletButton.addEventListener('click', rightCallback);
        })
    };

    /**
     * Posts a message to the chat log in the browser.
     * @param {string} slug - The slug of the character.
     * @param {string} name - The name of the character.
     * @param {string} photo - The emoji/icon for the character.
     * @param {string} message - The message text.
     * @param {boolean} fast - If true, skips typing animation.
     */
    async postMessage(slug, name, photo, message, fast) {

        if (!fast) {
            await this._delay(this.typingSpeedDeck.draw());
        }

        if(!message) {
            return;
        }

        let typingIndicatorElement;
        if (!fast && (this.dpr == null || this.dpr.slug !== slug)) {
            typingIndicatorElement = this._showTypingIndicator(photo, slug);
            await this._delay(this.typingSpeedDeck.draw());
            this._hideTypingIndicator(typingIndicatorElement);
        }
        
        const messageDiv = this.document.createElement('div');
        messageDiv.classList.add('message', slug);

        const senderDiv = this.document.createElement('div');
        senderDiv.classList.add('message-sender');
        senderDiv.innerHTML = `<span class="icon">${photo}</span>${name}`;

        const bubbleDiv = this.document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.textContent = message; 

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(bubbleDiv);

        messageDiv.classList.add(slug);
        this.chatLogElement.appendChild(messageDiv);
        //this.scrollLastChildIntoView(this.chatLogElement);
        this.smoothScrollDivToBottom(this.chatLogElement);
    }

    // Smooth scroll alternative (less precise for absolute bottom, but often visually nicer)
    smoothScrollDivToBottom(element) {
         if (element) {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    // Or scrolling the last child into jview
    scrollLastChildIntoView(element) {
        if (element && element.lastElementChild) {
        element.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    /**
     * Gets the current value from the primary input field and clears it.
     * @returns {string} The value of the answer input field.
     */
    getInputValue() {
        const value = this.answerInputElement.value;
        this.answerInputElement.value = ''; 
        return value;
    }

    
    // --- UI State Management and Helper Methods (Private) ---

    _showTypingIndicator(photo, name) {
        const indicatorDiv = this.document.createElement('div');
        indicatorDiv.classList.add('message', 'typing-message');
        indicatorDiv.innerHTML = `
            <div class="message-sender">
                <span class="icon">${photo}</span>${name}
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>`;
        this.chatLogElement.appendChild(indicatorDiv);
        this.chatLogElement.scrollTop = this.chatLogElement.scrollHeight;
        return indicatorDiv;
    }

    _hideTypingIndicator(indicatorElement) {
        if (indicatorElement && indicatorElement.parentNode) {
            indicatorElement.remove();
        }
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    _setRiddleMode(active) {
        this.gobletChoiceAreaDiv.style.display = 'none';

        this.answerInputElement.disabled = !active;
        this.submitAnswerButton.disabled = !active;
        this.hintButton.disabled = !active;
        this.passButton.disabled = !active;
        if (active) {
            this.answerInputElement.focus();
        }
    }

    _setGobletMode(active) {
        this.gobletChoiceAreaDiv.style.display = active ? 'flex' : 'none';
        
        this.leftGobletButton.disabled = !active;
        this.rightGobletButton.disabled = !active;
    }

    /**
     * Updates the game status display (hearts, round).
     * @param {number} hearts - Current player hearts.
     * @param {number} round - Current round number.
     * @param {number} totalRounds - Total rounds in the game.
     */
    updateStatus(hearts, round, totalRounds) {
        this.document.getElementById('playerHearts').innerHTML = `Hearts: ${'❤️'.repeat(hearts)}${'🖤'.repeat(Math.max(0, INITIAL_PLAYER_HEARTS - hearts))}`;
        this.document.getElementById('roundInfo').textContent = `Round: ${round} / ${totalRounds}`;
    }
}
