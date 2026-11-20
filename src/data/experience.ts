// Work history, most recent first. Only confirmed facts go here.

export type Role = {
  field: 'Customer service' | 'Digital marketing' | 'Logistics' | 'Writing';
  title: string;
  company: string;
  place: string;
  dates: string;
  highlight: string; // one line for the home page card
  points: string[]; // full detail for the CV page
  onHome: boolean;
};

export const roles: Role[] = [
  {
    field: 'Logistics',
    title: 'Logistics Operator',
    company: 'CINNO Global Service',
    place: 'Poland',
    dates: 'Jul 2025 – present',
    highlight: 'Inbound quality inspections and shipment document checks at 95%+ accuracy.',
    points: [
      'Carry out inbound quality inspections, order verification and shipment documentation checks.',
      'Maintain 95%+ accuracy, reducing returns, complaints and rework.',
      'Work with cross-functional teams to resolve discrepancies.',
    ],
    onHome: true,
  },
  {
    field: 'Digital marketing',
    title: 'Social Media Intern',
    company: 'Awsahub',
    place: 'Remote',
    dates: 'Feb 2026 – Aug 2026',
    highlight: 'One to six short-form pieces every week, with 100% delivered on time.',
    points: [
      'Produced 1 to 6 short-form content pieces weekly for an international education consultancy.',
      'Created content for Middle East and global student audiences.',
      'Kept a 100% on-time submission rate while working with senior colleagues across time zones.',
    ],
    onHome: true,
  },
  {
    field: 'Customer service',
    title: 'Crew Trainer',
    company: "McDonald's",
    place: 'Poland',
    dates: 'Jan 2024 – Jul 2025',
    highlight: 'Counter and drive-thru service, and trained 20+ new colleagues.',
    points: [
      'Served customers in person at the counter and at the drive-thru.',
      'Resolved customer problems with orders on the spot.',
      'Trained and mentored 20+ new employees.',
    ],
    onHome: true,
  },
  {
    field: 'Digital marketing',
    title: 'Digital Marketing Intern',
    company: 'Wow Momo Foods',
    place: 'India',
    dates: 'Feb 2022 – Jan 2023',
    highlight: '50+ posts and videos with Curly Tales, seen by 100K+ viewers.',
    points: [
      'Main contact for the Curly Tales influencer partnership: negotiated the budget and coordinated 50+ posts and videos reaching 100K+ viewers.',
      'Planned and managed paid campaigns on Meta and Instagram for 6+ months, plus Google ads for product launches and store openings.',
      'Ran the Women’s Day and Durga Puja campaigns, including PR packages and a press release.',
      'Managed new-store opening events across tier 1 and tier 2 cities.',
      'Answered customer complaints through the CRM and followed up personally.',
    ],
    onHome: true,
  },
  {
    field: 'Writing',
    title: 'Creative Writing Intern',
    company: 'Swami Vivekananda Foundation',
    place: 'India',
    dates: 'Sep 2020 – Aug 2021',
    highlight: 'Researched current affairs and wrote concise blog content.',
    points: [
      'Researched current affairs and wrote concise blog content from national media sources.',
      'Ran short interviews with local communities; edited and curated articles.',
    ],
    onHome: false,
  },
];

export const education = [
  {
    degree: 'Master’s in Media and Communication Management',
    school: 'Uniwersytet Wrocławski, Poland',
    dates: 'Oct 2023 – Jul 2025',
    note: 'GPA 4.76 / 5.00',
  },
  {
    degree: 'Bachelor’s in Media Sciences',
    school: 'The Heritage Academy, Kolkata, India',
    dates: 'Aug 2019 – Jul 2022',
    note: 'GPA 8.57 / 10.00',
  },
];

export const languages = [
  { name: 'English', level: 'C1, fluent' },
  { name: 'Polish', level: 'A2, basic' },
];

export const skills = [
  {
    group: 'Marketing',
    items: ['Meta and Instagram ads', 'Google ads', 'LinkedIn ads', 'SEO fundamentals', 'Instagram analytics', 'Influencer partnerships'],
  },
  {
    group: 'Content',
    items: ['Short-form video', 'Canva', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'WordPress'],
  },
  {
    group: 'Operations',
    items: ['Quality inspection', 'Shipment documentation', 'CRM customer replies', 'Excel (VLOOKUP, pivot tables)', 'Microsoft Office'],
  },
];
