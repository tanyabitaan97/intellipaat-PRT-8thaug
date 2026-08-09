import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from './student.model';
import { StudentService } from './student.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private service = inject(StudentService);

  students: Student[] = [];
  student: Student = this.emptyStudent();
  editingId?: number;
  message = '';
  error = '';

  ngOnInit(): void {
    this.load();
  }

  emptyStudent(): Student {
    return { name: '', email: '', course: '', age: 18 };
  }

  load(): void {
    this.error = '';
    this.service.getAll().subscribe({
      next: data => this.students = data,
      error: err => this.error = err.error?.message || 'Unable to load students'
    });
  }

  save(): void {
    this.message = '';
    this.error = '';

    const request = this.editingId
      ? this.service.update(this.editingId, this.student)
      : this.service.create(this.student);

    request.subscribe({
      next: () => {
        this.message = this.editingId ? 'Student updated.' : 'Student added.';
        this.cancel();
        this.load();
      },
      error: err => this.error = err.error?.message || 'Operation failed'
    });
  }

  edit(s: Student): void {
    this.editingId = s.id;
    this.student = { ...s };
    this.message = '';
    this.error = '';
  }

  remove(id?: number): void {
    if (!id || !confirm('Delete this student?')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.message = 'Student deleted.';
        this.load();
      },
      error: err => this.error = err.error?.message || 'Delete failed'
    });
  }

  cancel(): void {
    this.editingId = undefined;
    this.student = this.emptyStudent();
  }
}
