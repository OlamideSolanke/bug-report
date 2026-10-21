export type Role = "ADMIN" | "USER";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: Pick<User, "id" | "name">;
}

export interface Bug {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  createdBy: Pick<User, "id" | "name">;
  assignedTo: Pick<User, "id" | "name"> | null;
  comments?: Comment[];
}
