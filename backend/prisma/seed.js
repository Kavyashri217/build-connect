const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const professionals = [
  {
    name: 'Rajesh Kumar',
    specialization: 'Structural Engineer',
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 45,
    hourlyRate: 50,
    location: 'Bengaluru',
    avatar: '👨‍💼',
    bio: 'Structural engineer focused on high-rise residential and commercial buildings. Experienced with RCC and steel design, seismic analysis and retrofitting of older structures.',
    skills: 'RCC Design,Steel Structures,Seismic Analysis,ETABS,Retrofitting',
    projects: [
      { title: '14-storey residential tower', description: 'Full structural design and site supervision for a 120-unit apartment complex.', year: 2024 },
      { title: 'Warehouse retrofit', description: 'Strengthened a 30-year-old warehouse roof to carry rooftop solar panels.', year: 2022 },
    ],
  },
  {
    name: 'Priya Sharma',
    specialization: 'Architect',
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 52,
    hourlyRate: 60,
    location: 'Mumbai',
    avatar: '👩‍💼',
    bio: 'Architect specialising in sustainable homes and compact urban living. I take projects from first sketch through approvals and interior detailing.',
    skills: 'Residential Design,Sustainable Architecture,AutoCAD,Revit,Interior Planning',
    projects: [
      { title: 'Net-zero villa', description: 'Passive-cooling villa design with rainwater harvesting and solar integration.', year: 2023 },
      { title: 'Co-working space', description: 'Converted an old textile mill floor into a 200-seat co-working space.', year: 2021 },
    ],
  },
  {
    name: 'Amit Singh',
    specialization: 'Civil Engineer',
    experienceYears: 4,
    rating: 4.5,
    reviewCount: 28,
    hourlyRate: 40,
    location: 'Pune',
    avatar: '👨‍💼',
    bio: 'Civil engineer working on independent houses and small commercial buildings. I handle estimation, BOQs, contractor coordination and quality checks.',
    skills: 'Estimation,BOQ,Site Supervision,Quality Control,MS Project',
    projects: [
      { title: 'G+2 independent house', description: 'Estimation, contractor selection and supervision through handover.', year: 2024 },
    ],
  },
  {
    name: 'Anjali Desai',
    specialization: 'Site Engineer',
    experienceYears: 3,
    rating: 4.3,
    reviewCount: 18,
    hourlyRate: 35,
    location: 'Ahmedabad',
    avatar: '👩‍💼',
    bio: 'Site engineer who keeps projects on schedule. Day-to-day site management, labour planning, material tracking and safety compliance.',
    skills: 'Site Management,Safety Compliance,Material Planning,Surveying',
    projects: [
      { title: 'School block extension', description: 'Managed daily site operations for a 12-classroom extension.', year: 2023 },
    ],
  },
  {
    name: 'Vikram Patel',
    specialization: 'Structural Engineer',
    experienceYears: 7,
    rating: 4.7,
    reviewCount: 41,
    hourlyRate: 55,
    location: 'Hyderabad',
    avatar: '👨‍💼',
    bio: 'Structural consultant for industrial sheds, bridges and pre-engineered buildings. I also do structural audits and stability certificates.',
    skills: 'PEB Design,Bridge Design,Structural Audit,STAAD Pro,Foundation Design',
    projects: [
      { title: 'Pedestrian bridge', description: 'Design of a 40 m steel foot-over bridge across a state highway.', year: 2022 },
      { title: 'Industrial shed', description: 'Pre-engineered building for a 5,000 m² manufacturing unit.', year: 2024 },
    ],
  },
  {
    name: 'Neha Gupta',
    specialization: 'Architect',
    experienceYears: 5,
    rating: 4.6,
    reviewCount: 35,
    hourlyRate: 50,
    location: 'Delhi',
    avatar: '👩‍💼',
    bio: 'Architect focused on renovations and heritage-sensitive redesigns. Good at getting the most out of tight plots and old buildings.',
    skills: 'Renovation,Heritage Conservation,SketchUp,3D Visualisation,Approvals',
    projects: [
      { title: 'Haveli restoration', description: 'Restored a 1920s courtyard house as a boutique homestay.', year: 2023 },
    ],
  },
  {
    name: 'Karthik Rao',
    specialization: 'Civil Engineer',
    experienceYears: 10,
    rating: 4.8,
    reviewCount: 63,
    hourlyRate: 65,
    location: 'Bengaluru',
    avatar: '👨‍💼',
    bio: 'Infrastructure engineer with a decade of experience in roads, drainage and layout development for residential plots.',
    skills: 'Road Design,Drainage,Layout Planning,Civil 3D,Project Management',
    projects: [
      { title: 'Residential layout', description: 'Roads, storm-water drains and utilities for a 150-plot layout.', year: 2021 },
    ],
  },
  {
    name: 'Sneha Iyer',
    specialization: 'Site Engineer',
    experienceYears: 2,
    rating: 4.1,
    reviewCount: 9,
    hourlyRate: 30,
    location: 'Chennai',
    avatar: '👩‍💼',
    bio: 'Early-career site engineer, detail-oriented about measurements, daily reports and keeping clients updated on progress.',
    skills: 'Site Supervision,Daily Reporting,Measurement Books,AutoCAD',
    projects: [],
  },
];

async function main() {
  await prisma.enquiry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.professional.deleteMany();

  for (const { projects, ...data } of professionals) {
    await prisma.professional.create({
      data: { ...data, projects: { create: projects } },
    });
  }
  console.log(`Seeded ${professionals.length} professionals.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
