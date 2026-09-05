export const posts = [];

export const categories = ['All', 'Stories', 'Destinations', 'Campground Guides & Reviews', 'Gear & Mods', 'Full-Time RV', 'Reviews', 'Tips & Tricks'];

export function normalizeCategory(category) {
  return category === 'Favorite Campgrounds' ? 'Campground Guides & Reviews' : category;
}

export const affiliateProducts = [];

export const videos = [];

export const destinations = [];

export const sampleComments = [];
