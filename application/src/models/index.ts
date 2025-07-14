// --- ARQUIVO NOVO ---
// application/src/models/index.ts

/**
 * Este é um "barrel file". Ele re-exporta todos os modelos e interfaces
 * de um único ponto, simplificando as importações em outras partes da aplicação.
 * Agora, em vez de importar cada modelo individualmente, podemos fazer:
 * import { ICourse, IUser } from "@/models";
 */

import Course, { ICourse } from "./Course.model";
import Locker, { ILocker } from "./Locker.model";
import Rental, { IRental } from "./Rental.model";
import Student, { IStudent } from "./Student.model";
import User, { IUser } from "./User.model";

export { Course, Locker, Rental, Student, User };

export type { ICourse, ILocker, IRental, IStudent, IUser };
