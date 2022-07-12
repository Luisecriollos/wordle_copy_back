import mongoose, { Model } from 'mongoose';
import { User } from '../models/User';

export enum E_TABLES {
  USER = 'USER',
}

export const TABLE_MAP: { [table: string]: Model<any> } = {
  USER: User,
};
interface IPopulateOption<T> {
  field: keyof T;
  select: string;
}

interface ITermOption {
  field: string;
  term: string;
}
export interface IQueryOptions<T> {
  sort?: string;
  filter?: mongoose.FilterQuery<T>;
  populate?: IPopulateOption<T>[];
  search?: ITermOption;
}
