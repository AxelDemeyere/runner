export interface Player {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  job: string;
  score: number;
  lives: number;
  gameDate?: Date;
  winner: number;
}
