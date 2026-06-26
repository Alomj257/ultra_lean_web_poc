export const SUCCESS_MAX_TRAIL_MARKS = 2;
export const VAULT_CODE = "7429";
export const KEY_SIGNATURE = ["◆", "●", "▲"];
export const PRIVATE_MOVE_TIMEOUT = 7;
export const BANK_ALERT_TIMEOUT = 30;
export const VAULT_CODE_DISPLAY = 45;

export const GATES = [
  {
    id: 1,
    title: "Gate 1 — Enter Bank",
    leadMove: {
      prompt: `A host catches your eye.\n\n"Need help?"`,
      a: "Ask directions",
      b: "Act booked",
      goodChoice: "a",
    },
    partnerMove: {
      prompt: "A camera turns your way.",
      a: "Freeze in blind spot",
      b: "Slip before it tracks",
      goodChoice: "a",
    },
    bankAlert: {
      label: "BANK ALERT",
      scenario: "Security gate chirps behind you.",
      leadOption: "Blend with crowd.",
      partnerOption: "Use chaos, advance.",
      goodChoice: "my_move",
    },
    result: {
      title: "Gate 1 Complete",
      main: "You slip inside.",
      lines: ["The entrance clears.", "The staff floor opens ahead."],
      note: "Entry cover held.",
    },
  },
  {
    id: 2,
    title: "Gate 2 — Reach Manager's Office",
    leadMove: {
      prompt: "The manager steps out.",
      a: "Ask for help",
      b: "Flatter him",
      goodChoice: "a",
    },
    partnerMove: {
      prompt: "The side door swings open.",
      a: "Wait for cleaner opening",
      b: "Follow before it shuts",
      goodChoice: "a",
    },
    bankAlert: {
      label: "BANK ALERT",
      scenario: "The manager turns back.",
      leadOption: "Stall him, clear path.",
      partnerOption: "Beat him to the office.",
      goodChoice: "my_move",
    },
    result: {
      title: "Gate 2 Complete",
      main: "Office reached.",
      lines: ["You clear the staff floor.", "The key is inside."],
      note: "Manager grew suspicious.",
    },
  },
  {
    id: 3,
    title: "Gate 3 — Get Smart Key",
    leadMove: {
      prompt: "A desk drawer slides open.",
      a: "Read ledger",
      b: "Search fast",
      goodChoice: "a",
    },
    partnerMove: {
      prompt: "The key box starts blinking.",
      a: "Match the blink",
      b: "Pull now",
      goodChoice: "a",
    },
    bankAlert: {
      label: "FINAL BANK ALERT",
      scenario: "Manager's badge pings outside.",
      leadOption: "Reset key tray.",
      partnerOption: "Pocket key, leave tray open.",
      goodChoice: "my_move",
    },
    result: {
      title: "Gate 3 Complete",
      main: "Smart key secured.",
      lines: ["The office goes quiet.", "The vault terminal waits ahead."],
      note: null,
      showKeySignature: true,
    },
  },
] as const;