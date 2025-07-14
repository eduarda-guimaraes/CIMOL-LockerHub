// application/src/types/index.ts
export interface UserSession {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "coordinator";
}
