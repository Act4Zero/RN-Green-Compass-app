# Gamification DB Prototype

## Track Green Points

Table: `user_points`

CREATE TABLE user\_points (  
  id           UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,  
  source       TEXT NOT NULL,         \-- e.g. 'daily\_login', 'habit\_log', 'discussion\_participation'  
  reference\_id UUID,                  \-- e.g. habit\_logs.id or discussions.id  
  points       INTEGER NOT NULL,  
  created\_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

**Why?** Every time someone checks in, logs a habit or posts in the community, you’ll write a row here. Summing points over time feeds into leaderboards.

### RLS:

**Policy: Users can *insert* their own points record \-** *Why?* Only the current user (or backend service acting as that user) may write point events for themselves.  
**Policy:** Users can *select* only their own history \- *Why?* Keeps each user’s point log private.

## Daily Login & Streaks

* **Add columns to `profiles`**

ALTER TABLE profiles  
  ADD COLUMN last\_login\_date DATE,  
  ADD COLUMN login\_streak INTEGER DEFAULT 0;

**Workflow:**

* On successful login, compare `current_date` to `last_login_date`.

* If yesterday → increment `login_streak`, else reset to 1\.

* Award bonus points via `user_points` with `source='daily_login'`.

* Update `last_login_date = current_date`.

## Streak Tracking for Habits

You already have `habit_logs` (with `log_date`, `completed`) db\_tables. To efficiently query streaks:

* Either derive streaks on-the-fly in SQL, or

* Maintain a `user_habit_streaks` table:

CREATE TABLE user\_habit\_streaks (

  id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id       UUID REFERENCES profiles(id),

  habit\_id      UUID REFERENCES habits(id),

  current\_streak INTEGER DEFAULT 0,

  last\_log\_date DATE

);

### RLS:

**Policy: Users can *select* their own streaks**

**Policy: *Update disabled for users***

***Block end-user writes/deletions***