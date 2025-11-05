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
      // Beginner - 10 questions
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
        level: 'Beginner',
        questionText: 'What is Excel commonly used for?',
        correctAnswer: 'Data analysis and spreadsheets',
        options: ['Data analysis and spreadsheets', 'Writing code', 'Designing websites', 'Creating videos'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What does CSV stand for?',
        correctAnswer: 'Comma Separated Values',
        options: ['Comma Separated Values', 'Column Separated Variables', 'Computer Stored Values', 'Common Spreadsheet Values'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a bar chart used for?',
        correctAnswer: 'Comparing categories',
        options: ['Comparing categories', 'Showing trends over time', 'Displaying percentages', 'Showing relationships'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is the mean in statistics?',
        correctAnswer: 'Average of numbers',
        options: ['Average of numbers', 'Middle value', 'Most common value', 'Highest value'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a data table?',
        correctAnswer: 'Organized collection of data',
        options: ['Organized collection of data', 'A graph', 'A formula', 'A calculation'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is sorting in data analysis?',
        correctAnswer: 'Arranging data in order',
        options: ['Arranging data in order', 'Deleting data', 'Copying data', 'Formatting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is filtering?',
        correctAnswer: 'Showing only specific data',
        options: ['Showing only specific data', 'Deleting all data', 'Merging data', 'Exporting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a chart?',
        correctAnswer: 'Visual representation of data',
        options: ['Visual representation of data', 'A database', 'A spreadsheet', 'A formula'],
        questionType: 'multiple-choice'
      },
      // Intermediate - 10 questions
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
        level: 'Intermediate',
        questionText: 'What is SQL used for?',
        correctAnswer: 'Querying databases',
        options: ['Querying databases', 'Designing websites', 'Writing code', 'Creating graphics'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a JOIN in SQL?',
        correctAnswer: 'Combining data from tables',
        options: ['Combining data from tables', 'Deleting data', 'Sorting data', 'Filtering data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is data normalization?',
        correctAnswer: 'Organizing data efficiently',
        options: ['Organizing data efficiently', 'Deleting duplicate data', 'Merging databases', 'Backing up data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a correlation?',
        correctAnswer: 'Relationship between variables',
        options: ['Relationship between variables', 'A type of chart', 'A database type', 'A calculation method'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Python used for in data analysis?',
        correctAnswer: 'Data manipulation and analysis',
        options: ['Data manipulation and analysis', 'Web design', 'Graphics design', 'Video editing'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a data warehouse?',
        correctAnswer: 'Centralized data storage',
        options: ['Centralized data storage', 'A single table', 'A chart', 'A report'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is EDA?',
        correctAnswer: 'Exploratory Data Analysis',
        options: ['Exploratory Data Analysis', 'External Data Access', 'Electronic Data Archive', 'Extended Data Analysis'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a histogram?',
        correctAnswer: 'Chart showing frequency distribution',
        options: ['Chart showing frequency distribution', 'A bar chart', 'A line chart', 'A pie chart'],
        questionType: 'multiple-choice'
      },
      // Professional - 10 questions
      {
        level: 'Professional',
        questionText: 'What is the purpose of ETL in data analysis?',
        correctAnswer: 'Extract, Transform, Load data',
        options: ['Extract, Transform, Load data', 'Edit, Test, Launch', 'Encode, Transmit, Log', 'Encrypt, Transfer, Lock'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is machine learning in data analysis?',
        correctAnswer: 'Predictive modeling using algorithms',
        options: ['Predictive modeling using algorithms', 'Manual data entry', 'Data cleaning', 'Chart creation'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is big data?',
        correctAnswer: 'Large and complex datasets',
        options: ['Large and complex datasets', 'Small datasets', 'Single files', 'Simple tables'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a neural network?',
        correctAnswer: 'Machine learning algorithm',
        options: ['Machine learning algorithm', 'A database', 'A chart type', 'A spreadsheet'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is data mining?',
        correctAnswer: 'Discovering patterns in data',
        options: ['Discovering patterns in data', 'Deleting data', 'Copying data', 'Moving data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is Apache Spark?',
        correctAnswer: 'Big data processing framework',
        options: ['Big data processing framework', 'A database', 'A chart tool', 'A spreadsheet'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is data governance?',
        correctAnswer: 'Managing data quality and security',
        options: ['Managing data quality and security', 'Deleting old data', 'Creating charts', 'Exporting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a data pipeline?',
        correctAnswer: 'Automated data processing workflow',
        options: ['Automated data processing workflow', 'A single query', 'A chart', 'A report'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is dimensional modeling?',
        correctAnswer: 'Data warehouse design approach',
        options: ['Data warehouse design approach', 'Chart design', 'Data entry', 'Report formatting'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a data lake?',
        correctAnswer: 'Storage for raw data in native format',
        options: ['Storage for raw data in native format', 'A database', 'A processed dataset', 'A chart'],
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
      // Beginner - 10 questions
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
        level: 'Beginner',
        questionText: 'What is JavaScript?',
        correctAnswer: 'Programming language for web',
        options: ['Programming language for web', 'A database', 'A design tool', 'A server'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a function?',
        correctAnswer: 'Reusable block of code',
        options: ['Reusable block of code', 'A variable', 'A file', 'A folder'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a variable?',
        correctAnswer: 'Container for storing data',
        options: ['Container for storing data', 'A function', 'A loop', 'A condition'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is an array?',
        correctAnswer: 'List of items',
        options: ['List of items', 'A single value', 'A function', 'A loop'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a loop?',
        correctAnswer: 'Repeating code multiple times',
        options: ['Repeating code multiple times', 'A variable', 'A function', 'A condition'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is an object?',
        correctAnswer: 'Collection of key-value pairs',
        options: ['Collection of key-value pairs', 'A function', 'A loop', 'A variable'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a string?',
        correctAnswer: 'Text data',
        options: ['Text data', 'A number', 'A boolean', 'An array'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a number?',
        correctAnswer: 'Numeric data',
        options: ['Numeric data', 'Text', 'Boolean', 'Array'],
        questionType: 'multiple-choice'
      },
      // Intermediate - 10 questions
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
        level: 'Intermediate',
        questionText: 'What is async/await?',
        correctAnswer: 'Handling asynchronous operations',
        options: ['Handling asynchronous operations', 'Synchronous code', 'Loops', 'Variables'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a Promise?',
        correctAnswer: 'Future value handler',
        options: ['Future value handler', 'A function', 'A variable', 'A loop'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is RESTful API?',
        correctAnswer: 'API design pattern',
        options: ['API design pattern', 'A database', 'A framework', 'A language'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is middleware?',
        correctAnswer: 'Code that runs between requests',
        options: ['Code that runs between requests', 'A database', 'A frontend', 'A server'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is authentication?',
        correctAnswer: 'Verifying user identity',
        options: ['Verifying user identity', 'Storing data', 'Displaying data', 'Deleting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is authorization?',
        correctAnswer: 'Granting permissions',
        options: ['Granting permissions', 'Logging in', 'Logging out', 'Creating users'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a database index?',
        correctAnswer: 'Speed up data retrieval',
        options: ['Speed up data retrieval', 'Store data', 'Delete data', 'Update data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is caching?',
        correctAnswer: 'Storing frequently accessed data',
        options: ['Storing frequently accessed data', 'Deleting data', 'Processing data', 'Validating data'],
        questionType: 'multiple-choice'
      },
      // Professional - 10 questions
      {
        level: 'Professional',
        questionText: 'What is the purpose of microservices architecture?',
        correctAnswer: 'Building applications as independent services',
        options: ['Building applications as independent services', 'Making apps smaller', 'Reducing costs', 'Simplifying code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is containerization?',
        correctAnswer: 'Packaging apps with dependencies',
        options: ['Packaging apps with dependencies', 'Writing code', 'Designing UI', 'Creating databases'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is load balancing?',
        correctAnswer: 'Distributing traffic across servers',
        options: ['Distributing traffic across servers', 'Storing data', 'Deleting data', 'Processing data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is horizontal scaling?',
        correctAnswer: 'Adding more servers',
        options: ['Adding more servers', 'Upgrading hardware', 'Optimizing code', 'Deleting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a database shard?',
        correctAnswer: 'Partition of database',
        options: ['Partition of database', 'A backup', 'A replica', 'A cache'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is event-driven architecture?',
        correctAnswer: 'System responding to events',
        options: ['System responding to events', 'Request-response', 'Batch processing', 'Synchronous processing'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is CQRS?',
        correctAnswer: 'Separating read and write operations',
        options: ['Separating read and write operations', 'Combining operations', 'Deleting operations', 'Skipping operations'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is API versioning?',
        correctAnswer: 'Managing API changes over time',
        options: ['Managing API changes over time', 'Creating new APIs', 'Deleting APIs', 'Merging APIs'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is database replication?',
        correctAnswer: 'Copying data across multiple databases',
        options: ['Copying data across multiple databases', 'Deleting data', 'Moving data', 'Encrypting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a message queue?',
        correctAnswer: 'Asynchronous communication between services',
        options: ['Asynchronous communication between services', 'Synchronous communication', 'Database storage', 'File storage'],
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
      // Beginner - 10 questions
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
        level: 'Beginner',
        questionText: 'What is a prototype?',
        correctAnswer: 'A working model of a design',
        options: ['A working model of a design', 'A final product', 'A color palette', 'A font'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is UI design?',
        correctAnswer: 'User Interface design',
        options: ['User Interface design', 'User Integration', 'User Innovation', 'User Information'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a mockup?',
        correctAnswer: 'Static visual representation',
        options: ['Static visual representation', 'A working app', 'A code file', 'A database'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a color palette?',
        correctAnswer: 'Set of colors for a design',
        options: ['Set of colors for a design', 'A painting tool', 'A photo filter', 'A font style'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is typography?',
        correctAnswer: 'The art of arranging text',
        options: ['The art of arranging text', 'Writing code', 'Taking photos', 'Drawing pictures'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a design system?',
        correctAnswer: 'Collection of reusable components',
        options: ['Collection of reusable components', 'A single design', 'A color', 'A font'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is responsive design?',
        correctAnswer: 'Design that adapts to different screens',
        options: ['Design that adapts to different screens', 'Fast design', 'Colorful design', 'Simple design'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a grid system?',
        correctAnswer: 'Layout structure using columns',
        options: ['Layout structure using columns', 'A color system', 'A font system', 'An animation'],
        questionType: 'multiple-choice'
      },
      // Intermediate - 10 questions
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
        level: 'Intermediate',
        questionText: 'What is user testing?',
        correctAnswer: 'Testing designs with real users',
        options: ['Testing designs with real users', 'Testing code', 'Testing colors', 'Testing fonts'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is information architecture?',
        correctAnswer: 'Organizing content structure',
        options: ['Organizing content structure', 'Creating colors', 'Writing code', 'Designing logos'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a user journey?',
        correctAnswer: 'Path user takes to complete task',
        options: ['Path user takes to complete task', 'A design file', 'A color scheme', 'A font'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is usability testing?',
        correctAnswer: 'Evaluating how easy design is to use',
        options: ['Evaluating how easy design is to use', 'Testing code', 'Testing colors', 'Testing performance'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a design pattern?',
        correctAnswer: 'Reusable solution to common problems',
        options: ['Reusable solution to common problems', 'A color pattern', 'A font pattern', 'A code pattern'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is A/B testing?',
        correctAnswer: 'Comparing two design versions',
        options: ['Comparing two design versions', 'Testing A and B colors', 'Testing fonts', 'Testing code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is interaction design?',
        correctAnswer: 'Designing user interactions',
        options: ['Designing user interactions', 'Designing colors', 'Designing fonts', 'Designing code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is visual hierarchy?',
        correctAnswer: 'Organizing elements by importance',
        options: ['Organizing elements by importance', 'Random arrangement', 'Alphabetical order', 'Color order'],
        questionType: 'multiple-choice'
      },
      // Professional - 10 questions
      {
        level: 'Professional',
        questionText: 'What is design thinking?',
        correctAnswer: 'A problem-solving methodology',
        options: ['A problem-solving methodology', 'A design tool', 'A color theory', 'A font style'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is service design?',
        correctAnswer: 'Designing entire service experiences',
        options: ['Designing entire service experiences', 'Designing products', 'Designing colors', 'Designing fonts'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is cognitive load?',
        correctAnswer: 'Mental effort required to use interface',
        options: ['Mental effort required to use interface', 'File size', 'Color count', 'Font size'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is heuristic evaluation?',
        correctAnswer: 'Expert review of usability issues',
        options: ['Expert review of usability issues', 'User testing', 'Color testing', 'Font testing'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is progressive disclosure?',
        correctAnswer: 'Showing information gradually',
        options: ['Showing information gradually', 'Showing everything at once', 'Hiding information', 'Simplifying information'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is micro-interaction?',
        correctAnswer: 'Small interactive feedback moments',
        options: ['Small interactive feedback moments', 'Large animations', 'Color changes', 'Font changes'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is design research?',
        correctAnswer: 'Understanding users and context',
        options: ['Understanding users and context', 'Designing colors', 'Designing fonts', 'Writing code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is design validation?',
        correctAnswer: 'Confirming design meets requirements',
        options: ['Confirming design meets requirements', 'Creating designs', 'Testing colors', 'Testing fonts'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is design ops?',
        correctAnswer: 'Operations and processes for design teams',
        options: ['Operations and processes for design teams', 'Design tools', 'Color tools', 'Font tools'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is inclusive design?',
        correctAnswer: 'Designing for diverse user needs',
        options: ['Designing for diverse user needs', 'Simple design', 'Complex design', 'Colorful design'],
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
      // Beginner - 10 questions
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
        level: 'Beginner',
        questionText: 'What is a component?',
        correctAnswer: 'Reusable UI element',
        options: ['Reusable UI element', 'A database', 'A server', 'A file'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is JSX?',
        correctAnswer: 'JavaScript syntax extension',
        options: ['JavaScript syntax extension', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a prop?',
        correctAnswer: 'Data passed to component',
        options: ['Data passed to component', 'A function', 'A loop', 'A variable'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is state?',
        correctAnswer: 'Component data that can change',
        options: ['Component data that can change', 'A function', 'A file', 'A folder'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is CSS?',
        correctAnswer: 'Cascading Style Sheets',
        options: ['Cascading Style Sheets', 'Computer Style System', 'Color Style Sheet', 'Coding Style Sheet'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a DOM?',
        correctAnswer: 'Document Object Model',
        options: ['Document Object Model', 'Data Object Model', 'Design Object Model', 'Document Operation Model'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is HTML?',
        correctAnswer: 'HyperText Markup Language',
        options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Markup'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is responsive design?',
        correctAnswer: 'Design that works on all devices',
        options: ['Design that works on all devices', 'Fast design', 'Colorful design', 'Simple design'],
        questionType: 'multiple-choice'
      },
      // Intermediate - 10 questions
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
        level: 'Intermediate',
        questionText: 'What is Redux?',
        correctAnswer: 'State management library',
        options: ['State management library', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a hook in React?',
        correctAnswer: 'Function that lets you use state',
        options: ['Function that lets you use state', 'A database hook', 'A server hook', 'A design hook'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is useEffect?',
        correctAnswer: 'React hook for side effects',
        options: ['React hook for side effects', 'A database effect', 'A server effect', 'A design effect'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is TypeScript?',
        correctAnswer: 'Typed superset of JavaScript',
        options: ['Typed superset of JavaScript', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Webpack?',
        correctAnswer: 'Module bundler',
        options: ['Module bundler', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is Babel?',
        correctAnswer: 'JavaScript compiler',
        options: ['JavaScript compiler', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a SPA?',
        correctAnswer: 'Single Page Application',
        options: ['Single Page Application', 'Simple Page App', 'Server Page App', 'Static Page App'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is CSS-in-JS?',
        correctAnswer: 'Writing CSS in JavaScript',
        options: ['Writing CSS in JavaScript', 'CSS in Java', 'CSS in JSON', 'CSS in JSX only'],
        questionType: 'multiple-choice'
      },
      // Professional - 10 questions
      {
        level: 'Professional',
        questionText: 'What is server-side rendering (SSR)?',
        correctAnswer: 'Rendering pages on the server',
        options: ['Rendering pages on the server', 'Rendering on client', 'Rendering in database', 'Rendering in cache'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is static site generation?',
        correctAnswer: 'Pre-rendering pages at build time',
        options: ['Pre-rendering pages at build time', 'Rendering on server', 'Rendering on client', 'No rendering'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is code splitting?',
        correctAnswer: 'Splitting code into smaller chunks',
        options: ['Splitting code into smaller chunks', 'Dividing files', 'Separating styles', 'Splitting databases'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is tree shaking?',
        correctAnswer: 'Removing unused code',
        options: ['Removing unused code', 'Shaking trees', 'Updating code', 'Moving code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is progressive web app?',
        correctAnswer: 'Web app with native app features',
        options: ['Web app with native app features', 'Only web app', 'Only native app', 'Database app'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is WebAssembly?',
        correctAnswer: 'Low-level binary format for web',
        options: ['Low-level binary format for web', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is isomorphic JavaScript?',
        correctAnswer: 'Code that runs on client and server',
        options: ['Code that runs on client and server', 'Only client code', 'Only server code', 'Database code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is hydration?',
        correctAnswer: 'Attaching event listeners to SSR HTML',
        options: ['Attaching event listeners to SSR HTML', 'Adding water', 'Adding styles', 'Adding database'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a design system?',
        correctAnswer: 'Collection of reusable UI components',
        options: ['Collection of reusable UI components', 'A single design', 'A color', 'A font'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is performance optimization?',
        correctAnswer: 'Improving app speed and efficiency',
        options: ['Improving app speed and efficiency', 'Adding features', 'Adding colors', 'Adding fonts'],
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
      // Beginner - 10 questions
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
        level: 'Beginner',
        questionText: 'What is a database?',
        correctAnswer: 'Organized collection of data',
        options: ['Organized collection of data', 'A server', 'A file', 'A folder'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is Node.js?',
        correctAnswer: 'JavaScript runtime for server',
        options: ['JavaScript runtime for server', 'A database', 'A design tool', 'A browser'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is Express?',
        correctAnswer: 'Web framework for Node.js',
        options: ['Web framework for Node.js', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a route?',
        correctAnswer: 'URL endpoint for API',
        options: ['URL endpoint for API', 'A database path', 'A file path', 'A folder path'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is JSON?',
        correctAnswer: 'JavaScript Object Notation',
        options: ['JavaScript Object Notation', 'Java Object Notation', 'JavaScript Output Notation', 'Java Output Notation'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is HTTP?',
        correctAnswer: 'HyperText Transfer Protocol',
        options: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'Home Transfer Protocol', 'Hyperlink Transfer Protocol'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a request?',
        correctAnswer: 'Client asking server for data',
        options: ['Client asking server for data', 'Server asking client', 'Database query', 'File operation'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is a response?',
        correctAnswer: 'Server sending data to client',
        options: ['Server sending data to client', 'Client sending data', 'Database response', 'File response'],
        questionType: 'multiple-choice'
      },
      // Intermediate - 10 questions
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
        level: 'Intermediate',
        questionText: 'What is middleware?',
        correctAnswer: 'Code that runs between request and response',
        options: ['Code that runs between request and response', 'A database', 'A server', 'A file'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is authentication?',
        correctAnswer: 'Verifying user identity',
        options: ['Verifying user identity', 'Storing data', 'Deleting data', 'Backing up data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is JWT?',
        correctAnswer: 'JSON Web Token',
        options: ['JSON Web Token', 'Java Web Token', 'JavaScript Web Token', 'Java Script Token'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a database index?',
        correctAnswer: 'Speed up data retrieval',
        options: ['Speed up data retrieval', 'Store data', 'Delete data', 'Back up data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is a transaction?',
        correctAnswer: 'Atomic database operation',
        options: ['Atomic database operation', 'A single query', 'A file operation', 'A server operation'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is REST?',
        correctAnswer: 'Representational State Transfer',
        options: ['Representational State Transfer', 'React State Transfer', 'Remote State Transfer', 'Request State Transfer'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is GraphQL?',
        correctAnswer: 'Query language for APIs',
        options: ['Query language for APIs', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is rate limiting?',
        correctAnswer: 'Limiting number of requests',
        options: ['Limiting number of requests', 'Unlimited requests', 'Blocking requests', 'Slowing requests'],
        questionType: 'multiple-choice'
      },
      // Professional - 10 questions
      {
        level: 'Professional',
        questionText: 'What is load balancing?',
        correctAnswer: 'Distributing traffic across multiple servers',
        options: ['Distributing traffic across multiple servers', 'Making servers faster', 'Reducing costs', 'Simplifying code'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is database sharding?',
        correctAnswer: 'Partitioning database across servers',
        options: ['Partitioning database across servers', 'Backing up database', 'Deleting database', 'Moving database'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is database replication?',
        correctAnswer: 'Copying data to multiple databases',
        options: ['Copying data to multiple databases', 'Deleting data', 'Moving data', 'Encrypting data'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is a message queue?',
        correctAnswer: 'Asynchronous communication system',
        options: ['Asynchronous communication system', 'Synchronous system', 'Database system', 'File system'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is event sourcing?',
        correctAnswer: 'Storing events as source of truth',
        options: ['Storing events as source of truth', 'Storing current state', 'Deleting events', 'Moving events'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is CQRS?',
        correctAnswer: 'Separating read and write operations',
        options: ['Separating read and write operations', 'Combining operations', 'Deleting operations', 'Simplifying operations'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is API gateway?',
        correctAnswer: 'Single entry point for APIs',
        options: ['Single entry point for APIs', 'Multiple entry points', 'Database gateway', 'File gateway'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is circuit breaker pattern?',
        correctAnswer: 'Preventing cascade failures',
        options: ['Preventing cascade failures', 'Breaking circuits', 'Stopping servers', 'Blocking requests'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is database connection pooling?',
        correctAnswer: 'Reusing database connections',
        options: ['Reusing database connections', 'Creating new connections', 'Deleting connections', 'Blocking connections'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is horizontal scaling?',
        correctAnswer: 'Adding more servers',
        options: ['Adding more servers', 'Upgrading hardware', 'Optimizing code', 'Deleting data'],
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
  },
  {
    name: 'AI Engineers',
    description: 'Artificial intelligence, machine learning, deep learning, natural language processing, and AI systems',
    icon: '🤖',
    questionGenerator: 'technical',
    questionTemplate: 'What AI technologies and frameworks have you worked with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is artificial intelligence?',
        correctAnswer: 'Computer systems that can perform tasks requiring human intelligence',
        options: ['Computer systems that can perform tasks requiring human intelligence', 'A database', 'A programming language', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is machine learning?',
        correctAnswer: 'A subset of AI that enables systems to learn from data',
        options: ['A database', 'A subset of AI that enables systems to learn from data', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is deep learning?',
        correctAnswer: 'Machine learning using neural networks with multiple layers',
        options: ['Machine learning using neural networks with multiple layers', 'A database', 'A server', 'A design tool'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is NLP?',
        correctAnswer: 'Natural Language Processing',
        options: ['Natural Language Processing', 'Network Layer Protocol', 'New Learning Process', 'Neural Learning Platform'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is transfer learning?',
        correctAnswer: 'Using pre-trained models for new tasks',
        options: ['Using pre-trained models for new tasks', 'Moving data between servers', 'Transferring files', 'Learning to transfer'],
        questionType: 'multiple-choice'
      }
    ]
  },
  {
    name: 'Software Testers',
    description: 'Quality assurance, test automation, manual testing, performance testing, and software quality assurance',
    icon: '🧪',
    questionGenerator: 'technical',
    questionTemplate: 'What testing methodologies and tools are you experienced with?',
    questions: [
      {
        level: 'Beginner',
        questionText: 'What is software testing?',
        correctAnswer: 'Process of verifying software functionality and quality',
        options: ['Writing code', 'Process of verifying software functionality and quality', 'Designing interfaces', 'Managing servers'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Beginner',
        questionText: 'What is unit testing?',
        correctAnswer: 'Testing individual components or functions',
        options: ['Testing the whole system', 'Testing individual components or functions', 'Testing user interfaces', 'Testing databases'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is test automation?',
        correctAnswer: 'Using tools to execute tests automatically',
        options: ['Manual testing', 'Using tools to execute tests automatically', 'Writing test cases', 'Finding bugs'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Intermediate',
        questionText: 'What is regression testing?',
        correctAnswer: 'Testing to ensure changes dont break existing functionality',
        options: ['Testing new features', 'Testing to ensure changes dont break existing functionality', 'Testing performance', 'Testing security'],
        questionType: 'multiple-choice'
      },
      {
        level: 'Professional',
        questionText: 'What is CI/CD in testing?',
        correctAnswer: 'Continuous Integration/Continuous Deployment with automated testing',
        options: ['Continuous Integration/Continuous Deployment with automated testing', 'Code Integration', 'Client Interface', 'Computer Interface'],
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
          name: `${skill.name} Group`,
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

