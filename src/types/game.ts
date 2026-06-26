export type Role = "lead" | "partner";

export type GameStep =
  | "lobby"
  | "mission_brief"
  | "gate_1_private"
  | "gate_1_bank_alert"
  | "gate_1_result"
  | "gate_2_private"
  | "gate_2_bank_alert"
  | "gate_2_result"
  | "gate_3_private"
  | "gate_3_bank_alert"
  | "gate_3_result"
  | "complete";

export type FinalOutcome = "success" | "near_unlock" | null;

export interface GameSession {
  crewCode: string;
  player1Connected: boolean;
  player2Connected: boolean;
  currentStep: GameStep;
  totalTrailMarks: number;
  keySignature: string[];
  finalOutcome: FinalOutcome;
  gates: Record<string, string | number>;
  createdAt?: unknown;
  updatedAt?: unknown;
}