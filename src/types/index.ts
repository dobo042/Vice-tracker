export interface Vice {
  id: string;
  name: string;
  description?: string;
  cooldownMinutes: number;
  lastLoggedAt?: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  viceName: string;
  viceDescription?: string;
  loggedAt: string;
}
