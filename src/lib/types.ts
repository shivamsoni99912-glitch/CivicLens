export const CATEGORIES = [
  'Roads & Potholes',
  'Street Lighting',
  'Water & Drainage',
  'Waste Management',
  'Public Safety',
  'Parks & Trees',
  'Noise',
  'Traffic & Signage',
  'Other'
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ['High', 'Medium', 'Low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ['Pending', 'In Review', 'In Progress', 'Resolved'] as const;
export type ComplaintStatus = (typeof STATUSES)[number];

export interface AiAnalysis {
  category: Category;
  priority: Priority;
  confidence: number;
  explanation: string;
  signals: string[];
  responseWindow: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  image: string | null;
  priority: Priority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  analysis: AiAnalysis | null;
  /** Supabase auth user id of the citizen who filed the complaint. */
  userId: string;
  userName: string;
  userEmail: string | null;
}

export type NewComplaint = Omit<
  Complaint,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'userId' | 'userName' | 'userEmail'
> & {
  status?: ComplaintStatus;
};
