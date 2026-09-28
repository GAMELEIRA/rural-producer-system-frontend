import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Base para serviços CRUD REST no padrão do backend:
 *   GET    /recurso        -> T[]
 *   GET    /recurso/{id}   -> T
 *   POST   /recurso        -> T (201)
 *   PUT    /recurso/{id}   -> T
 *   DELETE /recurso/{id}   -> 204
 */
export abstract class CrudApiService<T, TInput> {
  protected readonly http = inject(HttpClient);

  protected abstract readonly baseUrl: string;

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(payload: TInput): Observable<T> {
    return this.http.post<T>(this.baseUrl, payload);
  }

  update(id: number, payload: TInput): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
