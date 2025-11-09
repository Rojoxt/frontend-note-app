import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface Note {
  id?: number;
  title: string;
  content: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Añadir tags que vienen del backend (Fase 2)
  tags?: { id?: number; name: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class NoteService  {

  private apiUrl = 'https://backend-notes-system-production.up.railway.app/api/notes';

  constructor(private http: HttpClient) {}

  listActive(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/active`);
  }

  listArchived(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/archived`);
  }

  create(note: Pick<Note, 'title' | 'content'>): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }

  update(id: number, note: Partial<Note>): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  toggleArchive(id: number): Observable<Note> {
    // El backend expone este endpoint con @PatchMapping, por eso hay que usar PATCH
    return this.http.patch<Note>(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTag(noteId: number, tagName: string): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/${noteId}/tags`, { name: tagName });
  }

  filterByTag(tagName: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/tag/${encodeURIComponent(tagName)}`);
  }

  //soporte para eliminar etiqueta de una nota.
  removeTag(noteId: number, tagName: string): Observable<Note> {
    return this.http.delete<Note>(`${this.apiUrl}/${noteId}/tags/${encodeURIComponent(tagName)}`);
  }

}
