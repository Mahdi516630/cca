export interface Referee {
  id: string;
  name: string;
  phone?: string;
  grade?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  centralFee: number;
  assistantFee: number;
  fourthFee: number;
}

export interface Designation {
  id: string;
  categoryId: string;
  centralId: string;
  assistant1Id: string;
  assistant2Id: string;
  fourthId: string;
  date: string;
  teamA: string;
  teamB: string;
  matchNumber: string;
  startTime: string;
  endTime: string;
  terrain?: string;
  assessor?: string;
}
