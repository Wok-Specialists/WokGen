# Wok Central Game Design Document (GDD) Outline

**Game Title:** Wok Central
**Platform:** Web-based (Browser)
**Engine/Framework:** Phaser.js (Frontend Game Client), Node.js/Express.js (Backend Game Server)
**Target Audience:** Players interested in simulation, crafting, exploration, and social interaction.

## 1. Core Concept & Vision

*   **Elevator Pitch:** A vast, dynamic web-based "everything game" where players build, explore, interact, and compete in a persistent world, combining elements of farming, fishing, city simulation, idle games, RPG progression, and social features.
*   **Unique Selling Proposition (USP):** What makes Wok Central stand out? (e.g., seamless blend of genres, deep crafting, community-driven economy, accessible web platform).
*   **Player Fantasy:** What emotional experience should players have? (e.g., sense of ownership, discovery, mastery, social connection).

## 2. Gameplay Mechanics

### 2.1 Core Loop
*   What is the minute-to-minute gameplay? (e.g., gather resources -> craft items -> sell for currency -> upgrade facilities).
*   What drives long-term engagement? (e.g., leveling, unlocking new areas, social competition).

### 2.2 Genre Breakdown (as per user's request)

*   **Farming/Fishing/Gathering:**
    *   Resource types (crops, fish, minerals, wood).
    *   Mechanics: planting, watering, harvesting, fishing spots, tools.
    *   Progression: better tools, new seeds, unlocking new areas for resources.
*   **Company/Entrepreneur/Shop Maintaining:**
    *   Crafting system: recipes, workstations, skill trees.
    *   Market/Economy: player-driven economy, NPC shops, trading.
    *   Management: hiring NPCs, managing production lines, optimizing sales.
*   **Base Progression/City Simulation:**
    *   Building mechanics: placing structures, expanding territory.
    *   Upgrades: enhancing buildings, increasing efficiency.
    *   City management: resource allocation, population needs, infrastructure.
*   **Idle/Clicker Elements:**
    *   Passive income/production when offline or not actively playing.
    *   Clicker mechanics for boosting certain activities (e.g., faster harvesting).
*   **Stardew Valley/Animal Crossing Style:**
    *   Social interaction with NPCs/other players.
    *   Seasonal events, daily tasks, friendship/reputation systems.
    *   Customization: player housing, avatar customization.
*   **Terraria/Dragon's Town Style:**
    *   Exploration: different biomes, hidden areas, dungeons.
    *   Enemies/Combat (if "shooter" elements are included, define here): basic combat mechanics, loot.
    *   World Generation: how will the "vast world" be created? Procedural generation? Hand-crafted regions?
*   **RPG/Leveling System:**
    *   Player levels, skill points, stats.
    *   Unlocking new abilities, recipes, or areas through leveling.

## 3. Multiplayer Features

*   **Interaction:** How do players interact? (e.g., trade, co-op building, competitive mini-games, chat).
*   **Persistence:** Persistent world or instanced player areas?
*   **Social Systems:** Guilds/factions, friends list, leaderboards.

## 4. Technical Design (High-Level)

*   **Frontend (Phaser.js Game Client):**
    *   Rendering: 2D tile-based? Isometric?
    *   Input: Keyboard, mouse, touch controls.
    *   Asset management: Sprites, tilemaps, UI elements.
*   **Backend (Node.js/Express.js Game Server):**
    *   Architecture: Dedicated server for game logic, separate from website.
    *   API Design: RESTful APIs for non-realtime actions, WebSockets for real-time game state synchronization.
    *   Game State Management: How will the persistent world and player data be stored and updated?
*   **Database (PostgreSQL):**
    *   Schema design considerations (users, inventory, buildings, world state, etc.).
    *   Scalability strategy.
*   **Networking:** WebSockets for real-time updates (player movement, chat, combat).
*   **Security:** Measures against cheating, data integrity.
*   **Deployment:** How will the game client and server be deployed?

## 5. Art & Sound Direction

*   **Art Style:** Pixel art, low-poly, cartoonish? (e.g., charming 2D pixel art reminiscent of Stardew Valley).
*   **User Interface (UI) / User Experience (UX):** Clean, intuitive, accessible.
*   **Sound Design:** Music, sound effects.

## 6. Monetization (Optional)

*   If any, how will the game generate revenue? (e.g., cosmetics, premium features, subscriptions).

## 7. Future Expansion

*   Ideas for post-launch content, new features, or expansions.

---

This document provides a starting point for planning Wok Central. It's designed to evolve as the vision becomes more concrete.
