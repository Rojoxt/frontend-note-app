import {Component, EventEmitter, Output, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators, FormGroup} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NoteService, Note} from '../../../../core/services/note';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './note-form.html',
  styleUrls: ['./note-form.css'],
})
export class NoteForm implements OnChanges {
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Input() note?: Note | null;

  form: FormGroup;
  saving = false;

  constructor(private fb: FormBuilder, private noteService: NoteService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note']) {
      if (this.note) {
        this.form.patchValue({
          title: this.note.title,
          content: this.note.content,
        });
      } else {
        this.form.reset();
      }
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.saving = true;
      const payload = this.form.value as { title: string; content: string };
      if (this.note && this.note.id !== undefined) {
        this.noteService.update(this.note.id, payload).subscribe({
          next: () => {
            this.saving = false;
            this.saved.emit();
            this.form.reset();
          },
          error: () => {
            this.saving = false;
            // podríamos mostrar un snackbar; por simplicidad sólo dejamos el estado
          }
        });
      } else {
        this.noteService.create(payload).subscribe({
          next: () => {
            this.saving = false;
            this.form.reset();
            this.saved.emit();
          },
          error: () => {
            this.saving = false;
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.form.reset();
    this.canceled.emit();
  }
}
