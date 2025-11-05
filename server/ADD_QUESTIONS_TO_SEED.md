# Instructions to Add 10 Questions Per Level

The seedTechSkills.js file needs to be updated to have 10 questions for each level (Beginner, Intermediate, Professional) for each of the 14 tech skills.

Currently, each skill has only 2-5 questions per level. We need to expand each to 10 questions.

## Current Structure:
```javascript
{
  name: 'Data Analysts',
  questions: [
    { level: 'Beginner', questionText: '...', correctAnswer: '...', options: [...], questionType: 'multiple-choice' },
    { level: 'Beginner', questionText: '...', correctAnswer: '...', options: [...], questionType: 'multiple-choice' },
    // Only 2 Beginner questions - need 8 more
    { level: 'Intermediate', questionText: '...', correctAnswer: '...', options: [...], questionType: 'multiple-choice' },
    // Only 2 Intermediate questions - need 8 more
    { level: 'Professional', questionText: '...', correctAnswer: '...', options: [...], questionType: 'multiple-choice' },
    // Only 1 Professional question - need 9 more
  ]
}
```

## Required Structure:
Each skill should have 30 questions total (10 Beginner + 10 Intermediate + 10 Professional)

## Additional Questions Needed Per Skill:
- Data Analysts: 8 Beginner, 8 Intermediate, 9 Professional
- Full-stack Developers: 8 Beginner, 8 Intermediate, 9 Professional
- UI/UX Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Frontend Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Backend Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Cybersecurity: 8 Beginner, 8 Intermediate, 9 Professional
- Network Analysts: 8 Beginner, 8 Intermediate, 9 Professional
- DevOps Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Machine Learning Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Mobile Developers: 8 Beginner, 8 Intermediate, 9 Professional
- Cloud Architects: 8 Beginner, 8 Intermediate, 9 Professional
- Blockchain Developers: 8 Beginner, 8 Intermediate, 9 Professional
- AI Engineers: 8 Beginner, 8 Intermediate, 9 Professional
- Software Testers: 8 Beginner, 8 Intermediate, 9 Professional

## Question Format:
```javascript
{
  level: 'Beginner', // or 'Intermediate' or 'Professional'
  questionText: 'Question text here?',
  correctAnswer: 'Correct answer',
  options: ['Option 1', 'Option 2', 'Correct answer', 'Option 4'],
  questionType: 'multiple-choice'
}
```

