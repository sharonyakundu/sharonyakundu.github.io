// Reels shown as cassette tapes on the Work page.
// `reel` is the code from the Instagram address:
// instagram.com/reel/ABC123xyz/  ->  reel: 'ABC123xyz'
// A tape with an empty `reel` is shown as "coming soon".

export type Tape = { title: string; client: string; year: string; reel: string };

export const tapes: Tape[] = [
  { title: 'Reel title one', client: 'Client', year: '2026', reel: '' },
  { title: 'Reel title two', client: 'Client', year: '2026', reel: '' },
  { title: 'Reel title three', client: 'Client', year: '2026', reel: '' },
];

export type Certificate = { title: string; issuer: string; date: string; hours?: string };

export const certificates: Certificate[] = [
  { title: 'Mastering SEO: How to Develop a Superior SEO Strategy', issuer: 'LinkedIn Learning', date: 'Sep 2025' },
  { title: 'Adobe Creative Cloud 2022 Ultimate Course', issuer: 'Udemy', date: 'Mar 2022', hours: '27.5 hours' },
  { title: 'Become a Data Analyst', issuer: 'LinkedIn Learning', date: 'Aug 2021', hours: '23.5 hours' },
  { title: 'Become a Graphic Designer', issuer: 'LinkedIn Learning', date: 'Aug 2021', hours: '26.5 hours' },
  { title: 'Master In-Demand Professional Soft Skills', issuer: 'LinkedIn Learning', date: 'Aug 2021', hours: '9 hours' },
  { title: 'Digital Marketing Masterclass: 23 Courses in 1', issuer: 'Udemy', date: 'Jul 2021', hours: '34.5 hours' },
  { title: 'Photography Masterclass: A Complete Guide to Photography', issuer: 'Udemy', date: 'Jul 2021', hours: '24 hours' },
];

export const testimonial = {
  quote:
    'Her overall performance during her time at AWSAHUB was outstanding, and her contributions were sincerely appreciated.',
  name: 'Nayera Altolemy',
  role: 'Chief Executive Officer, AWSAHUB',
};
