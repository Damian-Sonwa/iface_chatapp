require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');
const PrivateChat = require('./models/PrivateChat');
const TechSkill = require('./models/TechSkill');
const Classroom = require('./models/Classroom');
const ClassSession = require('./models/ClassSession');
const ClassMaterial = require('./models/ClassMaterial');
const UserSkillProfile = require('./models/UserSkillProfile');
const Violation = require('./models/Violation');
const AdminActionLog = require('./models/AdminActionLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const resolveDbName = () => {
  if (process.env.DB_NAME && process.env.DB_NAME.trim()) {
    return process.env.DB_NAME.trim();
  }

  const withoutParams = MONGO_URI.split('?')[0];
  const parts = withoutParams.split('/');
  const candidate = parts[parts.length - 1];

  if (candidate && !candidate.includes('@') && candidate !== '') {
    if (candidate.toLowerCase() === 'charturway001') {
      return 'chaturway001';
    }
    return candidate;
  }

  return 'chaturway001';
};

const DB_NAME = resolveDbName();

const isLocalMongo = MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1');
const isAtlasMongo = MONGO_URI.includes('mongodb.net');

if (!isLocalMongo && !isAtlasMongo) {
  console.error('❌ MONGO_URI must point to localhost or an Atlas cluster.');
  process.exit(1);
}

if (!isLocalMongo) {
  const confirmation = (process.env.CONFIRM_SEED || '').toLowerCase();
  if (!['true', 'yes', '1'].includes(confirmation)) {
    console.error('❌ Refusing to seed a remote database. Set CONFIRM_SEED=true to continue.');
    process.exit(1);
  }
}

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const toSortedObjectIds = (ids) => {
  return ids
    .map((id) => id.toString())
    .sort()
    .map((id) => new mongoose.Types.ObjectId(id));
};

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Message.deleteMany({}),
    PrivateChat.deleteMany({}),
    TechSkill.deleteMany({}),
    Classroom.deleteMany({}),
    ClassSession.deleteMany({}),
    ClassMaterial.deleteMany({}),
    UserSkillProfile.deleteMany({}),
    Violation.deleteMany({}),
    AdminActionLog.deleteMany({})
  ]);
};

const createUsers = async () => {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  const users = await User.insertMany([
    {
      username: 'amelia.admin',
      email: 'amelia.admin@chaturway001.dev',
      password: passwordHash,
      phoneNumber: '+15550000001',
      status: 'online',
      bio: 'Community owner and platform administrator.',
      isAdmin: true,
      role: 'admin',
      vibe: 'Focused',
      theme: 'sunset',
      autoVibe: true,
      preferredLanguage: 'en',
      hasOnboarded: true,
      onboardingCompletedAt: now,
      skills: ['Cybersecurity', 'Full Stack Development'],
      skillLevel: 'Professional',
      profileCompletion: 100,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1)
    },
    {
      username: 'isaac.instructor',
      email: 'isaac.instructor@chaturway001.dev',
      password: passwordHash,
      phoneNumber: '+15550000002',
      status: 'online',
      bio: 'Full-stack instructor and curriculum designer.',
      role: 'instructor',
      hasOnboarded: true,
      onboardingCompletedAt: now,
      skills: ['Full Stack Development'],
      skillLevel: 'Professional',
      profileCompletion: 92,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(2)
    },
    {
      username: 'nina.moderator',
      email: 'nina.moderator@chaturway001.dev',
      password: passwordHash,
      phoneNumber: '+15550000003',
      status: 'away',
      bio: 'Cybersecurity enthusiast learning incident response.',
      role: 'user',
      hasOnboarded: true,
      onboardingCompletedAt: daysAgo(3),
      skills: ['Cybersecurity'],
      skillLevel: 'Intermediate',
      profileCompletion: 78,
      isSuspended: true,
      suspendedUntil: daysAgo(-2),
      suspensionReason: 'Automatic suspension after repeated violations.',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1)
    },
    {
      username: 'maya.learner',
      email: 'maya.learner@chaturway001.dev',
      password: passwordHash,
      phoneNumber: '+15550000004',
      status: 'online',
      bio: 'Data analyst exploring machine learning fundamentals.',
      role: 'user',
      hasOnboarded: true,
      onboardingCompletedAt: daysAgo(5),
      skills: ['Data Analysis'],
      skillLevel: 'Intermediate',
      profileCompletion: 66,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1)
    },
    {
      username: 'liam.student',
      email: 'liam.student@chaturway001.dev',
      password: passwordHash,
      phoneNumber: '+15550000005',
      status: 'offline',
      bio: 'New to the platform and ready to learn.',
      role: 'user',
      hasOnboarded: false,
      skills: [],
      skillLevel: 'Beginner',
      profileCompletion: 20,
      isBanned: true,
      banReason: 'Repeated spam attempts detected by moderation.',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2)
    }
  ]);

  return users;
};

const createTechSkills = async (admin, instructor) => {
  const skillDefinitions = [
    {
      name: 'Cybersecurity',
      description: 'Protect systems by learning threat modeling, incident response, and secure configurations.',
      icon: '🔐',
      questionGenerator: 'technical',
      questionTemplate: 'Describe a recent security challenge and how you mitigated it.',
      difficultyLevels: ['Beginner', 'Intermediate', 'Professional'],
      questions: [
        {
          level: 'Beginner',
          questionText: 'What does MFA stand for?',
          correctAnswer: 'Multi-factor authentication',
          options: ['Master file access', 'Multi-factor authentication', 'Managed firewall agent', 'Malware forensic analysis'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Intermediate',
          questionText: 'Which protocol secures data in transit on the web?',
          correctAnswer: 'TLS',
          options: ['SMTP', 'FTP', 'TLS', 'SNMP'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Professional',
          questionText: 'Outline the steps in an incident response playbook for ransomware.',
          correctAnswer: 'Varies',
          options: [],
          questionType: 'text'
        }
      ],
      isActive: true,
      createdBy: admin._id
    },
    {
      name: 'Full Stack Development',
      description: 'Build resilient applications with modern frontend and backend stacks.',
      icon: '💻',
      questionGenerator: 'technical',
      questionTemplate: 'Which technologies do you use across the stack?',
      difficultyLevels: ['Beginner', 'Intermediate', 'Professional'],
      questions: [
        {
          level: 'Beginner',
          questionText: 'Which language runs natively in web browsers?',
          correctAnswer: 'JavaScript',
          options: ['Python', 'Go', 'Rust', 'JavaScript'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Intermediate',
          questionText: 'What does REST stand for?',
          correctAnswer: 'Representational State Transfer',
          options: ['Rapid Execution Service Transactions', 'Representational State Transfer', 'Remote System Transport', 'Resource State Tree'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Professional',
          questionText: 'Explain how you would scale a Node.js API to millions of daily requests.',
          correctAnswer: 'Varies',
          options: [],
          questionType: 'text'
        }
      ],
      isActive: true,
      createdBy: instructor._id
    },
    {
      name: 'Data Analysis',
      description: 'Translate raw information into insights using statistics, SQL, and Python.',
      icon: '📊',
      questionGenerator: 'experience',
      questionTemplate: 'Describe a data project you are proud of.',
      difficultyLevels: ['Beginner', 'Intermediate', 'Professional'],
      questions: [
        {
          level: 'Beginner',
          questionText: 'Which library is commonly used for data analysis in Python?',
          correctAnswer: 'Pandas',
          options: ['Requests', 'Flask', 'Pandas', 'BeautifulSoup'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Intermediate',
          questionText: 'What does SQL GROUP BY do?',
          correctAnswer: 'Aggregates rows sharing a property',
          options: ['Filters rows', 'Deletes rows', 'Aggregates rows sharing a property', 'Sorts rows'],
          questionType: 'multiple-choice'
        },
        {
          level: 'Professional',
          questionText: 'Share your approach for designing an A/B test with limited traffic.',
          correctAnswer: 'Varies',
          options: [],
          questionType: 'text'
        }
      ],
      isActive: true,
      createdBy: instructor._id
    }
  ];

  const skills = await TechSkill.insertMany(skillDefinitions);
  const skillMap = Object.fromEntries(skills.map((skill) => [skill.name, skill]));
  return skillMap;
};

const createRoomsAndClassrooms = async (users, skillMap) => {
  const [admin, instructor, suspendedUser, dataLearner] = users;

  const welcomeRoom = await Room.create({
    name: 'Tech Beginners Lounge',
    description: 'Introduce yourself and explore the community guidelines.',
    createdBy: admin._id,
    members: users.map((u) => u._id),
    isPrivate: false,
    roomType: 'general-info',
    requiresApproval: false
  });

  const skillRooms = [];
  const classrooms = [];
  const classroomRooms = [];
  const classSessions = [];
  const classMaterials = [];

  for (const skillName of Object.keys(skillMap)) {
    const skill = skillMap[skillName];

    const mainRoom = await Room.create({
      name: `${skillName} Guild`,
      description: `Collaborate with peers focused on ${skillName.toLowerCase()}.`,
      createdBy: admin._id,
      members: users.filter((u) => u.skills.includes(skillName) || u.role === 'admin').map((u) => u._id),
      isPrivate: false,
      admins: [admin._id],
      techSkillId: skill._id,
      roomType: 'main',
      requiresApproval: skillName === 'Cybersecurity'
    });

    skillRooms.push(mainRoom);

    const classroomRoom = await Room.create({
      name: `${skillName} Classroom`,
      description: `Live sessions, labs, and resources for ${skillName}.`,
      createdBy: instructor._id,
      members: toSortedObjectIds([admin._id, instructor._id, dataLearner._id]),
      isPrivate: false,
      admins: [instructor._id],
      techSkillId: skill._id,
      roomType: 'classroom',
      requiresApproval: false
    });

    classroomRooms.push(classroomRoom);

    const classroom = await Classroom.create({
      name: `${skillName} Accelerator`,
      description: `Curated path to advance your ${skillName.toLowerCase()} skill set.`,
      techSkillId: skill._id,
      createdBy: instructor._id,
      instructors: [instructor._id],
      subscribers: [
        { user: admin._id, subscriptionStatus: 'active' },
        { user: dataLearner._id, subscriptionStatus: 'active' }
      ],
      roomId: classroomRoom._id,
      price: skillName === 'Full Stack Development' ? 49 : 0,
      currency: 'USD',
      features: {
        liveSessions: true,
        assignments: skillName !== 'Data Analysis',
        resources: true,
        certificates: skillName === 'Cybersecurity'
      }
    });

    await Room.findByIdAndUpdate(classroomRoom._id, { classroomId: classroom._id });
    classrooms.push(classroom);

    const upcomingSession = await ClassSession.create({
      classroom: classroom._id,
      title: `${skillName} Live Workshop`,
      description: `Interactive session covering core ${skillName.toLowerCase()} practices.`,
      instructor: instructor._id,
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      meetingLink: `https://chaturway001.live/${skillName.toLowerCase().replace(/\s+/g, '-')}`,
      meetingPlatform: 'Zoom',
      sessionType: 'live',
      tags: ['live', skillName]
    });

    const recordedSession = await ClassSession.create({
      classroom: classroom._id,
      title: `${skillName} On-Demand Lab`,
      description: 'Self-paced walkthrough with downloadable resources.',
      instructor: instructor._id,
      startTime: daysAgo(6),
      endTime: daysAgo(6),
      meetingPlatform: 'Other',
      sessionType: 'recorded',
      recordingLink: `https://chaturway001.resources/${skillName.toLowerCase().replace(/\s+/g, '-')}-lab`,
      tags: ['recorded', 'lab'],
      discussion: [
        {
          user: dataLearner._id,
          content: 'Thanks for publishing the replay – super helpful!',
          createdAt: daysAgo(1)
        }
      ]
    });

    classSessions.push(upcomingSession, recordedSession);

    const materialA = await ClassMaterial.create({
      classroom: classroom._id,
      session: upcomingSession._id,
      title: `${skillName} Session Slides`,
      description: 'Slide deck covering the live workshop agenda.',
      type: 'slides',
      link: `https://chaturway001.cdn/${skillName.toLowerCase().replace(/\s+/g, '-')}-slides.pdf`,
      uploadedBy: instructor._id,
      comments: [
        {
          user: admin._id,
          content: 'Slides look fantastic – added to the resource hub.',
          createdAt: daysAgo(0)
        }
      ]
    });

    const materialB = await ClassMaterial.create({
      classroom: classroom._id,
      session: recordedSession._id,
      title: `${skillName} Reference Repository`,
      description: 'Sample projects and lab starter kits.',
      type: 'github',
      link: `https://github.com/chaturway001/${skillName.toLowerCase().replace(/\s+/g, '-')}-starter`,
      uploadedBy: instructor._id
    });

    await ClassSession.findByIdAndUpdate(upcomingSession._id, { $push: { materials: materialA._id } });
    await ClassSession.findByIdAndUpdate(recordedSession._id, { $push: { materials: materialB._id } });

    classMaterials.push(materialA, materialB);
  }

  return { welcomeRoom, skillRooms, classrooms, classroomRooms, classSessions, classMaterials };
};

const createUserSkillProfiles = async (users, skillMap, skillRooms) => {
  const profiles = [];
  const roomIndexBySkill = Object.fromEntries(skillRooms.map((room) => [room.name.replace(' Guild', ''), room]));

  for (const skillName of Object.keys(skillMap)) {
    const skill = await TechSkill.findById(skillMap[skillName]._id); // ensures we have the subdocument ids
    const questionIds = skill.questions.map((q) => q._id);

    const ownerProfile = await UserSkillProfile.create({
      userId: users[1]._id,
      skillId: skill._id,
      levelSelected: 'Professional',
      answers: questionIds.slice(0, 2).map((questionId) => ({
        questionId,
        answer: 'Sample answer',
        correct: true
      })),
      isVerified: true,
      verifiedAt: daysAgo(1),
      joinedGroupId: roomIndexBySkill[skillName]._id,
      verificationScore: 95,
      attempts: 1,
      lastAttemptAt: daysAgo(1)
    });

    const learnerProfile = await UserSkillProfile.create({
      userId: users[3]._id,
      skillId: skill._id,
      levelSelected: 'Intermediate',
      answers: questionIds.slice(-2).map((questionId) => ({
        questionId,
        answer: 'In-progress',
        correct: false
      })),
      isVerified: skillName !== 'Cybersecurity',
      verifiedAt: skillName !== 'Cybersecurity' ? daysAgo(2) : null,
      joinedGroupId: roomIndexBySkill[skillName]._id,
      verificationScore: skillName === 'Cybersecurity' ? 40 : 82,
      attempts: 2,
      lastAttemptAt: daysAgo(2)
    });

    profiles.push(ownerProfile, learnerProfile);
  }

  return profiles;
};

const createMessagesAndChats = async (users, welcomeRoom, skillRooms, classroomRooms) => {
  const [admin, instructor, suspendedUser, dataLearner, bannedUser] = users;

  await Message.create({
    sender: admin._id,
    room: welcomeRoom._id,
    content: '👋 Welcome to Chaturway! Take a moment to review the community rules and pick a skill track.',
    messageType: 'text',
    readBy: [{ user: admin._id }, { user: instructor._id }, { user: dataLearner._id }],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
  });

  await Message.create({
    sender: dataLearner._id,
    room: welcomeRoom._id,
    content: 'Excited to join the Data Analysis classroom this week! 🎉',
    messageType: 'text',
    readBy: [{ user: dataLearner._id }, { user: admin._id }],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  });

  for (const room of skillRooms) {
    await Message.create({
      sender: instructor._id,
      room: room._id,
      content: `Kicking off a new project in ${room.name}! Share what you are building.`,
      messageType: 'text',
      readBy: [{ user: instructor._id }, { user: admin._id }],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1)
    });
  }

  const flaggedMessage = await Message.create({
    sender: suspendedUser._id,
    room: skillRooms[0]._id,
    content: 'Buy access to leaked credentials at shady-site.biz 💸',
    messageType: 'text',
    readBy: [{ user: admin._id }],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await Message.create({
    sender: bannedUser._id,
    room: skillRooms[1]._id,
    content: 'Spam message promoting unrelated products.',
    messageType: 'text',
    readBy: [{ user: instructor._id }],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  for (const room of classroomRooms) {
    await Message.create({
      sender: instructor._id,
      room: room._id,
      content: `Reminder: next live session starts soon. Check the materials tab for pre-reading.`,
      messageType: 'text',
      readBy: [{ user: instructor._id }, { user: admin._id }],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1)
    });
  }

  const privateChat = await PrivateChat.create({
    participants: toSortedObjectIds([admin._id, instructor._id])
  });

  await Message.create({
    sender: admin._id,
    privateChat: privateChat._id,
    content: 'Thanks for putting together the new curriculum outline!',
    messageType: 'text',
    readBy: [{ user: admin._id }, { user: instructor._id }],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  });

  return { flaggedMessage };
};

const createViolationsAndLogs = async (admin, suspendedUser, bannedUser, flaggedMessage) => {
  const violationEntries = await Violation.insertMany([
    {
      user: suspendedUser._id,
      message: flaggedMessage._id,
      content: flaggedMessage.content,
      reason: 'spam',
      status: 'pending',
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0)
    },
    {
      user: suspendedUser._id,
      content: 'Repeated unsolicited promotional content detected in private chats.',
      reason: 'spam',
      status: 'reviewed',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1)
    },
    {
      user: bannedUser._id,
      content: 'Automated moderation flagged multiple harassment attempts.',
      reason: 'harassment',
      status: 'action_taken',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2)
    }
  ]);

  const adminLogs = await AdminActionLog.insertMany([
    {
      admin: admin._id,
      action: 'suspend',
      targetUser: suspendedUser._id,
      details: { reason: 'Exceeded violation threshold', days: 3 },
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1)
    },
    {
      admin: admin._id,
      action: 'ban',
      targetUser: bannedUser._id,
      details: { reason: 'Repeated harassment reports' },
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2)
    },
    {
      admin: admin._id,
      action: 'reset-password',
      targetUser: suspendedUser._id,
      details: {},
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5)
    }
  ]);

  return { violationEntries, adminLogs };
};

const printSummary = ({ users, skills, classrooms, sessions, materials, rooms, violations, logs }) => {
  console.log('\n🎯 Seed Summary');
  console.log('   • Users:            ', users.length);
  console.log('   • Tech skills:      ', Object.keys(skills).length);
  console.log('   • Rooms:            ', rooms.length);
  console.log('   • Classrooms:       ', classrooms.length);
  console.log('   • Class sessions:   ', sessions.length);
  console.log('   • Class materials:  ', materials.length);
  console.log('   • Violations:       ', violations.length);
  console.log('   • Admin logs:       ', logs.length);

  console.log('\n👤 Accounts (password: Password123!)');
  users.forEach((user) => {
    const badges = [];
    if (user.isAdmin) badges.push('ADMIN');
    if (user.role === 'instructor') badges.push('INSTRUCTOR');
    if (user.isSuspended) badges.push('SUSPENDED');
    if (user.isBanned) badges.push('BANNED');

    console.log(`   - ${user.email} (${user.username}) ${badges.length ? '[' + badges.join(', ') + ']' : ''}`);
  });
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    const connectionType = isLocalMongo ? 'Local MongoDB' : 'MongoDB Atlas';
    console.log(`✅ Connected to ${connectionType} → ${DB_NAME}`);

    await clearCollections();
    console.log('🗑️  Cleared existing data');

    const users = await createUsers();
    console.log(`✅ Created ${users.length} users`);

    const skillMap = await createTechSkills(users[0], users[1]);
    console.log(`✅ Created ${Object.keys(skillMap).length} tech skills`);

    const { welcomeRoom, skillRooms, classrooms, classroomRooms, classSessions, classMaterials } = await createRoomsAndClassrooms(users, skillMap);
    console.log(`✅ Created ${1 + skillRooms.length + classroomRooms.length} rooms including skill guilds and classrooms`);

    await createUserSkillProfiles(users, skillMap, skillRooms);
    console.log('✅ Attached skill profiles to key users');

    const { flaggedMessage } = await createMessagesAndChats(users, welcomeRoom, skillRooms, classroomRooms);
    console.log('✅ Seeded conversations across community and classrooms');

    const { violationEntries, adminLogs } = await createViolationsAndLogs(users[0], users[2], users[4], flaggedMessage);
    console.log('✅ Registered moderation artifacts for analytics views');

    printSummary({
      users,
      skills: skillMap,
      classrooms,
      sessions: classSessions,
      materials: classMaterials,
      rooms: [welcomeRoom, ...skillRooms, ...classroomRooms],
      violations: violationEntries,
      logs: adminLogs
    });

    await mongoose.connection.close();
    console.log('\n🎉 Database seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
