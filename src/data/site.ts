// Site-wide facts. Every page reads from this one file.

export const site = {
  name: 'Sharonya Kundu',
  location: 'Wrocław, PL',
  timeZone: 'Europe/Warsaw',
  email: 'sharonya.kundu@outlook.com',
  // Empty values are hidden on the site until they are filled in.
  linkedin: '',
  instagram: '',
  cvFile: '', // e.g. '/Sharonya-Kundu-CV.pdf' once the PDF is in public/
  // While true, every page asks search engines not to list it.
  // Set to false when the content is final.
  draft: true,
};

export const nav = [
  { href: '/about/', label: 'About' },
  { href: '/work/', label: 'Work' },
  { href: '/cv/', label: 'CV' },
  { href: '/contact/', label: 'Contact' },
];

// Still to write: the two lines Google shows for the home page.
// title: 50–60 characters. description: 140–160 characters.
export const seo = {
  title: '',
  description: '',
};
