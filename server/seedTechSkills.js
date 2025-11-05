require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const TechSkill = require('./models/TechSkill');
const Room = require('./models/Room');
const User = require('./models/User');

const techSkills = [
  {
    name: 'Software Engineering',
    description: 'Build scalable applications, learn best practices, and collaborate on software projects',
    icon: '💻',
    questionGenerator: 'technical',
    questionTemplate: 'What programming languages and frameworks are you most experienced with?'
  },
  {
    name: 'Cybersecurity',
    description: 'Security practices, threat analysis, ethical hacking, and protecting digital assets',
    icon: '🔒',
    questionGenerator: 'technical',
    questionTemplate: 'What security certifications or experience do you have in cybersecurity?'
  },
  {
    name: 'Data Analysis',
    description: 'Data science, analytics, visualization, and deriving insights from data',
    icon: '📊',
    questionGenerator: 'experience',
    questionTemplate: 'What data analysis tools and techniques have you worked with?'
  },
  {
    name: 'UI/UX Engineering',
    description: 'User interface design, user experience optimization, and creating intuitive designs',
    icon: '🎨',
    questionGenerator: 'experience',
    questionTemplate: 'What design tools and UX methodologies are you familiar with?'
  },
  {
    name: 'DevOps',
    description: 'CI/CD pipelines, cloud infrastructure, containerization, and automation',
    icon: '🚀',
    questionGenerator: 'technical',
    questionTemplate: 'What DevOps tools and cloud platforms have you worked with?'
  },
  {
    name: 'Machine Learning',
    description: 'AI algorithms, neural networks, model training, and predictive analytics',
    icon: '🤖',
    questionGenerator: 'technical',
    questionTemplate: 'What machine learning frameworks and algorithms have you used?'
  },
  {
    name: 'Mobile Development',
    description: 'iOS, Android, React Native, Flutter, and cross-platform mobile apps',
    icon: '📱',
    questionGenerator: 'technical',
    questionTemplate: 'What mobile development platforms and frameworks are you proficient in?'
  },
  {
    name: 'Web Development',
    description: 'Frontend, backend, full-stack development, and modern web technologies',
    icon: '🌐',
    questionGenerator: 'technical',
    questionTemplate: 'What web technologies and frameworks do you work with?'
  },
  {
    name: 'Cloud Computing',
    description: 'AWS, Azure, GCP, serverless architecture, and cloud-native solutions',
    icon: '☁️',
    questionGenerator: 'technical',
    questionTemplate: 'What cloud platforms and services have you worked with?'
  },
  {
    name: 'Blockchain Development',
    description: 'Smart contracts, decentralized applications, cryptocurrencies, and Web3',
    icon: '⛓️',
    questionGenerator: 'technical',
    questionTemplate: 'What blockchain technologies and smart contract platforms have you explored?'
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

