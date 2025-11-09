import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NoteForm} from '../note-form/note-form';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [CommonModule, NoteForm, MatButtonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">{{ data.note ? 'Edit note' : 'Create note' }}</h3>
      <app-note-form [note]="data.note" (saved)="onSaved()" (canceled)="onCanceled()"></app-note-form>
    </div>
  `
})
export class NoteDialog {
  constructor(private dialogRef: MatDialogRef<NoteDialog>, @Inject(MAT_DIALOG_DATA) public data: { note?: any }) {}

  onSaved() {
    this.dialogRef.close(true);
  }

  onCanceled() {
    this.dialogRef.close(false);
  }
}
