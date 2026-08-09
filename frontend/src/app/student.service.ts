import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/students';

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
