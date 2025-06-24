import { Schema, model, Document, Types } from 'mongoose';

export interface ILocker extends Document {
  numero: string;
  localizacao: string;
  status: 'livre' | 'ocupado' | 'manutencao';
  curso_id: Types.ObjectId;
}

const LockerSchema = new Schema<ILocker>({
  numero: { type: String, required: true, unique: true },
  localizacao: { type: String, required: true },
  status: { type: String, enum: ['livre', 'ocupado', 'manutencao'], default: 'livre' },
  curso_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true }
});

export const Locker = model<ILocker>('Locker', LockerSchema);
