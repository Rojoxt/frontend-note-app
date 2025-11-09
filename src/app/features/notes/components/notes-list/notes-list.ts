import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Note, NoteService} from '../../../../core/services/note';
import {TagService, Tag} from '../../../../core/services/tag';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { finalize } from 'rxjs/operators';
import {forkJoin} from 'rxjs';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { TagPickerDialog } from './tag-picker-dialog';
import { TagManagerDialog } from './tag-manager-dialog';
import { NoteDialog } from '../note-dialog/note-dialog';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule, FormsModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatDialogModule],
  templateUrl: './notes-list.html',
  styleUrls: ['./notes-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesList implements OnInit {
  notes: Note[] = [];
  loading = false;

  tags: Tag[] = [];
  filterTag: string | null = null;
  filterInput = '';
  removing: Record<string, boolean> = {};
  // asignación de tags ahora se maneja en el dialog o con inputs nativos

  constructor(private noteService: NoteService, private tagService: TagService, private cd: ChangeDetectorRef, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
    this.loadTags();
  }

  public load(): void {
    this.loading = true;
    const obs = this.filterTag ? this.noteService.filterByTag(this.filterTag) : this.noteService.listActive();
    obs.subscribe({
      next: data => {
        this.notes = data;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  loadTags(): void {
    this.tagService.list().subscribe({
      next: data => {
        this.tags = data;
        this.cd.markForCheck();
      },
      error: () => this.snack.open('Error al cargar etiquetas', 'Cerrar', { duration: 3000 })
    });
  }

  onFilterSelected(value: string): void {
    this.filterTag = value || null;
    this.filterInput = this.filterTag || '';
    this.load();
  }

  clearFilter(): void {
    this.filterTag = null;
    this.filterInput = '';
    this.load();
  }

  edit(note: Note): void {
    // open dialog for editing
    const ref = this.dialog.open(NoteDialog, { data: { note }, width: '640px' });
    ref.afterClosed().subscribe(res => { if (res) this.load(); });
  }

  openCreateNote(): void {
    const ref = this.dialog.open(NoteDialog, { data: {}, width: '640px' });
    ref.afterClosed().subscribe(res => { if (res) this.load(); });
  }

  archive(note: Note): void {
    if (note.id !== undefined) {
      this.noteService.toggleArchive(note.id).subscribe(() => this.load());
    }
  }

  delete(note: Note): void {
    if (!confirm('¿Eliminar nota? Esta acción es irreversible.')) return;
    if (note.id !== undefined) {
      this.noteService.delete(note.id).subscribe(() => this.load());
    }
  }

  openTagPicker(note: Note): void {
    const available = this.tags;
    const selected = note.tags ? note.tags.map(t => t.name) : [];
    const ref = this.dialog.open(TagPickerDialog, { data: { tags: available, selected }, width: '320px' });
    ref.afterClosed().subscribe((result: string[] | null) => {
      if (!result) return;
      const toAdd = result.filter(r => !selected.includes(r));
      const toRemove = selected.filter(s => !result.includes(s));
      const noteId = note.id!;

      const calls = [] as any[];
      if (toAdd.length) {
        toAdd.forEach(name => calls.push(this.noteService.assignTag(noteId, name)));
      }
      if (toRemove.length) {
        toRemove.forEach(name => calls.push(this.noteService.removeTag(noteId, name)));
      }

      if (calls.length === 0) return;

      forkJoin(calls.map(c => c.pipe(finalize(() => {}))))
        .subscribe({
          next: () => {
            this.snack.open('Cambios en etiquetas aplicados', 'Cerrar', { duration: 2000 });
            this.load();
          },
          error: () => this.snack.open('Error aplicando cambios en etiquetas', 'Cerrar', { duration: 3000 })
        });
    });
  }

  openTagManager(): void {
    const ref = this.dialog.open(TagManagerDialog, { width: '480px' });
    ref.afterClosed().subscribe(() => this.loadTags());
  }

  removeTagFromNote(note: Note, tagName: string): void {
    if (!note.id) return;
    if (!confirm(`¿Quitar etiqueta "${tagName}" de la nota?`)) return;
    const idKey = String(note.id);
    this.removing[idKey] = true;

    const idx = this.notes.findIndex(n => n.id === note.id);
    let prevTags: { id?: number; name: string }[] | undefined;
    if (idx >= 0) {
      prevTags = this.notes[idx].tags ? [...this.notes[idx].tags] : [];
      this.notes[idx].tags = (this.notes[idx].tags || []).filter(t => t.name !== tagName);
      this.notes = [...this.notes];
      this.cd.markForCheck();
    }

    this.noteService.removeTag(note.id, tagName).pipe(finalize(() => { this.removing[idKey] = false; })).subscribe({
      next: (updatedNote) => {
        if (updatedNote && idx >= 0) {
          this.notes[idx] = updatedNote;
          this.notes = [...this.notes];
          this.cd.markForCheck();
        }
        this.snack.open('Etiqueta removida', 'Cerrar', { duration: 2000 });
      },
      error: () => {
        if (idx >= 0 && typeof prevTags !== 'undefined') {
          this.notes[idx].tags = prevTags;
          this.notes = [...this.notes];
          this.cd.markForCheck();
        } else {
          this.load();
        }
        this.snack.open('No se pudo remover etiqueta (revirtiendo cambios)', 'Cerrar', { duration: 4000 });
      }
    });
  }

}
