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
  // The letter on the Contact page is delivered by Web3Forms (free).
  // Paste the access key they email you here. While it is empty, the
  // visitor's own email app opens with the letter filled in instead.
  formKey: '',
  // While true, every page asks search engines not to list it.
  // Set to false when the content is final.
  draft: true,
};

export const nav = [
  { href: '/my-story/', label: 'My Story' },
  { href: '/about/', label: 'About Me' },
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
