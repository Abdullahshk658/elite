import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatPKR = (value: number) => `PKR ${value.toLocaleString('en-PK')}`;
