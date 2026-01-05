# People Management - User Guide

## Overview

The People Management feature allows you to add, view, edit, and delete people in your ZiWei Path system. These people can be used across all 8 modules for compatibility analysis, relationship insights, career guidance, and more.

## Accessing People Management

1. Navigate to your dashboard
2. Click **"People Management"** in the sidebar (second item)
3. You'll see a list of all people you've added

## Adding a New Person

### Step 1: Click "Add Person"
Click the **"Add Person"** button in the top-right corner

### Step 2: Fill in Birth Information

**Required Fields:**
- **Full Name** - The person's complete name
- **Birth Date** - Date of birth (YYYY-MM-DD)

**Optional Fields:**
- **Birth Time** - Time of birth (HH:MM) - More accurate charts
- **Birth Location** - City, Country - For location-based calculations
- **Gender** - Male, Female, Other
- **Relationship Type** - How this person relates to you:
  - Romantic Partner
  - Business Partner
  - Friend
  - Family
  - Other
- **Custom Label** - Personal note (e.g., "My spouse", "Co-founder")

### Step 3: Save
Click **"Add Person"** to save to the database

## Viewing People

All added people are displayed as cards showing:
- Name
- Birth date and time
- Birth location
- Relationship type badge (color-coded)
- Custom label (if provided)

**Your Profile:**
- Marked with a "You" badge
- Has a primary border color
- Created during onboarding

## Editing a Person

1. Find the person card
2. Click the **pencil icon** (✏️) in the top-right
3. Update any fields
4. Click **"Update Person"**

**Note:** You cannot edit your own profile (marked as "You")

## Deleting a Person

1. Find the person card
2. Click the **trash icon** (🗑️) in the top-right
3. Confirm deletion

**Note:** You cannot delete your own profile

## Relationship Types & Colors

Each relationship type has a unique color badge:

- **Self** (You) - Primary violet
- **Romantic Partner** - Pink
- **Business Partner** - Blue
- **Friend** - Green
- **Family** - Amber
- **Other** - Gray

## Using People in Modules

Once you've added people, you can use them in:

### 1. Love & Compatibility
- Analyze romantic compatibility
- View relationship dynamics
- Get timing insights for relationships

### 2. Business Partner Evaluator
- Assess business compatibility
- Evaluate collaboration potential
- Check trust alignment

### 3. Career & Wealth
- Compare career paths
- Analyze wealth patterns
- Get joint venture insights

### 4. Compatibility & Conflict Detector
- Run multi-person compatibility analysis
- Identify harmony and friction points
- Get conflict resolution guidance

## Data Storage

All people data is stored securely in your Neon PostgreSQL database:

**People Table:**
- `id` - Unique identifier
- `name` - Full name
- `birth_date` - Date of birth
- `birth_time` - Time of birth (optional)
- `birth_location` - Location (optional)
- `gender` - Gender (optional)
- `is_user_self` - True for your profile
- `created_by_user_id` - Your Clerk user ID

**Relationships Table:**
- Links you to each person
- Stores relationship type
- Stores custom label

## Chart Calculations

When you add a person, you can trigger chart calculations:

1. Person is saved to database
2. n8n webhook is triggered (if configured)
3. Charts are calculated:
   - Zi Wei Dou Shu chart
   - Western zodiac chart
   - Chinese zodiac chart
4. Results stored in `charts` table
5. Available for all module analyses

## Tips

**For Best Results:**
- Include birth time for more accurate charts
- Add birth location for location-based insights
- Use descriptive custom labels
- Keep relationship types accurate

**Privacy:**
- Only you can see your people
- Data is private to your account
- Delete anytime without affecting your profile

**Reusability:**
- Add a person once, use everywhere
- Same person can be analyzed in multiple contexts
- Update once, reflects across all modules

## Example Use Cases

### Romantic Relationship
1. Add partner with birth data
2. Set relationship type: "Romantic Partner"
3. Label: "My spouse"
4. Use in Love & Compatibility module

### Business Partnership
1. Add business partner
2. Set relationship type: "Business Partner"
3. Label: "Co-founder"
4. Use in Business Partner Evaluator

### Family Analysis
1. Add family members
2. Set relationship type: "Family"
3. Labels: "Mother", "Father", "Sibling"
4. Use in Compatibility Detector

### Friend Compatibility
1. Add friends
2. Set relationship type: "Friend"
3. Use in Compatibility & Conflict Detector

## Troubleshooting

**Person not appearing?**
- Check if form was submitted successfully
- Refresh the page
- Check browser console for errors

**Can't delete a person?**
- You cannot delete your own profile
- Check if person is being used in active analyses

**Charts not calculating?**
- Ensure n8n webhook is configured
- Check n8n workflow is running
- Verify birth data is complete

**Edit button not working?**
- Cannot edit your own profile (marked "You")
- Try refreshing the page

## API Endpoints

For developers:

- `GET /api/people` - List all people
- `POST /api/people` - Create new person
- `GET /api/people/:id` - Get specific person
- `PATCH /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

All endpoints require Clerk authentication.

---

**Ready to add people?** Navigate to Dashboard → People Management and start building your network for comprehensive destiny and compatibility analysis!
