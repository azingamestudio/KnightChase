# ♟️ Knight Chase: Paper Strategy

![Game Banner](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge) ![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge) ![Tech](https://img.shields.io/badge/Built_With-React_&_Vite-61DAFB?style=for-the-badge&logo=react)

> **"Where Chess meets Chaos on a crumpled piece of paper."**

**Knight Chase** is a fast-paced, turn-based strategy game with a unique hand-drawn aesthetic. Players move like Knights in Chess, trying to either **capture** the opponent or **trap** them so they have no legal moves left. But beware—this isn't just a simple board game. Coffee spills, paper planes, and mystery boxes turn the tide of battle in an instant!

---

## 🌟 Key Features

### 🎮 Game Modes
*   **🤖 AI Training:** Sharpen your skills against our "PaperBot" AI with 3 difficulty levels (Easy, Medium, Hard).
*   **⚔️ Local PvP:** Challenge a friend on the same device. The classic duel experience.
*   **🌍 Online Multiplayer:** Battle real opponents worldwide in real-time rooms (Powered by Socket.IO).
*   **🗺️ Adventure Mode:** Embark on a journey through the "Notebook Realms". Complete levels with unique objectives and obstacles.

### 🎨 Unique Aesthetics & Themes
*   **Hand-Drawn Style:** Everything looks like it was sketched with a pencil, ballpoint pen, or chalk.
*   **Dynamic Themes:** Switch between **Pencil (Default)**, **Chalkboard**, **Blueprint (Blue)**, and **Neon**.
*   **Custom Skins:** Play as the classic Knight, or unlock the King, Wizard, or Ghost skins.

### ⚡ Chaos Mechanics
*   **☕ Coffee Spills:** The board is alive! Coffee spills may occur, blocking off outer edges of the map and shrinking the battlefield.
*   **✈️ Sabotage:** Fill your sabotage meter and launch a **Paper Plane** to block a random tile on the board.
*   **🎁 Mystery Boxes:** Collect boxes to gain game-changing power-ups:
    *   **⚡ Teleport:** Jump to any open spot on the map.
    *   **💣 Bomb:** Clear blocked tiles around you.
    *   **❄️ Freeze:** Skip the opponent's turn.

---

## 🛠️ Tech Stack

This project is built with a modern, performance-focused stack:

*   **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/) (Blazing fast HMR)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling for the sketch UI)
*   **Real-time:** [Socket.IO Client](https://socket.io/) (For Online Multiplayer)
*   **Mobile:** [Capacitor](https://capacitorjs.com/) (AdMob integration & native features)
*   **Icons:** [Heroicons](https://heroicons.com/)

---

## 🚀 Getting Started

Follow these steps to get the game running locally on your machine.

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/knight-chase.git
    cd knight-chase
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to start playing!

---

## 🎲 How to Play

1.  **Movement:** You are a **Knight**. You move in an "L" shape (2 squares in one direction, 1 square perpendicular).
2.  **The Trail:** Every square you leave becomes **Blocked** (scribbled out). You cannot move back to a blocked square.
3.  **Objective:**
    *   **Capture:** Land exactly on the opponent's square.
    *   **Trap:** Force the opponent into a position where they have no legal moves.
4.  **Strategy:** Plan ahead! Use the blocked tiles to fence your opponent in, but be careful not to trap yourself.

---

## 📂 Project Structure

```
knight-chase/
├── components/          # React Components
│   ├── KnightChaseGame.tsx  # Core Game Logic & UI
│   ├── AdventureMap.tsx     # Adventure Mode Map
│   ├── MainMenu.tsx         # Menu Screen
│   └── ...
├── src/
│   ├── lib/             # Utilities (Audio, i18n, API, AdMob)
│   └── index.css        # Tailwind & Custom Animations
├── server/              # Simple Socket.IO Server (for online play)
├── App.tsx              # Main Application Entry
└── package.json         # Dependencies
```

---

## 🌍 Multi-Language Support
The game currently supports:
*   🇬🇧 English
*   🇹🇷 Turkish
*   🇪🇸 Spanish
*   🇩🇪 German
*   🇫🇷 French

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new chaos mechanics, themes, or skins:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

---

<p align="center">
  <i>Made with ❤️ and a lot of coffee ☕</i>
</p>
