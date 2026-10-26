import { routes } from "@/app/router/paths";

// Publish only contact information confirmed by the store through GET /store.
export const storeContact = {
  path: routes.institutional("contato"),
};
