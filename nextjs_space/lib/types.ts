import { Role, Priority } from "@prisma/client";

export type { Role, Priority };

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  schoolLogo?: string;
  schoolColor: string;
}

export interface AnnouncementWithRead {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  reads: {
    userId: string;
    readAt: Date;
  }[];
  isRead?: boolean;
  readCount?: number;
}
