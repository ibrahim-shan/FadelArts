import { Schema, model, models } from 'mongoose';

export interface AdminDoc {
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin = models.Admin || model<AdminDoc>('Admin', AdminSchema);

