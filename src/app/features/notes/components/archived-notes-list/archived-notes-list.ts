import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Note, NoteService} from '../../../../core/services/note';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-archived-notes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule],
  templateUrl: './archived-notes-list.html',
  styleUrls: ['./archived-notes-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivedNotesList implements OnInit {
  notes: Note[] = [];
  loading = false;

  constructor(private noteService: NoteService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.noteService.listArchived().subscribe({
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

  restore(note: Note): void {
    if (note.id !== undefined) {
      this.noteService.toggleArchive(note.id).subscribe(() => this.load());
    }
  }

  delete(note: Note): void {
    if (!confirm('¿Eliminar nota archivada? Esta acción es irreversible.')) return;
    if (note.id !== undefined) {
      this.noteService.delete(note.id).subscribe(() => this.load());
    }
  }
}
