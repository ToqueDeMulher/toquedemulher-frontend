export type AnnouncementMessage = {
  id: string;
  text: string;
  destination: string;
  active: boolean;
  sort_order: number;
};

export type PublicAnnouncementMessage = Omit<AnnouncementMessage, "active">;

export type AnnouncementRevision = {
  id: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
  published_at: string | null;
  messages: AnnouncementMessage[];
};

export type PublicAnnouncements = {
  source: "fallback" | "published";
  messages: PublicAnnouncementMessage[];
};

