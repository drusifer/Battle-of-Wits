import { AutoShuffleDeck } from "./deck.js";

export class ChatSession {
    constructor(character, chat) {
        this.character = character;
        this.chat = chat;
    }

    async say(message, emphasis='') {
        await this.chat.say(this.character, message, emphasis);
    }

    async login() {
        await this.chat.login(this.character);
    }

    async logout() {
        await this.chat.logout(this.character);
    }

}

const INITIAL_PLAYER_HEARTS = 2; // Default, should be synced with game logic if possible
const SPEED_FACTOR = 2.0;

export class BrowserChat {
    constructor() {
        this.dpr = null;
        this.typingSpeedDeck = new AutoShuffleDeck(
            [1000*SPEED_FACTOR,
              300*SPEED_FACTOR,
              700*SPEED_FACTOR,
              500*SPEED_FACTOR]
        ).reshuffle();
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
        this.lastMessage = null;
    }

    async login(character) {
        await this.postMessage('game-event', "", "", 
            `      ---> ${character.name} has entered the chat. <---`, true, '')
        if (character.slug == "dpr") {
            this.dpr = character;
        }
    };

    async logout(character) {
        await this.say(character, 
            `      ---> ${character.name} has left the chat. <---`, true, '')
    };

    // base functionality
    async say(character, message, emphasis='') { 
        return await this.postMessage(character.slug, character.name,
             character.emoji, message, false, emphasis);
    }

    getRiddleAnswer() {
        return this.answerInputElement.value.trim();
    }

    async setInputStatus(status) {
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

    async waitForAnswer() {
        this.answerInputElement.placeholder="Your Answer Pirate..."
        this.setInputStatus("on");

        return new Promise(resolve => {
            // Declare variables to hold the listener function references
            // so they can be added and removed correctly.
            let submitCallback, hintCallback, inputCallback;

            const cleanupAndResolve = (click_val) => {
                // Remove the listeners to prevent them from firing again.
                this.submitAnswerButton.removeEventListener('click', submitCallback);
                this.hintButton.removeEventListener('click', hintCallback);
                this.answerInputElement.removeEventListener('keydown', inputCallback);

                if (click_val === 'answer') { // Use comparison '===' instead of assignment '='
                    resolve({ 'click': click_val, 'value': this.getRiddleAnswer() });
                    this.answerInputElement.value = '';
                } else {
                    resolve({ 'click': click_val });
                }
                this.setInputStatus("off");
            };

            // Define the actual listener functions.
            submitCallback = () => cleanupAndResolve('answer');
            hintCallback = () => cleanupAndResolve('hint');
            inputCallback = (event) => { // press enter in the input message box
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent default form submission
                    submitCallback();
                }
            };

            // Add the listeners.
            this.submitAnswerButton.addEventListener('click', submitCallback);
            this.hintButton.addEventListener('click', hintCallback);
            this.answerInputElement.addEventListener('keydown', inputCallback);
        });
    };

    async waitForGobletChoice() {
        this.gobletChoiceAreaDiv.style.display = 'flex';
        this.lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });

        return new Promise(resolve => {
            let leftCallback, rightCallback;
            const cleanupAndResolve = (click_val) => {
                this.leftGobletButton.removeEventListener('click', leftCallback);
                this.rightGobletButton.removeEventListener('click', rightCallback);
                this.gobletChoiceAreaDiv.style.display = 'none';
                this.lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
                resolve(click_val);
            };


            leftCallback = () => cleanupAndResolve("left");
            rightCallback = () => cleanupAndResolve("right");

            this.leftGobletButton.addEventListener('click', leftCallback);
            this.rightGobletButton.addEventListener('click', rightCallback);
        });

    };

    /**
     * Posts a message to the chat log in the browser.
     * @param {string} slug - The slug of the character.
     * @param {string} name - The name of the character.
     * @param {string} photo - The emoji/icon for the character.
     * @param {string} message - The message text.
     * @param {boolean} fast - If true, skips typing animation.
     * @param {string} emphasis - Extra class for the text.
     */
    async postMessage(slug, name, photo, message, fast, emphasis='') {

        if (!fast) {
            await this._delay(this.typingSpeedDeck.draw());
        }

        if(!message) {
            return;
        }

        if (!fast || (this.dpr == null || this.dpr.slug != slug)) {
            let typingIndicatorElement = this._showTypingIndicator(photo, slug);
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

        if (emphasis){
            bubbleDiv.classList.add(emphasis);
        }

        this.chatLogElement.appendChild(messageDiv);
        this.lastMessage = messageDiv;
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });

    }

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
                <div class="typing-indicator"><span>.</span>.<span>.</span><span>.</span></div>
            </div>`;
        this.chatLogElement.appendChild(indicatorDiv);
        indicatorDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    updateStatus(hearts, round) {
        this.document.getElementById('playerHearts').innerHTML = `Hearts: ${'❤️'.repeat(hearts)}${'🖤'.repeat(Math.max(0, INITIAL_PLAYER_HEARTS - hearts))}`;
        this.document.getElementById('roundInfo').textContent = `Round: ${round}`;
    }
}
