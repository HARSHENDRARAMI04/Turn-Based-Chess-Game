

```markdown
# Turn-based Chess-like Game with Websocket Communication

## Overview

This project is a turn-based game where players can move characters on a grid. The game uses WebSockets for real-time communication between the server and clients. Players can join the game, make moves, and restart the game if desired.

## Prerequisites

- **Node.js** (v14.x or higher recommended)
- **npm** (Node Package Manager)

## Setup

### Server Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Navigate to the server directory**:
   ```bash
   cd server
   ```

3. **Install the required npm packages**:
   ```bash
   npm install
   ```

4. **Start the WebSocket server**:
   ```bash
   node server.js
   ```

   The server will start on `ws://localhost:8080`.

### Client Setup

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Open `index.html`** in your preferred web browser. You can simply double-click the file or open it with a browser's "Open File" option.

## Usage

1. **Joining the Game**:
   - When the client opens, it will prompt you to enter your player identifier (either `A` or `B`).

2. **Playing the Game**:
   - Select a character by clicking on it.
   - Choose a move direction from the dropdown menu and click the "Move" button to make a move.

3. **Game Over**:
   - When the game ends, a message will be displayed indicating the winner or if the game is a draw.
   - You will be prompted to start a new game.

4. **Restarting the Game**:
   - If the game ends, you can restart it by confirming the prompt.

## Notes

- The server must be running before you start the client.
- Ensure that the WebSocket server URL in the client’s JavaScript (`ws://localhost:8080`) matches the URL where your server is running.

## Troubleshooting

- **WebSocket Connection Error**:
  - Make sure the WebSocket server is running.
  - Check the browser console for connection errors.

- **Invalid Character Move**:
  - Ensure you are moving a valid character and the move direction is allowed for that character.

