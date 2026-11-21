// Reels shown on the phone on the Work page ("My Work").
// link:   the Instagram address of the reel, e.g. https://www.instagram.com/reel/ABC123xyz/
// video:  optional. A copy of the reel as an .mp4 file in public/reels/
//         (e.g. '/reels/campaign.mp4'). With it, the reel plays by itself,
//         silently, as soon as the phone unlocks. Without it, Instagram's own
//         player is shown, which needs a tap to start.
// poster: optional. A still picture from the reel in public/reels/.
// A reel with no link and no video is shown as "coming soon".

export type Reel = { title: string; link: string; video?: string; poster?: string };

export const reels: Reel[] = [
  { title: 'Coming soon', link: '' },
  { title: 'Coming soon', link: '' },
  { title: 'Coming soon', link: '' },
];

// Certificates hung as framed pictures. `image` is the file name in
// public/certificates/ (a small "-thumb" copy is shown in the frame).
export type Frame = 'oak' | 'gilt' | 'black' | 'walnut' | 'white';
export type Certificate = {
  title: string;
  issuer: string;
  date: string;
  hours?: string;
  image: string;
  width: number; // size of the thumbnail, so the page never jumps while loading
  height: number;
  frame: Frame;
};

export const certificates: Certificate[] = [
  {
    title: 'Mastering SEO: How to Develop a Superior SEO Strategy',
    issuer: 'LinkedIn Learning',
    date: 'Sep 2025',
    image: 'mastering-seo-strategy-linkedin-learning',
    width: 520,
    height: 402,
    frame: 'gilt',
  },
  {
    title: 'Adobe Creative Cloud 2022 Ultimate Course',
    issuer: 'Udemy',
    date: 'Mar 2022',
    hours: '27.5 hours',
    image: 'adobe-creative-cloud-udemy',
    width: 520,
    height: 387,
    frame: 'black',
  },
  {
    title: 'Become a Data Analyst',
    issuer: 'LinkedIn Learning',
    date: 'Aug 2021',
    hours: '23.5 hours',
    image: 'become-a-data-analyst-linkedin-learning',
    width: 520,
    height: 402,
    frame: 'oak',
  },
  {
    title: 'Become a Graphic Designer',
    issuer: 'LinkedIn Learning',
    date: 'Aug 2021',
    hours: '26.5 hours',
    image: 'become-a-graphic-designer-linkedin-learning',
    width: 520,
    height: 402,
    frame: 'white',
  },
  {
    title: 'Master In-Demand Professional Soft Skills',
    issuer: 'LinkedIn Learning',
    date: 'Aug 2021',
    hours: '9 hours',
    image: 'professional-soft-skills-linkedin-learning',
    width: 520,
    height: 402,
    frame: 'walnut',
  },
  {
    title: 'Digital Marketing Masterclass: 23 Courses in 1',
    issuer: 'Udemy',
    date: 'Jul 2021',
    hours: '34.5 hours',
    image: 'digital-marketing-masterclass-udemy',
    width: 520,
    height: 387,
    frame: 'gilt',
  },
  {
    title: 'Photography Masterclass: A Complete Guide to Photography',
    issuer: 'Udemy',
    date: 'Jul 2021',
    hours: '24 hours',
    image: 'photography-masterclass-udemy',
    width: 520,
    height: 387,
    frame: 'oak',
  },
];

export const testimonial = {
  quote:
    'Her overall performance during her time at AWSAHUB was outstanding, and her contributions were sincerely appreciated.',
  name: 'Nayera Altolemy',
  role: 'Chief Executive Officer, AWSAHUB',
};
