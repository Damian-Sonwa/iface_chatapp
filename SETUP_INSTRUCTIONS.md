# Setup Instructions for Tech Skills Feature

## Critical Steps to Make Changes Visible

### 1. **Seed the Database with Tech Skills**

The tech skills need to be seeded in your MongoDB database. Run this command:

```bash
cd server
node seedTechSkills.js
```

This will create:
- 14 tech skill categories (Data Analysts, Full-stack Developers, UI/UX Engineers, etc.)
- Questions for each skill (Beginner, Intermediate, Professional levels)
- Rooms/groups for each tech skill

### 2. **Verify Backend Routes are Active**

Make sure your server has these routes:
- `/api/tech-skills` - List all tech skills
- `/api/user-skill-profiles/verify` - Verify user answers
- `/api/user-skill-profiles/skill/:skillId/questions/:level` - Get questions
- `/api/user-skill-profiles/skill/:skillId/join-group` - Join group after verification

### 3. **Check Frontend Build**

The frontend should be rebuilt and deployed. The TechSkillsMenu component should be accessible from:
- Hamburger menu → "Tech / Digital Skills" → "Explore Tech Skills"
- Dashboard → "Tech Groups" button

### 4. **Verify Database Models**

Ensure these models exist in your MongoDB:
- `TechSkill` - Contains skill info and questions
- `UserSkillProfile` - Tracks user verification status
- `Room` - Groups linked to tech skills via `techSkillId`

### 5. **Test the Flow**

1. Open the app
2. Click hamburger menu (☰) in top right
3. Click "Tech / Digital Skills" → "Explore Tech Skills"
4. You should see a list of tech skill groups
5. Click any group (e.g., "Full-stack Developers Group")
6. A modal should open asking you to select your level
7. After selecting level, questions should appear
8. Answer questions and submit
9. If verified, you'll be automatically added to the group

## Troubleshooting

### If tech skills don't appear:
- Check if `seedTechSkills.js` has been run
- Verify MongoDB connection
- Check browser console for API errors
- Ensure backend is running and accessible

### If questions don't load:
- Check if questions exist in TechSkill model
- Verify API endpoint `/api/user-skill-profiles/skill/:skillId/questions/:level`
- Check browser network tab for failed requests

### If verification doesn't work:
- Check UserSkillProfile model exists
- Verify verification endpoint is working
- Check browser console for errors

