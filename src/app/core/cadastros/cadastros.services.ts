import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../config/api.config';
import { Cultura, Insumo, Produto, Talhao } from '../models/cadastros.model';
import { CrudApiService } from './crud-api.service';

export type CulturaInput = Omit<Cultura, 'idCultura'>;
export type TalhaoInput = Omit<Talhao, 'idTalhao'>;
export type InsumoInput = Omit<Insumo, 'idInsumo'>;
export type ProdutoInput = Omit<Produto, 'idProduto'>;

@Injectable({ providedIn: 'root' })
export class CulturaService extends CrudApiService<Cultura, CulturaInput> {
  protected readonly baseUrl = API_ENDPOINTS.culturas;
}

@Injectable({ providedIn: 'root' })
export class TalhaoService extends CrudApiService<Talhao, TalhaoInput> {
  protected readonly baseUrl = API_ENDPOINTS.talhoes;
}

@Injectable({ providedIn: 'root' })
export class InsumoService extends CrudApiService<Insumo, InsumoInput> {
  protected readonly baseUrl = API_ENDPOINTS.insumos;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService extends CrudApiService<Produto, ProdutoInput> {
  protected readonly baseUrl = API_ENDPOINTS.produtos;
}
