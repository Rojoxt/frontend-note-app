import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export interface Tag {
  id?: number;
  name: string;
}

@Component({
  selector: 'app-tag-picker-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCheckboxModule, FormsModule],
  template: `
    <h3 class="text-lg font-semibold p-4">Select tags</h3>
    <div class="px-4 pb-4">
      @if (data.tags.length) {
        <div>
          @for (t of data.tags; track t.name) {
            <div class="flex items-center gap-2 py-1">
              <mat-checkbox [(ngModel)]="checked[t.name]">{{ t.name }}</mat-checkbox>
            </div>
          }
        </div>
      } @else {
        <div class="text-sm text-gray-500">No tags are available. Create one from the header.</div>
      }
    </div>

    <div class="flex justify-end gap-2 px-4 pb-4">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Confirm</button>
    </div>
  `
})
export class TagPickerDialog {
  checked: Record<string, boolean> = {};

  constructor(
    private dialogRef: MatDialogRef<TagPickerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { tags: Tag[]; selected?: string[] }
  ) {
    (data.selected || []).forEach(n => this.checked[n] = true);
  }

  save() {
    const selected = Object.keys(this.checked).filter(k => this.checked[k]);
    this.dialogRef.close(selected);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
