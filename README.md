# SHADOW//PROTOCOL
### Premium 2.5D Browser Stealth-Action Game

**SHADOW//PROTOCOL** is a tactical stealth assassination game built with Phaser 3, Vite, and JavaScript ES modules.

---

## 🎮 Game Concept & Core Loop
The player controls an elite operative infiltrating heavily fortified corporate blacksites. Each mission is a compact stealth puzzle:
1. **Analyze Guard Patrols**: Study vision cones, facing directions, and patrol loops.
2. **Utilize 2.5D Cover & Occlusion**: Solid walls, barriers, and alcoves break enemy line of sight.
3. **Execute Silent Takedowns**: Maneuver behind targets (outside their 75° field of view) and strike without raising alarms.
4. **Deploy the Shadow Decoy**: Place acoustic lures to pull guards out of position and bypass chokepoints.
5. **Secure Cryptographic Bounties**: Collect security credit chips dropped by eliminated sentries and hidden data caches.
6. **Extract Safely**: Once all sector enforcers are neutralized, reach the extraction zone to complete the mission.

---

## 🕹️ Controls Guide
| Action | Desktop Controls | Touch Controls |
| :--- | :--- | :--- |
| **Move Operative** | Left-Click walkable floor | Tap destination |
| **Cancel Movement** | Right-Click anywhere / [ESC] | Tap Cancel / Operative |
| **Execute Takedown** | Click guard prompt / [SPACE] | Tap `[TAKEDOWN]` badge |
| **Deploy Shadow Decoy** | Press [SPACE] / Click HUD button | Tap HUD Decoy button |
| **Tactical Pause** | [ESC] key / Click HUD `[PAUSE]` | Tap HUD `[PAUSE]` |

---

## 🛡️ Playable Operatives
Unlockable in the **Operative Armory** using credits extracted from completed missions:
- **GHOST // Operative** *(Unlocked by default)*
  - Balanced stealth specialist with standard decoy charges and sound suppression.
  - Speed: `180 px/s` | HP: `100` | Decoys: `2`
- **PHANTOM // Infiltrator** *(400 Credits)*
  - High-agility operative capable of rapid repositioning between cover.
  - Speed: `225 px/s` | HP: `80` | Decoys: `2`
- **WRAITH // Vanguard** *(800 Credits)*
  - Armored heavy operative with expanded decoy charges and reinforced plating.
  - Speed: `165 px/s` | HP: `140` | Decoys: `4`

---

## 🔬 Permanent Upgrades
- **Hyper-Sprint Servos**: Increases movement velocity (+10% per tier, max 3 tiers).
- **Tactical Decoy Cells**: Adds +1 distraction lure charge per tier (max 2 tiers).
- **Neural Disruptor Radius**: Extends silent takedown execution reach (+8px per tier, max 2 tiers).

---

## 🗺️ Five Handcrafted Missions
1. **Sector Alpha // Initiation**: Proving grounds teaching movement, vision cones, blind-spot positioning, and silent execution.
2. **Sector Beta // Crossfire**: A transit junction with intersecting patrol routes requiring timed coordination.
3. **Sector Gamma // Corridor Nine**: Long research corridor with narrow passages and barrier cover points.
4. **Sector Delta // Distraction Protocol**: Heavy sentry choke points designed to test tactical Shadow Decoy deployments.
5. **Sector Omega // Apex Vault**: 5 elite enforcers guarding the central mainframe data core.

---

## 📐 Architecture & Technology
- **Engine**: Phaser 3 (Arcade Physics, Canvas Texture Generator, Camera System).
- **Perspective**: 2.5D elevated view with Y-depth sorting, extruded wall tops/fronts, and ground contact drop-shadows.
- **Pathfinding**: Grid-based A* pathfinder with 8-directional movement, diagonal corner-cutting prevention, and nearest-walkable fallback.
- **Guard AI**: Multi-state finite state machine (`PATROL`, `SUSPICIOUS`, `INVESTIGATE`, `ALERT`, `ATTACK`, `SEARCH`, `RETURN`, `DEFEATED`).
- **Vision Raycasting**: Bresenham line-of-sight ray marching against collision geometry; dynamic translucent vision cones with wall occlusion.
- **Audio**: Built-in procedural Web Audio synthesizer (takedowns, alert stings, acoustic pulses, credit chimes, ambient drone) with zero external asset dependencies.
- **Persistence**: Browser `localStorage` save system with corrupted data fallback recovery.
- **Bundler & Test Runner**: Vite + Vitest with 18 automated unit tests.

---

## 🚀 Running Locally & Static Deployment
### Local Development
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# Server runs on http://localhost:3000

# Run automated tests
npm run test

# Production build
npm run build
```

### Static Hosting
The output in `dist/` is 100% static and ready to deploy directly to:
- **Netlify**: Drag & drop `dist` folder or connect repository.
- **Vercel**: `vercel deploy --prod`
- **GitHub Pages**: Deploy the `dist` directory.
