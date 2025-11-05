require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const TechSkill = require('./models/TechSkill');
const Room = require('./models/Room');
const User = require('./models/User');

const techSkills = [
  {
    name: 'Data Analysts',
    description: 'Data analysis, visualization, statistical modeling, and business intelligence',
    icon: '📊',
    questionGenerator: 'experience',
    questionTemplate: 'What data analysis tools and techniques have you worked with?'
  },
  {
    name: 'Full-stack Developers',
    description: 'End-to-end web development, frontend and backend technologies, and full application lifecycle',
    icon: '💻',
    questionGenerator: 'technical',
    questionTemplate: 'What full-stack technologies and frameworks are you experienced with?'
  },
  {
    name: 'UI/UX Engineers',
    description: 'User interface design, user experience optimization, prototyping, and design systems',
    icon: '🎨',
    questionGenerator: 'experience',
    questionTemplate: 'What design tools and UX methodologies are you familiar with?'
  },
  {
    name: 'Frontend Engineers',
    description: 'Client-side development, modern JavaScript frameworks, responsive design, and user interfaces',
    icon: '⚛️',
    questionGenerator: 'technical',
    questionTemplate: 'What frontend technologies and frameworks do you work with?'
  },
  {
    name: 'Backend Engineers',
    description: 'Server-side development, APIs, databases, system architecture, and performance optimization',
    icon: '🔧',
    questionGenerator: 'technical',
    questionTemplate: 'What backend technologies, databases, and APIs have you built?'
  },
  {
    name: 'Cybersecurity',
    description: 'Security practices, threat analysis, ethical hacking, penetration testing, and protecting digital assets',
    icon: '🔒',
    questionGenerator: 'technical',
    questionTemplate: 'What security certifications or experience do you have in cybersecurity?'
  },
  {
    name: 'Network Analysts',
    description: 'Network infrastructure, protocols, troubleshooting, security, and network architecture',
    icon: '🌐',
    questionGenerator: 'technical',
    questionTemplate: 'What network technologies and protocols are you familiar with?'
  },
  {
    name: 'DevOps Engineers',
    description: 'CI/CD pipelines, cloud infrastructure, containerization, automation, and infrastructure as code',
    icon: '🚀',
    questionGenerator: 'technical',
    questionTemplate: 'What DevOps tools and cloud platforms have you worked with?'
  },
  {
    name: 'Machine Learning Engineers',
    description: 'AI algorithms, neural networks, model training, predictive analytics, and ML pipelines',
    icon: '🤖',
    questionGenerator: 'technical',
    questionTemplate: 'What machine learning frameworks and algorithms have you used?'
  },
  {
    name: 'Mobile Developers',
    description: 'iOS, Android, React Native, Flutter, and cross-platform mobile application development',
    icon: '📱',
    questionGenerator: 'technical',
    questionTemplate: 'What mobile development platforms and frameworks are you proficient in?'
  },
  {
    name: 'Cloud Architects',
    description: 'AWS, Azure, GCP, serverless architecture, cloud-native solutions, and distributed systems',
    icon: '☁️',
    questionGenerator: 'technical',
    questionTemplate: 'What cloud platforms and services have you architected solutions with?'
  },
  {
    name: 'Blockchain Developers',
    description: 'Smart contracts, decentralized applications, cryptocurrencies, Web3, and blockchain protocols',
    icon: '⛓️',
    questionGenerator: 'technical',
    questionTemplate: 'What blockchain technologies and smart contract platforms have you developed on?'
  }
];

const seedTechSkills = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get admin user or create one
    const User = require('./models/User');
    let adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      // Create a default admin if none exists
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        isAdmin: true
      });
      console.log('✅ Created admin user');
    }

    // Clear existing tech skills
    await TechSkill.deleteMany({});
    console.log('✅ Cleared existing tech skills');

    // Create tech skills
    const createdSkills = [];
    for (const skillData of techSkills) {
      const skill = await TechSkill.create({
        ...skillData,
        createdBy: adminUser._id
      });
      createdSkills.push(skill);
      console.log(`✅ Created tech skill: ${skill.name}`);
    }

    // Create rooms for each tech skill
    for (const skill of createdSkills) {
      // Check if room already exists
      const existingRoom = await Room.findOne({ techSkillId: skill._id });
      
      if (!existingRoom) {
        const room = await Room.create({
          name: skill.name,
          description: skill.description,
          createdBy: adminUser._id,
          members: [adminUser._id],
          isPrivate: false,
          techSkillId: skill._id,
          requiresApproval: true,
          admins: [adminUser._id]
        });
        console.log(`✅ Created room for ${skill.name}`);
      }
    }

    console.log(`\n✅ Seeded ${createdSkills.length} tech skills successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tech skills:', error);
    process.exit(1);
  }
};

seedTechSkills();

