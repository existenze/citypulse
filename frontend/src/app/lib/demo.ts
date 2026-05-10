/**
 * Frontend-only demo mode for Vercel/class presentations when the API is unavailable.
 * Enable with NEXT_PUBLIC_DEMO_MODE=true (build-time env on Vercel).
 */

import type {
  CommentRead,
  EventCategoryOptionsResponse,
  EventCreateBody,
  EventImageUploadResponse,
  EventUpdateBody,
  EventWithInteractionsRead,
  TokenPair,
  TrendEntryRead,
  UserRead,
} from "./contracts";
import { setAccessToken, setRefreshToken, setSession } from "./storage";

export function isDemoMode(): boolean {
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage.getItem("citypulse_demo") === "1") {
        return true;
      }
    } catch {
      /* private mode */
    }
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

const DEMO_ACCESS = "demo-access-token";
const DEMO_REFRESH = "demo-refresh-token";

export const DEMO_USER: UserRead = {
  id: 1,
  name: "Alex Rivera",
  email: "demo@citypulse.local",
  city_location: "san diego",
  created_at: new Date().toISOString(),
};

/** Session profile when user signs up / logs in via the modal (demo-only, not persisted to any server). */
let demoProfileUser: UserRead | null = null;

function currentDemoUser(): UserRead {
  return demoProfileUser ?? DEMO_USER;
}

function titleCaseLocalPart(email: string): string {
  const local = email.split("@")[0] || "explorer";
  if (!local.length) {
    return "Explorer";
  }
  return local.charAt(0).toUpperCase() + local.slice(1);
}

let nextEventId = 100;
let nextCommentId = 500;

function iso(daysFromNow: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seedEvents(): EventWithInteractionsRead[] {
  const base = (
    row: Omit<EventWithInteractionsRead, "likes_count" | "comments_count" | "attendance_count" | "comments">,
    interactions: Partial<
      Pick<EventWithInteractionsRead, "likes_count" | "comments_count" | "attendance_count" | "comments">
    >,
  ): EventWithInteractionsRead => ({
    ...row,
    likes_count: interactions.likes_count ?? 0,
    comments_count: interactions.comments_count ?? 0,
    attendance_count: interactions.attendance_count ?? 0,
    comments: interactions.comments ?? [],
  });

  return [
    base(
      {
        id: 1,
        region_id: 0,
        user_id: 2,
        user_name: "Gaslamp Quarter",
        title: "Sunset Jazz at the Waterfront",
        category: "Music",
        content:
          "Outdoor jazz overlooking the bay. Bring a blanket — demo data only.",
        source_id: null,
        source_name: null,
        organizer_name: "Harbor Arts Collective",
        origin_type: "partner",
        external_id: null,
        external_url: null,
        canonical_url: null,
        event_image_url:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        event_start_at: iso(3, 19),
        event_end_at: iso(3, 22),
        timezone: "America/Los_Angeles",
        venue_name: "Waterfront Park",
        venue_address: "1600 Pacific Hwy",
        neighborhood: "Gaslamp",
        city: "San Diego",
        price_info: "Free",
        promo_summary: null,
        tags_json: null,
        source_confidence: null,
        last_seen_at: null,
        created_at: iso(-1),
      },
      {
        likes_count: 24,
        comments_count: 3,
        attendance_count: 120,
        comments: [
          {
            id: 1,
            user_id: 3,
            event_id: 1,
            user_name: "Jordan",
            text: "Can't wait — sounds amazing!",
            created_at: iso(-1),
          },
        ],
      },
    ),
    base(
      {
        id: 2,
        region_id: 0,
        user_id: 1,
        user_name: DEMO_USER.name,
        title: "North Park Night Market",
        category: "Food & Drink",
        content:
          "Street food, craft beer, and local makers. Demo preview — no backend.",
        source_id: null,
        source_name: null,
        organizer_name: DEMO_USER.name,
        origin_type: "user",
        external_id: null,
        external_url: null,
        canonical_url: null,
        event_image_url:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        event_start_at: iso(7, 17),
        event_end_at: iso(7, 23),
        timezone: "America/Los_Angeles",
        venue_name: "University Ave Corridor",
        venue_address: "North Park",
        neighborhood: "North Park",
        city: "San Diego",
        price_info: "$5 entry",
        promo_summary: null,
        tags_json: null,
        source_confidence: null,
        last_seen_at: null,
        created_at: iso(-2),
      },
      { likes_count: 8, attendance_count: 45, comments_count: 1, comments: [] },
    ),
    base(
      {
        id: 3,
        region_id: 0,
        user_id: 4,
        user_name: "PB Shore Club",
        title: "Pacific Beach Sunset Sessions",
        category: "Nightlife (Bars & Clubs)",
        content: "DJ sets and tacos on the deck. Synthetic demo content.",
        source_id: null,
        source_name: null,
        organizer_name: "PB Shore Club",
        origin_type: "ingested",
        external_id: null,
        external_url: null,
        canonical_url: null,
        event_image_url:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        event_start_at: iso(1, 21),
        event_end_at: iso(2, 2),
        timezone: "America/Los_Angeles",
        venue_name: "Pacific Beach",
        venue_address: "Mission Blvd",
        neighborhood: "Pacific Beach",
        city: "San Diego",
        price_info: "21+",
        promo_summary: null,
        tags_json: null,
        source_confidence: null,
        last_seen_at: null,
        created_at: iso(0),
      },
      { likes_count: 41, attendance_count: 200, comments_count: 0, comments: [] },
    ),
    base(
      {
        id: 4,
        region_id: 0,
        user_id: 1,
        user_name: DEMO_USER.name,
        title: "Little Italy Art Walk (demo)",
        category: "Arts & Culture",
        content: "Stroll galleries and outdoor installations.",
        source_id: null,
        source_name: null,
        organizer_name: DEMO_USER.name,
        origin_type: "user",
        external_id: null,
        external_url: null,
        canonical_url: null,
        event_image_url:
          "https://images.unsplash.com/photo-1460661419201-fd233e352db6?w=800",
        event_start_at: iso(14, 16),
        event_end_at: iso(14, 21),
        timezone: "America/Los_Angeles",
        venue_name: "India Street",
        venue_address: "Little Italy",
        neighborhood: "Little Italy",
        city: "San Diego",
        price_info: "Free",
        promo_summary: null,
        tags_json: null,
        source_confidence: null,
        last_seen_at: null,
        created_at: iso(-3),
      },
      { likes_count: 3, attendance_count: 12, comments_count: 0, comments: [] },
    ),
  ];
}

let demoEvents = seedEvents();

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function normalizePath(pathWithQuery: string): { pathname: string; search: URLSearchParams } {
  const [rawPath, rawQuery = ""] = pathWithQuery.split("?");
  const pathname = rawPath.replace(/\/+$/, "") || rawPath || "/";
  return { pathname, search: new URLSearchParams(rawQuery) };
}

function parseJsonBody(body: BodyInit | null | undefined): unknown {
  if (!body || typeof body !== "string") {
    return null;
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function tokens(): TokenPair {
  return {
    access_token: DEMO_ACCESS,
    refresh_token: DEMO_REFRESH,
    token_type: "bearer",
  };
}

function filterEvents(search: URLSearchParams): EventWithInteractionsRead[] {
  let rows = clone(demoEvents);
  const cat = search.get("category");
  const hood = search.get("neighborhood");
  if (cat && cat !== "All Categories") {
    rows = rows.filter((e) => e.category === cat);
  }
  if (hood) {
    rows = rows.filter((e) => (e.neighborhood ?? "").toLowerCase() === hood.toLowerCase());
  }
  return rows;
}

function trendsFromEvents(): TrendEntryRead[] {
  const rows = clone(demoEvents);
  rows.sort((a, b) => (b.attendance_count ?? 0) - (a.attendance_count ?? 0));
  return rows.slice(0, 5).map((e, i) => ({
    event_id: e.id,
    rank: i + 1,
    title: e.title,
    attendance_count: e.attendance_count,
    comments_count: e.comments_count,
    likes_count: e.likes_count,
    updated_at: e.created_at,
  }));
}

interface DemoRequestInit {
  method?: string;
  body?: BodyInit | null;
  auth?: boolean;
}

export async function demoApiRequest<T>(pathWithQuery: string, options: DemoRequestInit): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const { pathname, search } = normalizePath(pathWithQuery);
  const bodyJson = parseJsonBody(
    typeof options.body === "string" ? options.body : null,
  );

  if (method === "POST" && pathname === "/api/auth/register") {
    const p = bodyJson as {
      name?: string;
      email?: string;
      password?: string;
      city_location?: string;
    } | null;
    const email = (p?.email ?? "guest@demo.local").trim().toLowerCase();
    const name = (p?.name ?? "Guest").trim() || "Guest";
    demoProfileUser = {
      id: 1,
      name,
      email,
      city_location: "san diego",
      created_at: new Date().toISOString(),
    };
    return tokens() as T;
  }

  if (method === "POST" && pathname === "/api/auth/login") {
    const p = bodyJson as { email?: string; password?: string } | null;
    const email = (p?.email ?? "").trim().toLowerCase();
    const safeEmail = email || "explorer@demo.local";
    // Sign-up flow calls login right after register — keep the registered name.
    if (demoProfileUser && demoProfileUser.email === safeEmail) {
      return tokens() as T;
    }
    demoProfileUser = {
      id: 1,
      name: titleCaseLocalPart(safeEmail),
      email: safeEmail,
      city_location: "san diego",
      created_at: new Date().toISOString(),
    };
    return tokens() as T;
  }

  if (method === "POST" && (pathname === "/api/auth/refresh" || pathname === "/api/auth/refresh-token")) {
    return tokens() as T;
  }
  if (method === "GET" && pathname === "/api/auth/me") {
    return clone(currentDemoUser()) as T;
  }
  if (method === "POST" && pathname === "/api/auth/forgot-password") {
    return { success: true } as unknown as T;
  }
  if (method === "POST" && pathname === "/api/auth/reset-password") {
    return { success: true } as unknown as T;
  }

  if (method === "GET" && pathname.startsWith("/api/interactions")) {
    return clone(filterEvents(search)) as T;
  }

  if (method === "GET" && pathname.startsWith("/api/trends")) {
    return clone(trendsFromEvents()) as T;
  }

  if (method === "GET" && pathname === "/api/events/categories") {
    const res: EventCategoryOptionsResponse = {
      options: [
        "All Categories",
        "Music",
        "Food & Drink",
        "Entertainment",
        "Arts & Culture",
        "Nightlife (Bars & Clubs)",
        "Technology",
      ],
    };
    return res as T;
  }

  const eventIdMatch = pathname.match(/^\/api\/events\/(\d+)$/);
  if (method === "GET" && eventIdMatch) {
    const id = Number(eventIdMatch[1]);
    const ev = demoEvents.find((e) => e.id === id);
    if (!ev) {
      throw new Error(`Event ${id} not found`);
    }
    return clone(ev) as unknown as T;
  }

  if (method === "POST" && pathname === "/api/events/upload-image") {
    const res: EventImageUploadResponse = {
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
    };
    return res as T;
  }

  if (method === "POST" && (pathname === "/api/events" || pathname === "/api/events/")) {
    const payload = bodyJson as EventCreateBody | null;
    if (!payload?.title || !payload?.category) {
      throw new Error("Missing title or category");
    }
    nextEventId += 1;
    const ev: EventWithInteractionsRead = {
      id: nextEventId,
      region_id: 0,
      user_id: payload.user_id,
      user_name: DEMO_USER.name,
      title: payload.title,
      category: payload.category,
      content: payload.content ?? "",
      source_id: null,
      source_name: null,
      organizer_name: payload.organizer_name ?? DEMO_USER.name,
      origin_type: "user",
      external_id: null,
      external_url: null,
      canonical_url: null,
      event_image_url: payload.event_image_url ?? null,
      event_start_at: payload.event_start_at ?? null,
      event_end_at: payload.event_end_at ?? null,
      timezone: payload.timezone ?? "America/Los_Angeles",
      venue_name: payload.venue_name ?? null,
      venue_address: payload.venue_address ?? null,
      neighborhood: payload.neighborhood ?? null,
      city: "San Diego",
      price_info: payload.price_info ?? null,
      promo_summary: null,
      tags_json: null,
      source_confidence: null,
      last_seen_at: null,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      attendance_count: 0,
      comments: [],
    };
    demoEvents = [...demoEvents, ev];
    return clone(ev) as unknown as T;
  }

  if (method === "DELETE" && eventIdMatch) {
    const id = Number(eventIdMatch[1]);
    demoEvents = demoEvents.filter((e) => e.id !== id);
    return { success: true } as unknown as T;
  }

  if (method === "PUT" && eventIdMatch) {
    const id = Number(eventIdMatch[1]);
    const payload = bodyJson as EventUpdateBody | null;
    const idx = demoEvents.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`Event ${id} not found`);
    }
    const cur = demoEvents[idx];
    const merged = { ...cur, ...payload } as EventWithInteractionsRead;
    demoEvents = [...demoEvents.slice(0, idx), merged, ...demoEvents.slice(idx + 1)];
    return { success: true } as unknown as T;
  }

  const attendingMatch = pathname.match(/^\/api\/interactions\/events\/(\d+)\/attending$/);
  if (attendingMatch && (method === "PUT" || method === "DELETE")) {
    const eventId = Number(attendingMatch[1]);
    const idx = demoEvents.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      const cur = demoEvents[idx];
      const delta = method === "PUT" ? 1 : -1;
      const nextCount = Math.max(0, (cur.attendance_count ?? 0) + delta);
      const updated = { ...cur, attendance_count: nextCount };
      demoEvents = [...demoEvents.slice(0, idx), updated, ...demoEvents.slice(idx + 1)];
    }
    return { success: true } as unknown as T;
  }

  const likesMatch = pathname.match(/^\/api\/interactions\/events\/(\d+)\/likes$/);
  if (likesMatch && (method === "PUT" || method === "DELETE")) {
    const eventId = Number(likesMatch[1]);
    const idx = demoEvents.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      const cur = demoEvents[idx];
      const delta = method === "PUT" ? 1 : -1;
      const updated = {
        ...cur,
        likes_count: Math.max(0, (cur.likes_count ?? 0) + delta),
      };
      demoEvents = [...demoEvents.slice(0, idx), updated, ...demoEvents.slice(idx + 1)];
    }
    return { success: true } as unknown as T;
  }

  const commentsMatch = pathname.match(/^\/api\/interactions\/events\/(\d+)\/comments$/);
  if (commentsMatch && method === "PUT") {
    const eventId = Number(commentsMatch[1]);
    const payload = bodyJson as { text?: string } | null;
    const text = payload?.text?.trim();
    if (!text) {
      throw new Error("Comment text required");
    }
    nextCommentId += 1;
    const comment: CommentRead = {
      id: nextCommentId,
      user_id: DEMO_USER.id,
      event_id: eventId,
      user_name: DEMO_USER.name,
      text,
      created_at: new Date().toISOString(),
    };
    const idx = demoEvents.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      const cur = demoEvents[idx];
      const comments = [...(cur.comments ?? []), comment];
      const updated = {
        ...cur,
        comments,
        comments_count: comments.length,
      };
      demoEvents = [...demoEvents.slice(0, idx), updated, ...demoEvents.slice(idx + 1)];
    }
    return clone(comment) as T;
  }

  const commentDelMatch = pathname.match(
    /^\/api\/interactions\/events\/(\d+)\/comments\/(\d+)$/,
  );
  if (commentDelMatch && method === "DELETE") {
    const eventId = Number(commentDelMatch[1]);
    const commentId = Number(commentDelMatch[2]);
    const idx = demoEvents.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      const cur = demoEvents[idx];
      const comments = (cur.comments ?? []).filter((c) => c.id !== commentId);
      const updated = {
        ...cur,
        comments,
        comments_count: comments.length,
      };
      demoEvents = [...demoEvents.slice(0, idx), updated, ...demoEvents.slice(idx + 1)];
    }
    return { success: true } as unknown as T;
  }

  throw new Error(`Demo mode: unhandled ${method} ${pathname}`);
}

export function bootstrapDemoSession(): void {
  demoProfileUser = null;
  const user = clone(DEMO_USER);
  setSession({
    accessToken: DEMO_ACCESS,
    refreshToken: DEMO_REFRESH,
    currentUser: user,
  });
}

/** Called when demo session refreshes tokens (same-origin refresh route). */
export function demoRefreshAccessToken(): string | null {
  setAccessToken(DEMO_ACCESS);
  setRefreshToken(DEMO_REFRESH);
  return DEMO_ACCESS;
}
