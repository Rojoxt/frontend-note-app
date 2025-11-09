import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from '@angular/material/dialog';
import {TagService, Tag} from '../../../../core/services/tag';
import {NoteService} from '../../../../core/services/note';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-tag-manager-dialog',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatSnackBarModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <h3 class="p-4 text-lg font-semibold">Manage tags</h3>
    <div class="px-4 pb-4">
      <div class="flex items-center gap-2 mb-3">
        <mat-form-field appearance="outline" class="flex-1">
          <input matInput placeholder="New tag" [(ngModel)]="newTagName"/>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="createTag()">Create</button>
      </div>
      @if (tags.length) {
        <div>
          <div *ngFor="let t of tags" class="flex items-center justify-between py-2 border-b">
            <div class="text-sm">{{ t.name }}</div>
            <div>
              <button mat-icon-button color="warn" aria-label="Delete tag" (click)="confirmDelete(t)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-sm text-gray-500">No tags available.</div>
      }
    </div>
    <div class="flex justify-end gap-2 px-4 pb-4">
      <button mat-button (click)="close()">Close</button>
    </div>
  `
})
export class TagManagerDialog implements OnInit {
  tags: Tag[] = [];
  newTagName = '';

  constructor(private dialogRef: MatDialogRef<TagManagerDialog>, private tagService: TagService, private noteService: NoteService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.tagService.list().subscribe({ next: data => this.tags = data, error: () => this.snack.open('Error loading tags', 'Close', { duration: 3000 }) });
  }

  createTag(): void {
    const name = (this.newTagName || '').trim();
    if (!name) return;
    this.tagService.create({ name }).subscribe({
      next: (t) => {
        this.snack.open('Tag created', 'Close', { duration: 2000 });
        this.newTagName = '';
        // add to local list
        this.tags = [t, ...this.tags];
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error creating tag';
        this.snack.open(msg, 'Close', { duration: 3000 });
      }
    });
  }

  confirmDelete(t: Tag): void {
    if (!t.id) return;
    this.noteService.filterByTag(t.name).subscribe({
      next: notes => {
        const count = notes.length;
        const ok = confirm(`Delete tag "${t.name}"? This will remove the tag from ${count} note(s). Continue?`);
        if (!ok) return;
        this.tagService.delete(t.id!).subscribe({ next: () => { this.snack.open('Tag deleted', 'Close', { duration: 2000 }); this.load(); }, error: () => this.snack.open('Error deleting tag', 'Close', { duration: 3000 }) });
      },
      error: () => {
        // if counting failed, ask a generic confirmation
        const ok = confirm(`Delete tag "${t.name}"? This will remove the tag from all notes. Continue?`);
        if (!ok) return;
        this.tagService.delete(t.id!).subscribe({ next: () => { this.snack.open('Tag deleted', 'Close', { duration: 2000 }); this.load(); }, error: () => this.snack.open('Error deleting tag', 'Close', { duration: 3000 }) });
      }
    });
  }

  close() { this.dialogRef.close(); }
}
