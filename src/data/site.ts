// Personal details and links. Edit this file to update contact info site-wide.
// The email and profile URLs below are placeholders carried over from the design.

export const site = {
  name: 'Mohamed Sahal',
  role: 'AI Engineer & Data Scientist',
  tagline: 'AI Engineer • Data Scientist • AI Product Builder',
  availability: 'Available for AI / ML Opportunities',

  email: 'mohamed.sahal@example.com',
  linkedin: 'https://www.linkedin.com/',
  github: 'https://github.com/',

  photo: `${import.meta.env.BASE_URL}profile-photo.png`,

  /**
   * Résumé / CV. Put the PDF in /public and set e.g. `${import.meta.env.BASE_URL}Mohamed-Sahal-CV.pdf`.
   * "Download CV" buttons appear in the hero and contact sections once this is set.
   */
  resume: '',

  // Decorative cursor ring that follows the pointer. Off for a cleaner, more professional feel.
  customCursor: false,
};

export const mailto = `mailto:${site.email}`;
