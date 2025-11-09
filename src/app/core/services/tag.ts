import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


export interface Tag {
  id?: number;
  name: string;
}
@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiUrl = 'https://backend-notes-system-production.up.railway.app/api/tags';

  constructor(private http: HttpClient) {}

  list(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  create(tag: Pick<Tag, 'name'>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
