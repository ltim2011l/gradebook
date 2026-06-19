export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER';
  firstName: string;
  lastName: string;
  groupId?: string;
  group?: Group;
  isExpelled: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId: string;
  groupId: string;
  subject?: Subject;
  group?: Group;
}

export interface Subject {
  id: string;
  name: string;
  templates?: LessonTemplate[];
}

export interface LessonTemplate {
  id: string;
  subjectId: string;
  type: string;
  title: string;
  description?: string;
  maxScore: number;
  deadline?: string;
  fileUrl?: string;
  isTeamWork: boolean;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  studentId: string;
  templateId?: string;
  teamId?: string;
  fileUrl?: string;
  comment?: string;
  score?: number;
  submittedAt: string;
  student?: User;
  team?: Team;
}

export interface Team {
  id: string;
  templateId: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  user?: User;
}

export interface Grade {
  id: string;
  value: number;
  studentId: string;
  scheduleId?: string;
  comment?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  scheduleId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface JournalData {
  id: string;
  date: string;
  group: Group & { students: User[] };
  attendances: Attendance[];
  grades: Grade[];
}