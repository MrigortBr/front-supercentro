export type ActivityStatus = 'Projetado' | 'Planejado' | 'Em andamento' | 'Concluído';

export type InstitutionStatus =
  | 'Não iniciado'
  | 'Em andamento'
  | 'Concluído'
  | 'Atrasado'
  | 'Pendente';

export interface Activity {
  name: string;
  responsible: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
}

export interface Institution {
  id: number;
  name: string;
  state: string;
  responsible: string;
  status: InstitutionStatus;
  observations: string;
  activities: Activity[];
}

export type ViewType = 'list' | 'gantt';
