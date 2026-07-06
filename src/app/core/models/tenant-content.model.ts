export interface PlatoCarta {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface CategoriaCarta {
  categoria: string;
  platos: PlatoCarta[];
}

export interface MenuEspecial {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface Opinion {
  autor: string;
  texto: string;
  rating: number;
}

export interface EventoRestaurante {
  nombre: string;
  fecha: string;
  descripcion: string;
}
