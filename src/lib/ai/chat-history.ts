import type { UIMessage } from "ai";

const SESSIONS_KEY = "finance-buddy-ai-sessions";
const ACTIVE_SESSION_KEY = "finance-buddy-ai-active-session";
const MAX_SESSIONS = 50;

export type StoredAiChatSession = {
  id: string;
  title: string;
  messages: UIMessage[];
  updatedAt: number;
  createdAt: number;
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function loadChatSessions(): StoredAiChatSession[] {
  return readStorage<StoredAiChatSession[]>(SESSIONS_KEY, []);
}

export function saveChatSessions(sessions: StoredAiChatSession[]) {
  const trimmed = [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SESSIONS);
  writeStorage(SESSIONS_KEY, trimmed);
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string) {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch {
    // ignore
  }
}

export function createChatSession(): StoredAiChatSession {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    updatedAt: now,
    createdAt: now,
  };
}

export function getOrCreateActiveSession(): StoredAiChatSession {
  const sessions = loadChatSessions();
  const activeId = getActiveSessionId();
  const existing = activeId
    ? sessions.find((session) => session.id === activeId)
    : undefined;

  if (existing) {
    return existing;
  }

  const created = createChatSession();
  saveChatSessions([created, ...sessions]);
  setActiveSessionId(created.id);
  return created;
}

function getMessageText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
}

export function deriveSessionTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "New chat";

  const text = getMessageText(firstUser);
  if (!text) return "New chat";

  const singleLine = text.replace(/\s+/g, " ");
  return singleLine.length > 48 ? `${singleLine.slice(0, 48).trim()}…` : singleLine;
}

export function buildConversationContext(messages: UIMessage[]): string | null {
  if (messages.length <= 4) return null;

  const userMessages = messages
    .filter((message) => message.role === "user")
    .map(getMessageText)
    .filter(Boolean);

  if (userMessages.length <= 2) return null;

  const earlier = userMessages.slice(0, -2).slice(-6);
  if (earlier.length === 0) return null;

  const lines = earlier.map((text) => {
    const trimmed = text.replace(/\s+/g, " ");
    return `- ${trimmed.length > 100 ? `${trimmed.slice(0, 100).trim()}…` : trimmed}`;
  });

  return `Earlier in this conversation, the user asked about:\n${lines.join("\n")}`;
}

export function upsertChatSession(
  sessionId: string,
  messages: UIMessage[],
): StoredAiChatSession {
  const sessions = loadChatSessions();
  const now = Date.now();
  const existing = sessions.find((session) => session.id === sessionId);
  const title = deriveSessionTitle(messages);

  const nextSession: StoredAiChatSession = existing
    ? {
        ...existing,
        title: title === "New chat" ? existing.title : title,
        messages,
        updatedAt: now,
      }
    : {
        id: sessionId,
        title,
        messages,
        updatedAt: now,
        createdAt: now,
      };

  const withoutCurrent = sessions.filter((session) => session.id !== sessionId);
  saveChatSessions([nextSession, ...withoutCurrent]);
  setActiveSessionId(sessionId);
  return nextSession;
}
