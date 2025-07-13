// --- ARQUIVO NOVO ---
// application/src/lib/api.ts

import axios from "axios";

/**
 * Instância centralizada do Axios para todas as chamadas à API interna.
 * O AuthContext será responsável por injetar o token de autorização aqui.
 */
const api = axios.create({
  // Podemos definir uma baseURL se todas as nossas rotas de API
  // estivessem sob um prefixo comum, mas no nosso caso,
  // elas estão na raiz /api, então não é estritamente necessário.
  // baseURL: '/api',
});

export default api;
