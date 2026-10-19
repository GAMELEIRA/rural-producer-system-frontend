import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export interface Safra { idSafra: number; nome: string; dataInicio: string; dataFim: string; status: string; observacoes?: string; totalPlantacoes: number; }
export interface Plantacao { idPlantacao: number; idTalhao: number; nomeTalhao: string; idCultura: number; nomeCultura: string; idSafra: number; nomeSafra: string; dataPlantio: string; dataColheita?: string; quantidadePlantada: number; quantidadeColhida?: number; status: string; observacoes?: string; }
export type SafraInput = Pick<Safra, 'nome'|'dataInicio'|'dataFim'> & { status?: string; observacoes?: string };
export type PlantacaoInput = Pick<Plantacao, 'idTalhao'|'idCultura'|'idSafra'|'dataPlantio'|'quantidadePlantada'> & { observacoes?: string };
@Injectable({ providedIn: 'root' })
export class ProducaoService {
  private readonly http = inject(HttpClient);
  private readonly root = environment.apiUrl;
  listarSafras() { return this.http.get<Safra[]>(`${this.root}/safras`); }
  criarSafra(dados: SafraInput) { return this.http.post<Safra>(`${this.root}/safras`, dados); }
  finalizarSafra(id: number) { return this.http.patch<Safra>(`${this.root}/safras/${id}/finalizar`, {}); }
  excluirSafra(id: number) { return this.http.delete<void>(`${this.root}/safras/${id}`); }
  listarPlantacoes() { return this.http.get<Plantacao[]>(`${this.root}/plantacoes`); }
  criarPlantacao(dados: PlantacaoInput) { return this.http.post<Plantacao>(`${this.root}/plantacoes`, dados); }
  excluirPlantacao(id: number) { return this.http.delete<void>(`${this.root}/plantacoes/${id}`); }
  finalizarColheita(id: number, dados: { dataColheita: string; quantidadeColhida: number; idProduto: number | null; unidadeNovoProduto?: string; precoVendaNovoProduto?: number }) {
    return this.http.patch<Plantacao>(`${this.root}/plantacoes/${id}/finalizar-colheita`, dados);
  }
}
