import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const KEY_PREFIX = 'mgr.mock.';

type Entity = Record<string, unknown>;

/**
 * Coleções genéricas em localStorage para simular os endpoints CRUD do backend.
 * Cada coleção é identificada pelo nome do recurso e pelo nome do campo de id
 * (ex.: 'culturas' / 'idCultura').
 */
@Injectable({ providedIn: 'root' })
export class MockCollectionStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  list(resource: string): Entity[] {
    return this.load(resource);
  }

  find(resource: string, idField: string, id: number): Entity | undefined {
    return this.load(resource).find((item) => item[idField] === id);
  }

  create(resource: string, idField: string, payload: Entity): Entity {
    const items = this.load(resource);
    const nextId = items.reduce((max, item) => Math.max(max, Number(item[idField]) || 0), 0) + 1;
    const created = { [idField]: nextId, ...payload };
    items.push(created);
    this.save(resource, items);
    return created;
  }

  update(resource: string, idField: string, id: number, payload: Entity): Entity | undefined {
    const items = this.load(resource);
    const index = items.findIndex((item) => item[idField] === id);
    if (index < 0) return undefined;
    items[index] = { ...items[index], ...payload, [idField]: id };
    this.save(resource, items);
    return items[index];
  }

  remove(resource: string, idField: string, id: number): boolean {
    const items = this.load(resource);
    const remaining = items.filter((item) => item[idField] !== id);
    if (remaining.length === items.length) return false;
    this.save(resource, remaining);
    return true;
  }

  private load(resource: string): Entity[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(KEY_PREFIX + resource);
    return raw ? (JSON.parse(raw) as Entity[]) : [];
  }

  private save(resource: string, items: Entity[]): void {
    if (this.isBrowser) localStorage.setItem(KEY_PREFIX + resource, JSON.stringify(items));
  }
}
