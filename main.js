import { BrowserChat } from "./chat.js";
import { Game } from "./game.js";

// --- Game Initialization ---
function initializeGame() {
    const browserChat = new BrowserChat(); 
    // Game constructor expects a chat interface (for output) and a UI mediator (for input).
    // BrowserChat serves both roles.
    const game = new Game(); 

    // Initial status update
    // Assuming game object has these properties after construction or an init method
    // browserChat.updateStatus(game.playerHearts, game.roundNumber, MAX_ROUNDS_PLACEHOLDER); 

    game.run(browserChat).then(() => {
        console.log("Game has finished running.");
        // Display a game over message or allow restart via UI
    }).catch(error => {
        console.error("An error occurred during game execution:", error);
        browserChat.postMessage('⚙️', "System", "A critical error occurred! The game cannot continue.");
    });
}

document.addEventListener('DOMContentLoaded', initializeGame);