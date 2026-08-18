export type UserRole = 'ADMIN' | 'TEAM_MEMBER';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LectureStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type SelfStudyStatus = 'NOT_STARTED' | 'LEARNING' | 'COMPLETED';
export type TechStackStatus = 'LEARNING' | 'USING' | 'COMPLETED';
export type HardwareStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED' | 'DAMAGED' | 'MISSING';
export type ThemeStatus = 'EXPLORING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';

export type NoteCategory =
  | 'ROBOTICS'
  | 'ROS'
  | 'EMBEDDED'
  | 'CONTROL_SYSTEMS'
  | 'COMPUTER_VISION'
  | 'COMPETITION'
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'GENERAL';

export type ResourceCategory =
  | 'DOCUMENTATION'
  | 'WEBSITE'
  | 'TUTORIAL'
  | 'VIDEO'
  | 'PAPER'
  | 'DATASHEET'
  | 'GITHUB_REPO'
  | 'COURSE'
  | 'PDF';

export type TechCategory =
  | 'Robotics'
  | 'Programming'
  | 'Embedded'
  | 'Simulation'
  | 'Control'
  | 'Computer Vision'
  | 'Electronics'
  | 'Mechanical'
  | 'DevOps';

export type HardwareCategory =
  | 'Microcontroller'
  | 'Motors'
  | 'Sensors'
  | 'Power'
  | 'Chassis'
  | 'Communication'
  | 'Tools'
  | 'Other';
