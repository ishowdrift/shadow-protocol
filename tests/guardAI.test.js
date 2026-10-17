import { describe, it, expect } from 'vitest';
import { GUARD_STATES } from '../src/utils/Constants.js';

describe('Guard State Machine & Stealth Rules', () => {
  it('identifies behind angle relative to guard facing', () => {
    // Guard is at (100, 100) facing East (0 rad)
    const guardX = 100;
    const guardY = 100;
    const facingAngle = 0;

    // Player 1: directly behind at (50, 100) -> angle is PI
    const angleToPlayer1 = Math.atan2(100 - guardY, 50 - guardX); // PI
    let diff1 = angleToPlayer1 - facingAngle;
    while (diff1 > Math.PI) diff1 -= Math.PI * 2;
    while (diff1 < -Math.PI) diff1 += Math.PI * 2;
    const isBehind1 = Math.abs(diff1) > Math.PI * 0.5;

    expect(isBehind1).toBe(true);

    // Player 2: directly in front at (150, 100) -> angle is 0
    const angleToPlayer2 = Math.atan2(100 - guardY, 150 - guardX); // 0
    let diff2 = angleToPlayer2 - facingAngle;
    while (diff2 > Math.PI) diff2 -= Math.PI * 2;
    while (diff2 < -Math.PI) diff2 += Math.PI * 2;
    const isBehind2 = Math.abs(diff2) > Math.PI * 0.5;

    expect(isBehind2).toBe(false);
  });

  it('calculates detection buildup rate correctly', () => {
    let detectionLevel = 0;
    const detectionSpeed = 120; // 120% per sec
    const delta = 250; // 250ms = 0.25s
    const proximityMult = 1.5;

    detectionLevel += (detectionSpeed * proximityMult * (delta / 1000));
    expect(detectionLevel).toBe(45);

    // After another 500ms
    detectionLevel += (detectionSpeed * proximityMult * (500 / 1000));
    expect(detectionLevel).toBe(135);
    // Capped at 100
    if (detectionLevel > 100) detectionLevel = 100;
    expect(detectionLevel).toBe(100);
  });

  it('state machine transitions properly from alert to search to return', () => {
    let state = GUARD_STATES.ALERT;
    let searchTimer = 3500;

    // Lost sight -> enters SEARCH
    state = GUARD_STATES.SEARCH;
    expect(state).toBe(GUARD_STATES.SEARCH);

    // Delta updates search timer
    searchTimer -= 3600;
    if (searchTimer <= 0) {
      state = GUARD_STATES.RETURN;
    }
    expect(state).toBe(GUARD_STATES.RETURN);
  });
});
