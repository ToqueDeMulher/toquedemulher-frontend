import { apiRequest } from "@/shared/api/api-client";
import type {
  AnnouncementMessage,
  AnnouncementRevision,
  PublicAnnouncements,
} from "@/features/store-content/types/announcement";

export const FALLBACK_ANNOUNCEMENT: PublicAnnouncements = {
  source: "fallback",
  messages: [
    {
      id: "fallback-delivery",
      text: "Calcule a entrega pelo seu CEP",
      destination: "/carrinho",
      sort_order: 1,
    },
  ],
};

export const getPublicAnnouncements = () =>
  apiRequest<PublicAnnouncements>("/announcements");

export const getAnnouncementDraft = () =>
  apiRequest<AnnouncementRevision>("/announcements/admin/draft");

export const saveAnnouncementDraft = (messages: AnnouncementMessage[]) =>
  apiRequest<AnnouncementRevision>("/announcements/admin/draft", {
    method: "PUT",
    body: JSON.stringify({
      messages: messages.map(({ text, destination, active }, index) => ({
        text: text.trim(),
        destination: destination.trim(),
        active,
        sort_order: index + 1,
      })),
    }),
  });

export const discardAnnouncementDraft = () =>
  apiRequest<AnnouncementRevision>("/announcements/admin/discard", {
    method: "POST",
  });

export const publishAnnouncementDraft = () =>
  apiRequest<AnnouncementRevision>("/announcements/admin/publish", {
    method: "POST",
  });

