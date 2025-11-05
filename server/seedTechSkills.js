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
    questionTemplate: 'What data analysis tools and techniques have you worked with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is a dataset?',
        correctAnswer: 'A collection of data',
        options: ['A graph', 'A database', 'A collection of data', 'A table'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is data visualization?',
        correctAnswer: 'Representing data in graphical format',
        options: ['Storing data', 'Representing data in graphical format', 'Deleting data', 'Encrypting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is the difference between SQL and NoSQL databases?',
        correctAnswer: 'SQL is relational, NoSQL is non-relational',
        options: ['SQL is relational, NoSQL is non-relational', 'SQL is faster', 'NoSQL is older', 'No difference'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a pivot table used for?',
        correctAnswer: 'Summarizing and analyzing data',
        options: ['Storing data', 'Summarizing and analyzing data', 'Deleting data', 'Encrypting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is the purpose of ETL in data analysis?',
        correctAnswer: 'Extract, Transform, Load data',
        options: ['Extract, Transform, Load data', 'Edit, Test, Launch', 'Encode, Transmit, Log', 'Encrypt, Transfer, Lock'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Full-stack Developers',
    description: 'End-to-end web development, frontend and backend technologies, and full application lifecycle',
    icon: '💻',
    questionGenerator: 'technical',
    questionTemplate: 'What full-stack technologies and frameworks are you experienced with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What does HTML stand for?',
        correctAnswer: 'HyperText Markup Language',
        options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Markup'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is the purpose of CSS?',
        correctAnswer: 'Styling web pages',
        options: ['Creating databases', 'Styling web pages', 'Writing server code', 'Managing files'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is REST API?',
        correctAnswer: 'Representational State Transfer',
        options: ['React State Transfer', 'Representational State Transfer', 'Remote Server Transfer', 'Request State Transfer'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is the difference between GET and POST requests?',
        correctAnswer: 'GET retrieves data, POST sends data',
        options: ['GET retrieves data, POST sends data', 'GET is faster', 'POST is older', 'No difference'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is the purpose of microservices architecture?',
        correctAnswer: 'Building applications as independent services',
        options: ['Building applications as independent services', 'Making apps smaller', 'Reducing costs', 'Simplifying code'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'UI/UX Engineers',
    description: 'User interface design, user experience optimization, prototyping, and design systems',
    icon: '🎨',
    questionGenerator: 'experience',
    questionTemplate: 'What design tools and UX methodologies are you familiar with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What does UX stand for?',
        correctAnswer: 'User Experience',
        options: ['User Experience', 'User Extension', 'User Exchange', 'User Example'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a wireframe?',
        correctAnswer: 'A visual guide for layout',
        options: ['A type of font', 'A visual guide for layout', 'A color scheme', 'A logo'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is the purpose of user personas?',
        correctAnswer: 'Understanding target users',
        options: ['Creating designs', 'Understanding target users', 'Writing code', 'Managing projects'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is accessibility in design?',
        correctAnswer: 'Making designs usable for all users',
        options: ['Making designs usable for all users', 'Making designs faster', 'Making designs cheaper', 'Making designs prettier'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is design thinking?',
        correctAnswer: 'A problem-solving methodology',
        options: ['A problem-solving methodology', 'A design tool', 'A color theory', 'A font style'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Frontend Engineers',
    description: 'Client-side development, modern JavaScript frameworks, responsive design, and user interfaces',
    icon: '⚛️',
    questionGenerator: 'technical',
    questionTemplate: 'What frontend technologies and frameworks do you work with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is JavaScript?',
        correctAnswer: 'A programming language for web development',
        options: ['A database', 'A programming language for web development', 'A design tool', 'A server'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is React?',
        correctAnswer: 'A JavaScript library for building UIs',
        options: ['A database', 'A JavaScript library for building UIs', 'A server framework', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is the Virtual DOM?',
        correctAnswer: 'A representation of the DOM in memory',
        options: ['A database', 'A representation of the DOM in memory', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is state management?',
        correctAnswer: 'Managing application data and UI state',
        options: ['Managing servers', 'Managing application data and UI state', 'Managing files', 'Managing users'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is server-side rendering (SSR)?',
        correctAnswer: 'Rendering pages on the server',
        options: ['Rendering pages on the server', 'Rendering on client', 'Rendering in database', 'Rendering in cache'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Backend Engineers',
    description: 'Server-side development, APIs, databases, system architecture, and performance optimization',
    icon: '🔧',
    questionGenerator: 'technical',
    questionTemplate: 'What backend technologies, databases, and APIs have you built?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is a server?',
        correctAnswer: 'A computer that provides services to clients',
        options: ['A database', 'A computer that provides services to clients', 'A design tool', 'A browser'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is an API?',
        correctAnswer: 'Application Programming Interface',
        options: ['Application Programming Interface', 'Application Program Interface', 'Advanced Program Interface', 'Application Process Interface'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is database normalization?',
        correctAnswer: 'Organizing data to reduce redundancy',
        options: ['Organizing data to reduce redundancy', 'Making databases faster', 'Deleting old data', 'Backing up data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is caching?',
        correctAnswer: 'Storing frequently accessed data',
        options: ['Deleting data', 'Storing frequently accessed data', 'Encrypting data', 'Backing up data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is load balancing?',
        correctAnswer: 'Distributing traffic across multiple servers',
        options: ['Distributing traffic across multiple servers', 'Making servers faster', 'Reducing costs', 'Simplifying code'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Cybersecurity',
    description: 'Security practices, threat analysis, ethical hacking, penetration testing, and protecting digital assets',
    icon: '🔒',
    questionGenerator: 'technical',
    questionTemplate: 'What security certifications or experience do you have in cybersecurity?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is a firewall?',
        correctAnswer: 'A security barrier for networks',
        options: ['A database', 'A security barrier for networks', 'A design tool', 'A server'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is encryption?',
        correctAnswer: 'Converting data into a secure format',
        options: ['Deleting data', 'Converting data into a secure format', 'Copying data', 'Moving data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a SQL injection attack?',
        correctAnswer: 'Injecting malicious SQL code',
        options: ['Injecting malicious SQL code', 'Attacking databases', 'Breaking servers', 'Hacking networks'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is two-factor authentication?',
        correctAnswer: 'Using two methods to verify identity',
        options: ['Using two methods to verify identity', 'Using two passwords', 'Using two accounts', 'Using two devices'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is penetration testing?',
        correctAnswer: 'Testing security by simulating attacks',
        options: ['Testing security by simulating attacks', 'Breaking into systems', 'Fixing bugs', 'Writing code'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Network Analysts',
    description: 'Network infrastructure, protocols, troubleshooting, security, and network architecture',
    icon: '🌐',
    questionGenerator: 'technical',
    questionTemplate: 'What network technologies and protocols are you familiar with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What does IP stand for?',
        correctAnswer: 'Internet Protocol',
        options: ['Internet Protocol', 'Internal Protocol', 'Internet Process', 'Internal Process'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a router?',
        correctAnswer: 'A device that routes network traffic',
        options: ['A database', 'A device that routes network traffic', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is TCP/IP?',
        correctAnswer: 'Transmission Control Protocol/Internet Protocol',
        options: ['Transmission Control Protocol/Internet Protocol', 'Transfer Control Protocol', 'Transport Control Protocol', 'Test Control Protocol'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is DNS?',
        correctAnswer: 'Domain Name System',
        options: ['Domain Name System', 'Domain Network System', 'Data Name System', 'Data Network System'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a VPN?',
        correctAnswer: 'Virtual Private Network',
        options: ['Virtual Private Network', 'Virtual Public Network', 'Valid Private Network', 'Valid Public Network'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'DevOps Engineers',
    description: 'CI/CD pipelines, cloud infrastructure, containerization, automation, and infrastructure as code',
    icon: '🚀',
    questionGenerator: 'technical',
    questionTemplate: 'What DevOps tools and cloud platforms have you worked with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is CI/CD?',
        correctAnswer: 'Continuous Integration/Continuous Deployment',
        options: ['Continuous Integration/Continuous Deployment', 'Code Integration/Code Deployment', 'Central Integration/Central Deployment', 'Cloud Integration/Cloud Deployment'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is Docker?',
        correctAnswer: 'A containerization platform',
        options: ['A database', 'A containerization platform', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Kubernetes?',
        correctAnswer: 'Container orchestration platform',
        options: ['Container orchestration platform', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Infrastructure as Code?',
        correctAnswer: 'Managing infrastructure through code',
        options: ['Managing infrastructure through code', 'Writing infrastructure code', 'Testing infrastructure', 'Deleting infrastructure'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a blue-green deployment?',
        correctAnswer: 'A deployment strategy with two environments',
        options: ['A deployment strategy with two environments', 'A color scheme', 'A design pattern', 'A database type'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Machine Learning Engineers',
    description: 'AI algorithms, neural networks, model training, predictive analytics, and ML pipelines',
    icon: '🤖',
    questionGenerator: 'technical',
    questionTemplate: 'What machine learning frameworks and algorithms have you used?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is machine learning?',
        correctAnswer: 'Training computers to learn from data',
        options: ['Programming computers', 'Training computers to learn from data', 'Designing interfaces', 'Managing servers'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is supervised learning?',
        correctAnswer: 'Learning from labeled data',
        options: ['Learning from labeled data', 'Learning without data', 'Learning from code', 'Learning from designs'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a neural network?',
        correctAnswer: 'A computing system inspired by brains',
        options: ['A database', 'A computing system inspired by brains', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is overfitting?',
        correctAnswer: 'Model performs well on training but poorly on new data',
        options: ['Model performs well on training but poorly on new data', 'Model is too fast', 'Model is too slow', 'Model is too large'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is gradient descent?',
        correctAnswer: 'An optimization algorithm',
        options: ['An optimization algorithm', 'A database query', 'A design pattern', 'A server protocol'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Mobile Developers',
    description: 'iOS, Android, React Native, Flutter, and cross-platform mobile application development',
    icon: '📱',
    questionGenerator: 'technical',
    questionTemplate: 'What mobile development platforms and frameworks are you proficient in?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is React Native?',
        correctAnswer: 'A framework for mobile app development',
        options: ['A database', 'A framework for mobile app development', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is an APK?',
        correctAnswer: 'Android application package',
        options: ['Android application package', 'Apple application package', 'Application program kit', 'Application process kit'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Flutter?',
        correctAnswer: 'A UI toolkit for cross-platform apps',
        options: ['A database', 'A UI toolkit for cross-platform apps', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is native app development?',
        correctAnswer: 'Developing apps for specific platforms',
        options: ['Developing apps for specific platforms', 'Developing web apps', 'Developing desktop apps', 'Developing cloud apps'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is code push?',
        correctAnswer: 'Updating apps without app store approval',
        options: ['Updating apps without app store approval', 'Pushing code to repository', 'Deploying to servers', 'Testing code'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Cloud Architects',
    description: 'AWS, Azure, GCP, serverless architecture, cloud-native solutions, and distributed systems',
    icon: '☁️',
    questionGenerator: 'technical',
    questionTemplate: 'What cloud platforms and services have you architected solutions with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is cloud computing?',
        correctAnswer: 'Delivering computing services over the internet',
        options: ['Storing data locally', 'Delivering computing services over the internet', 'Using physical servers', 'Managing databases'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is AWS?',
        correctAnswer: 'Amazon Web Services',
        options: ['Amazon Web Services', 'Apple Web Services', 'Application Web Services', 'Advanced Web Services'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is serverless computing?',
        correctAnswer: 'Running code without managing servers',
        options: ['Running code without managing servers', 'Running without internet', 'Running without databases', 'Running without code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is auto-scaling?',
        correctAnswer: 'Automatically adjusting resources based on demand',
        options: ['Automatically adjusting resources based on demand', 'Scaling manually', 'Scaling once', 'Not scaling'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is infrastructure as a service (IaaS)?',
        correctAnswer: 'Cloud computing service providing virtualized infrastructure',
        options: ['Cloud computing service providing virtualized infrastructure', 'A database service', 'A design service', 'A network service'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Blockchain Developers',
    description: 'Smart contracts, decentralized applications, cryptocurrencies, Web3, and blockchain protocols',
    icon: '⛓️',
    questionGenerator: 'technical',
    questionTemplate: 'What blockchain technologies and smart contract platforms have you developed on?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is blockchain?',
        correctAnswer: 'A distributed ledger technology',
        options: ['A database', 'A distributed ledger technology', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a smart contract?',
        correctAnswer: 'Self-executing contract with code',
        options: ['A database', 'Self-executing contract with code', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Ethereum?',
        correctAnswer: 'A blockchain platform for smart contracts',
        options: ['A database', 'A blockchain platform for smart contracts', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Web3?',
        correctAnswer: 'Decentralized web using blockchain',
        options: ['A database', 'Decentralized web using blockchain', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is consensus mechanism?',
        correctAnswer: 'How blockchain nodes agree on transactions',
        options: ['How blockchain nodes agree on transactions', 'How to store data', 'How to design', 'How to code'],
        questionType: 'multiple-choice'
      }
    ]
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
      const { questions, ...skillFields } = skillData;
      const skill = await TechSkill.create({
        ...skillFields,
        questions: questions || [],
        difficultyLevels: ['Beginner', 'Intermediate', 'Professional'],
        createdBy: adminUser._id
      });
      createdSkills.push(skill);
      console.log(`✅ Created tech skill: ${skill.name} with ${questions?.length || 0} questions`);
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

