export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRequest {
  code: string;
  name: string;
  description?: string;
  credits: number;
}
