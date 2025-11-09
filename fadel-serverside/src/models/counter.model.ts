import { Schema, model, models } from 'mongoose';

export interface CounterDoc {
  key: string;
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  key: { type: String, unique: true, index: true, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = models.Counter || model<CounterDoc>('Counter', CounterSchema);

