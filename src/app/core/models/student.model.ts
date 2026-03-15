import { Course } from './course.model';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  courses?: Course[];
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
