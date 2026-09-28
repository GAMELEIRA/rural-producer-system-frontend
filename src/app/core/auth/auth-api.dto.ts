import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';

/**
 * Contratos do backend (DTOs em português) e conversores para os modelos do front.
 * Mantém o restante da aplicação desacoplado do formato da API.
 */

/** POST /auth/cadastrar -> DadosCadastroUsuario */
export interface CadastroUsuarioDto {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone?: string;
  senha: string;
}

/** Resposta de /auth/cadastrar -> DadosDetalhamentoUsuario */
export interface DetalhamentoUsuarioDto {
  idUsuario: number;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataCadastro: string;
  ativo: boolean;
}

/** POST /auth/login -> DadosAutenticacao */
export interface AutenticacaoDto {
  email: string;
  senha: string;
}

/** Resposta de /auth/login -> DadosTokenJWT */
export interface TokenJwtDto {
  token: string;
  tipo: string;
  idUsuario: number;
  nome: string;
  email: string;
}

export function toCadastroDto(req: RegisterRequest): CadastroUsuarioDto {
  return {
    nome: req.firstName,
    sobrenome: req.lastName,
    email: req.email,
    cpf: req.cpf.replace(/\D/g, ''),
    telefone: req.phone?.trim() || undefined,
    senha: req.password,
  };
}

export function toAutenticacaoDto(req: LoginRequest): AutenticacaoDto {
  return { email: req.email, senha: req.password };
}

export function fromDetalhamentoDto(dto: DetalhamentoUsuarioDto): User {
  return { id: dto.idUsuario, firstName: dto.nome, lastName: dto.sobrenome, email: dto.email };
}

export function fromTokenJwtDto(dto: TokenJwtDto): LoginResponse {
  return {
    token: dto.token,
    user: { id: dto.idUsuario, firstName: dto.nome, lastName: '', email: dto.email },
  };
}
