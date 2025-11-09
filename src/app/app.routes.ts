import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/components/notes-list/notes-list')
        .then(m => m.NotesList)
  },
  {
    path: 'notes/archived',
    loadComponent: () =>
      import('./features/notes/components/archived-notes-list/archived-notes-list')
        .then(m => m.ArchivedNotesList)
  },
  { path: '', redirectTo: 'notes', pathMatch: 'full' },
  { path: '**', redirectTo: 'notes' }
];
