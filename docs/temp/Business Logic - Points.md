# Business Logic for Green Points System

## 1. Overview  
Define how users earn, track, and redeem Green Points based on app interactions. Points are logged in the database, updated in real time in the UI, and governed by Row-Level Security policies.

---

## 2. Data Model  
- **Point Events**: Every action earning points creates a new record in `user_points`, capturing `user_id`, `source`, `reference_id`, `points`, and `created_at` :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}.  
- **User Profile Enhancements**:  
  - `last_login_date` (DATE)  
  - `login_streak` (INTEGER, default 0)  
  These support daily login streak calculation :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}.  
- **Habit Streaks** (optional): Maintain `user_habit_streaks` to store each user’s current streak per habit, with `last_log_date` and `current_streak` for efficient querying :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}.

---

## 3. Earning Points  

### 3.1 Daily Check-In  
1. **Trigger**: User taps “Check-in” on Welcome Screen :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}.  
2. **Streak Logic**:  
   - Compare `current_date` to `profiles.last_login_date`.  
   - If equal to yesterday → increment `login_streak`; else reset to 1.  
3. **Point Award**:  
   - Create a `user_points` record with `source = 'daily_login'` and `points = X` (e.g. 20) :contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9}.  
4. **Profile Update**: Set `last_login_date = current_date`.  
5. **UI Feedback**: Show “+20 Green Points!” animation and update balance immediately :contentReference[oaicite:10]{index=10}:contentReference[oaicite:11]{index=11}.

### 3.2 Logging a Sustainable Habit  
1. **Trigger**: User taps “+ Log Habit” on Dashboard :contentReference[oaicite:12]{index=12}:contentReference[oaicite:13]{index=13}.  
2. **Action**: User selects a predefined habit (e.g. “biking to work”).  
3. **Point Award**:  
   - Create a `user_points` record with `source = 'habit_log'`, `reference_id = habit_logs.id`, and `points = Y` (e.g. 50) :contentReference[oaicite:14]{index=14}:contentReference[oaicite:15]{index=15}.  
4. **Streak Tracking** (optional):  
   - If previous `user_habit_streaks.last_log_date` was yesterday → increment `current_streak`; else reset to 1.  
   - Update or insert into `user_habit_streaks`.  
5. **UI Feedback**: Show “+50 Green Points! Habit logged” animation and update balance instantly :contentReference[oaicite:16]{index=16}:contentReference[oaicite:17]{index=17}.

### 3.3 Community Participation  
1. **Trigger**: User posts or comments in community forums.  
2. **Point Award**: Create a `user_points` record with `source = 'discussion_participation'` and appropriate `points` :contentReference[oaicite:18]{index=18}:contentReference[oaicite:19]{index=19}.  
3. **UI Feedback**: Display “+Z Green Points!” confirmation and refresh balance :contentReference[oaicite:20]{index=20}:contentReference[oaicite:21]{index=21}.

---

## 4. Point Balance & Presentation  
- **Real-Time Updates**: After each award, recalculate the sum of `points` for the current user and push the new total to the dashboard :contentReference[oaicite:22]{index=22}:contentReference[oaicite:23]{index=23}.  
- **Visual Confirmation**: Animate point gains (“+N points!”) next to the points balance widget on the Dashboard :contentReference[oaicite:24]{index=24}:contentReference[oaicite:25]{index=25}.  
- **History View**: Allow users to view their own `user_points` history list, ordered by `created_at`.

---

## 5. Row-Level Security (RLS) Policies  
- **user_points**  
  - **INSERT**: Only the authenticated user (or backend service acting on their behalf) may insert their own point events :contentReference[oaicite:26]{index=26}:contentReference[oaicite:27]{index=27}.  
  - **SELECT**: Users may only select their own point records.  
- **profiles**  
  - **UPDATE**: Only backend processes may update `last_login_date` and `login_streak`.  
- **user_habit_streaks**  
  - **SELECT**: Users may select only their own streaks.  
  - **UPDATE/DELETE**: Disabled for end users to prevent tampering :contentReference[oaicite:28]{index=28}:contentReference[oaicite:29]{index=29}.

---

## 6. Acceptance Criteria Mapping  
- **Points for Logging Habits**: Users earn predefined points when they log habits :contentReference[oaicite:30]{index=30}:contentReference[oaicite:31]{index=31}.  
- **Daily Login Bonus**: Users earn bonus points and see their streak incremented when they check in consecutively :contentReference[oaicite:32]{index=32}:contentReference[oaicite:33]{index=33}.  
- **Immediate Visual Feedback**: Every point-earning action triggers an on-screen animation (“+N Green Points!”) and updates the balance without delay :contentReference[oaicite:34]{index=34}:contentReference[oaicite:35]{index=35}.  
- **Balance Updates**: The points total on the Dashboard reflects all new awards instantly :contentReference[oaicite:36]{index=36}:contentReference[oaicite:37]{index=37}.  

---

*End of Business Logic Definition*
