/**
 * contentService.js
 * -----------------------------------------------------------------------------
 * Static marketing content for the public site — facilities, experiences,
 * testimonials, gallery and hotel details.
 *
 * Likely to be served from a CMS or a settings collection rather than a core
 * entity, so it is kept apart from the operational services.
 */

import { USE_MOCK_API, clone, delay, request } from "./apiClient";
import {
  HOTEL,
  experiences,
  facilities,
  galleryImages,
  highlights,
  testimonials,
} from "./mock/hotel";

export { HOTEL };

export async function getFacilities() {
  if (!USE_MOCK_API) return request("/content/facilities");

  await delay(400);
  return clone(facilities);
}

export async function getExperiences() {
  if (!USE_MOCK_API) return request("/content/experiences");

  await delay(400);
  return clone(experiences);
}

export async function getTestimonials() {
  if (!USE_MOCK_API) return request("/content/testimonials");

  await delay(400);
  return clone(testimonials);
}

/** Gallery images, optionally narrowed to one category. */
export async function getGallery(category) {
  if (!USE_MOCK_API) return request("/content/gallery", { params: { category } });

  await delay(400);
  return clone(
    category && category !== "All"
      ? galleryImages.filter((image) => image.category === category)
      : galleryImages,
  );
}

/** Distinct gallery categories, with "All" first, for the filter row. */
export function getGalleryCategories() {
  return ["All", ...new Set(galleryImages.map((image) => image.category))];
}

export async function getHighlights() {
  if (!USE_MOCK_API) return request("/content/highlights");

  await delay(300);
  return clone(highlights);
}

/**
 * Submits the contact form.
 * @param {{name, email, subject, message}} payload
 */
export async function submitContactMessage(payload) {
  if (!USE_MOCK_API) return request("/content/contact", { method: "POST", body: payload });

  await delay(900);
  return { received: true, reference: `MSG-${Date.now().toString().slice(-6)}` };
}
