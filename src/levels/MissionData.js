import { TILE_TYPES } from '../utils/Constants.js';

export function createMission(def) {
  let playerSpawn = def.playerSpawn || { gx: 1, gy: 1 };
  let exitLocation = def.exitLocation || { gx: 1, gy: 1 };

  const layout = def.asciiMap.map((line, y) => {
    return line.split('').map((char, x) => {
      if (char === 'P') {
        playerSpawn = { gx: x, gy: y };
        return TILE_TYPES.FLOOR;
      }
      if (char === 'E') {
        exitLocation = { gx: x, gy: y };
        return TILE_TYPES.EXIT;
      }
      if (char === '#') return TILE_TYPES.WALL;
      if (char === 'C') return TILE_TYPES.COVER;
      return TILE_TYPES.FLOOR;
    });
  });

  return {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    briefing: def.briefing,
    timeLimit: def.timeLimit,
    creditReward: def.creditReward,
    playerSpawn,
    exitLocation,
    layout,
    guards: def.guards || [],
    credits: def.credits || []
  };
}

export const MISSIONS = [
  // MISSION 1: Tutorial Facility
  createMission({
    id: 1,
    title: 'MISSION 01: INITIATION',
    subtitle: 'Training Facility // Sector Alpha',
    briefing: 'Enter the proving ground. Evade security vision cones, maneuver behind patrol enforcers for silent execution, and extract.',
    timeLimit: 90,
    creditReward: 150,
    asciiMap: [
      '#####################',
      '#...................#',
      '#..P................#',
      '#.....####..........#',
      '#.....#..#..........#',
      '#.....#..#...#####..#',
      '#............#...#..#',
      '#............#...#..#',
      '#...#####....#...#..#',
      '#...#...#...........#',
      '#...#...#...........#',
      '#...............E...#',
      '#...................#',
      '#####################'
    ],
    guards: [
      {
        id: 'm1_g1',
        spawn: { gx: 9, gy: 3 },
        patrol: [
          { gx: 9, gy: 3, waitTime: 1400 },
          { gx: 16, gy: 3, waitTime: 1400 }
        ],
        facing: 0
      },
      {
        id: 'm1_g2',
        spawn: { gx: 15, gy: 9 },
        patrol: [
          { gx: 15, gy: 9, waitTime: 1600 },
          { gx: 8, gy: 9, waitTime: 1600 }
        ],
        facing: Math.PI
      }
    ],
    credits: [
      { gx: 7, gy: 4, value: 50 },
      { gx: 13, gy: 6, value: 50 },
      { gx: 4, gy: 11, value: 50 }
    ]
  }),

  // MISSION 2: Intersecting Patrols
  createMission({
    id: 2,
    title: 'MISSION 02: CROSSFIRE',
    subtitle: 'Transit Nexus // Sector Beta',
    briefing: 'Multiple patrol units intersect across this transit junction. Observe their timing, use blind angles, and eliminate all targets without detection.',
    timeLimit: 120,
    creditReward: 250,
    asciiMap: [
      '######################',
      '#....................#',
      '#..P....####.........#',
      '#.......#..#....####.#',
      '#.......#..#....#..#.#',
      '#..####.........#..#.#',
      '#..#..#..............#',
      '#..#..#....####......#',
      '#..........#..#......#',
      '#....####..#..#..###.#',
      '#....#..#........#.#.#',
      '#....#..#............#',
      '#..................E.#',
      '######################'
    ],
    guards: [
      {
        id: 'm2_g1',
        spawn: { gx: 6, gy: 4 },
        patrol: [
          { gx: 6, gy: 4, waitTime: 1200 },
          { gx: 6, gy: 9, waitTime: 1200 }
        ],
        facing: Math.PI / 2
      },
      {
        id: 'm2_g2',
        spawn: { gx: 11, gy: 7 },
        patrol: [
          { gx: 11, gy: 7, waitTime: 1000 },
          { gx: 18, gy: 7, waitTime: 1000 }
        ],
        facing: 0
      },
      {
        id: 'm2_g3',
        spawn: { gx: 17, gy: 3 },
        patrol: [
          { gx: 17, gy: 3, waitTime: 1400 },
          { gx: 17, gy: 10, waitTime: 1400 }
        ],
        facing: Math.PI / 2
      }
    ],
    credits: [
      { gx: 10, gy: 2, value: 75 },
      { gx: 2, gy: 10, value: 75 },
      { gx: 13, gy: 11, value: 100 }
    ]
  }),

  // MISSION 3: The Guarded Corridor
  createMission({
    id: 3,
    title: 'MISSION 03: CORRIDOR NINE',
    subtitle: 'Research Wing // Sector Gamma',
    briefing: 'A reinforced corridor defended by enforcers. Duck into side chambers and behind security barriers to bypass long-range sweeping vision.',
    timeLimit: 140,
    creditReward: 350,
    asciiMap: [
      '######################',
      '#...####.......####..#',
      '#...#..#.......#..#..#',
      '#...#..#.......#..#..#',
      '#....................#',
      '#..P.................#',
      '#........C....C....E.#',
      '#....................#',
      '#...####.......####..#',
      '#...#..#.......#..#..#',
      '#...#..#.......#..#..#',
      '#...####.......####..#',
      '#....................#',
      '######################'
    ],
    guards: [
      {
        id: 'm3_g1',
        spawn: { gx: 7, gy: 5 },
        patrol: [
          { gx: 7, gy: 5, waitTime: 1000 },
          { gx: 12, gy: 5, waitTime: 1000 }
        ],
        facing: 0
      },
      {
        id: 'm3_g2',
        spawn: { gx: 13, gy: 7 },
        patrol: [
          { gx: 13, gy: 7, waitTime: 1200 },
          { gx: 17, gy: 7, waitTime: 1200 }
        ],
        facing: Math.PI
      },
      {
        id: 'm3_g3',
        spawn: { gx: 10, gy: 2 },
        patrol: [
          { gx: 10, gy: 2, waitTime: 1500 },
          { gx: 10, gy: 10, waitTime: 1500 }
        ],
        facing: Math.PI / 2
      }
    ],
    credits: [
      { gx: 2, gy: 2, value: 100 },
      { gx: 19, gy: 2, value: 100 },
      { gx: 10, gy: 6, value: 150 }
    ]
  }),

  // MISSION 4: The Decoy Test
  createMission({
    id: 4,
    title: 'MISSION 04: DISTRACTION PROTOCOL',
    subtitle: 'Security Bastion // Sector Delta',
    briefing: 'Enforcers guard tight choke points. Press [SPACE] or tap the Decoy icon to deploy the acoustic lure, luring guards away from their stations.',
    timeLimit: 150,
    creditReward: 500,
    asciiMap: [
      '######################',
      '#..................E.#',
      '#...######....######.#',
      '#...#....#....#....#.#',
      '#...#....#....#....#.#',
      '#........#....#......#',
      '#..####..#....#..###.#',
      '#..#..#..........#.#.#',
      '#..#..#..........#.#.#',
      '#........######......#',
      '#..P.....#....#......#',
      '#........#....#......#',
      '#....................#',
      '######################'
    ],
    guards: [
      {
        id: 'm4_g1',
        spawn: { gx: 8, gy: 5 },
        patrol: [
          { gx: 8, gy: 5, waitTime: 2000 },
          { gx: 8, gy: 9, waitTime: 2000 }
        ],
        facing: 0
      },
      {
        id: 'm4_g2',
        spawn: { gx: 14, gy: 5 },
        patrol: [
          { gx: 14, gy: 5, waitTime: 1500 },
          { gx: 14, gy: 9, waitTime: 1500 }
        ],
        facing: Math.PI
      },
      {
        id: 'm4_g3',
        spawn: { gx: 11, gy: 2 },
        patrol: [
          { gx: 11, gy: 2, waitTime: 1800 },
          { gx: 11, gy: 7, waitTime: 1800 }
        ],
        facing: Math.PI / 2
      },
      {
        id: 'm4_g4',
        spawn: { gx: 18, gy: 8 },
        patrol: [
          { gx: 18, gy: 8, waitTime: 2500 },
          { gx: 15, gy: 8, waitTime: 2500 }
        ],
        facing: Math.PI
      }
    ],
    credits: [
      { gx: 11, gy: 4, value: 150 },
      { gx: 2, gy: 2, value: 150 },
      { gx: 18, gy: 11, value: 200 }
    ]
  }),

  // MISSION 5: The Security Vault
  createMission({
    id: 5,
    title: 'MISSION 05: APEX VAULT',
    subtitle: 'Central Data Core // Sector Omega',
    briefing: 'The highest security citadel. Five elite guards secure the data mainframe. Neutralize all sentries, secure the encrypted cores, and extract.',
    timeLimit: 180,
    creditReward: 1000,
    asciiMap: [
      '########################',
      '#....................E.#',
      '#..#####...####...####.#',
      '#..#...#...#..#...#..#.#',
      '#..#...#...#..#...#..#.#',
      '#..........####........#',
      '#..####............###.#',
      '#..#..#...######...#.#.#',
      '#..#..#...#....#...#.#.#',
      '#.........#....#.......#',
      '#..#####..######..####.#',
      '#..#...#..........#..#.#',
      '#..P...#..........#..#.#',
      '#......................#',
      '########################'
    ],
    guards: [
      {
        id: 'm5_g1',
        spawn: { gx: 7, gy: 5 },
        patrol: [
          { gx: 7, gy: 5, waitTime: 1200 },
          { gx: 12, gy: 5, waitTime: 1200 }
        ],
        facing: 0
      },
      {
        id: 'm5_g2',
        spawn: { gx: 16, gy: 5 },
        patrol: [
          { gx: 16, gy: 5, waitTime: 1200 },
          { gx: 21, gy: 5, waitTime: 1200 }
        ],
        facing: Math.PI
      },
      {
        id: 'm5_g3',
        spawn: { gx: 5, gy: 9 },
        patrol: [
          { gx: 5, gy: 9, waitTime: 1400 },
          { gx: 5, gy: 3, waitTime: 1400 }
        ],
        facing: -Math.PI / 2
      },
      {
        id: 'm5_g4',
        spawn: { gx: 18, gy: 9 },
        patrol: [
          { gx: 18, gy: 9, waitTime: 1500 },
          { gx: 18, gy: 12, waitTime: 1500 }
        ],
        facing: Math.PI / 2
      },
      {
        id: 'm5_g5',
        spawn: { gx: 12, gy: 11 },
        patrol: [
          { gx: 12, gy: 11, waitTime: 1000 },
          { gx: 15, gy: 11, waitTime: 1000 }
        ],
        facing: 0
      }
    ],
    credits: [
      { gx: 12, gy: 7, value: 250 },
      { gx: 2, gy: 2, value: 200 },
      { gx: 21, gy: 12, value: 250 },
      { gx: 12, gy: 2, value: 300 }
    ]
  })
];
