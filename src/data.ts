export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'active' | 'normal';
  attendees: string[];
  attachments?: { name: string; type: 'sketch' | 'excel' | 'css' | 'pdf' }[];
  progress?: number;
  task_date?: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread?: number;
}

export const dates = [
  { day: 'Mon', num: '26', month: 'February' },
  { day: 'Tue', num: '27', month: 'February' },
  { day: 'Wed', num: '28', month: 'February' },
  { day: 'Thu', num: '29', month: 'February' },
  { day: 'Fri', num: '1', month: 'March' },
  { day: 'Sat', num: '2', month: 'March' },
];

export const universityTasks: Task[] = [
  {
    id: 'u1',
    title: 'Advanced Calculus Lecture',
    description: 'Room 402 - Main Campus. Topic: Triple Integrals and Vector Fields. Don\'t forget the workbook!',
    time: '09:00am',
    type: 'active',
    attendees: [
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'u2',
    title: 'CS101 Lab Submission',
    description: 'Submit the final Python script for the sorting algorithm project via the University portal.',
    time: '11:59pm',
    type: 'normal',
    attendees: [],
    attachments: [{ name: 'sorting_algo.py', type: 'css' }]
  },
  {
    id: 'u3',
    title: 'Library Study Session',
    description: 'Preparing for the mid-semester exams with the study group. Focused on Macroeconomics.',
    time: '02:00pm',
    type: 'normal',
    attendees: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'
    ]
  }
];

export const chats: Chat[] = [
  {
    id: 'c1',
    name: 'Sarah (Study Group)',
    lastMessage: 'Did you finish the lab report yet?',
    time: '2m ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    unread: 3
  },
  {
    id: 'c2',
    name: 'Prof. Miller',
    lastMessage: 'The exam dates have been pushed back.',
    time: '1h ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
  {
    id: 'c3',
    name: 'Dorm Basketball',
    lastMessage: 'Game starts at 6 PM sharp!',
    time: '3h ago',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
  }
];

export const stats = {
  name: '',
  username: '',
  course: 'Filming and Television',
  gpa: '3.8',
  classesToday: 3,
  assignmentsPending: 5,
  semesterProgress: 65,
  avatar_url: null as string | null,
  is_verified: false,
  is_admin: false,
  semester_target_date: null as string | null,
};
