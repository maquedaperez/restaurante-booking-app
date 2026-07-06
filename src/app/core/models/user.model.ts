export interface User {
  token: string;
  expiration: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  userBusinessUnitRelationship: number;
  userId: number;
  userCompany: string;
  preferencias?: string;
  cumpleanos?: string;
  alergias?: string;
}

export interface AuthRequest {
  company: number;
  businessUnit: number;
  username: string;
  password: string;
  theme: string;
  validationCode: string;
}

export interface ForgotRequest {
  company: number;
  businessUnit: number;
  username: string;
  password: string;
  theme: string;
  validationCode: string;
}

export interface GuestRegisterData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}
