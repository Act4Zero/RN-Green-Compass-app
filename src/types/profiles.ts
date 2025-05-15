export interface Profile {
  id: string; // UUID from Supabase auth.users
  updated_at: string;
  created_at: string;
  email: string;
  display_name: string | null;
  is_anonymous: boolean;
  interests: string[];
  avatar_url: string | null;
  last_login_date: string | null; // ISO string or null
  login_streak: number | null;
}

export type ProfileFormData = {
  display_name: string;
  is_anonymous: boolean;
  interests: string[];
  avatar?: File | null;
};

// Available sustainability interests for user selection
export const SUSTAINABILITY_INTERESTS = [
  'Zero Waste',
  'Clean Energy',
  'Sustainable Food',
  'Ethical Fashion',
  'Conservation',
  'Climate Action',
  'Water Conservation',
  'Green Transportation',
  'Permaculture',
  'Sustainable Building'
];
