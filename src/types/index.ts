export interface Vice {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  cooldownMinutes: number;
  lastLoggedAt?: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  viceName: string;
  viceEmoji?: string;
  viceDescription?: string;
  loggedAt: string;
}
