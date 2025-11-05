# 🚨 CRITICAL: Deployment Checklist for Tech Skills Feature

## ⚠️ IMPORTANT: You MUST Complete These Steps

### Step 1: Seed the Database (REQUIRED)

**The database MUST be seeded with tech skills data or the feature won't work!**

On your Render server (or local server), run:

```bash
cd server
npm run seed-tech-skills
```

Or manually:
```bash
cd server
node seedTechSkills.js
```

This creates:
- ✅ 14 tech skill categories in the database
- ✅ Questions for each skill (Beginner/Intermediate/Professional)
- ✅ Rooms/groups for each tech skill

**Without this step, the tech skills list will be EMPTY!**

### Step 2: Verify Backend is Running

Check that your backend server is running and accessible:
- Local: `http://localhost:5000`
- Render: Check your Render dashboard

### Step 3: Verify API Endpoints

Test these endpoints in your browser or Postman:

1. **GET** `/api/tech-skills` 
   - Should return array of tech skills
   - If empty, database is not seeded!

2. **GET** `/api/user-skill-profiles/skill/:skillId/questions/:level`
   - Should return questions for a skill/level

3. **POST** `/api/user-skill-profiles/verify`
   - Should verify answers and return score

### Step 4: Check Frontend Build

1. Clear browser cache (Ctrl+Shift+R)
2. Check browser console for errors
3. Check Network tab for failed API calls

### Step 5: Access Tech Skills

**Path 1: Hamburger Menu**
1. Click ☰ (hamburger menu) in top right
2. Click "Tech / Digital Skills" section
3. Click "Explore Tech Skills"
4. Should see list of tech skill groups

**Path 2: Dashboard**
1. Go to `/chat` page
2. When no chat is selected, you'll see dashboard
3. Click "Tech Groups" button
4. Should open tech skills menu

### Step 6: Test the Flow

1. Click on any tech skill (e.g., "Full-stack Developers Group")
2. Modal opens → Select your level (Beginner/Intermediate/Professional)
3. Questions appear based on your level
4. Answer all questions
5. Submit → System verifies answers
6. If score meets threshold → You're added to the group
7. Group appears in sidebar

## Troubleshooting

### ❌ "No tech skills available"
- **Fix**: Run `npm run seed-tech-skills` in server directory

### ❌ "Failed to load questions"
- **Fix**: Check if questions exist in TechSkill model
- Verify API endpoint is working

### ❌ "Tech Groups button doesn't work"
- **Fix**: Check browser console for errors
- Verify TechSkillsMenu component exists

### ❌ "Can't see groups in sidebar"
- **Fix**: Verify you've joined a group (completed verification)
- Check if rooms are being fetched correctly

### ❌ "Changes not showing after deployment"
- **Fix**: 
  1. Hard refresh browser (Ctrl+Shift+R)
  2. Clear browser cache
  3. Check Netlify build logs for errors
  4. Verify database is seeded

## Quick Verification Commands

```bash
# Check if tech skills exist in database
# Connect to MongoDB and run:
db.techskills.find().count()
# Should return 14

# Check if rooms exist
db.rooms.find({ techSkillId: { $exists: true } }).count()
# Should return 14
```

