
export enum ModuleType {
  SORTING = 'Sorting Arena',
}

export enum AlgorithmStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum SortingMethod {
  BUBBLE = 'Bubble Sort',
  SELECTION = 'Selection Sort',
  INSERTION = 'Insertion Sort',
  QUICK = 'Quick Sort',
  MERGE = 'Merge Sort',
}

export interface SimulationStep {
  description: string;
  array?: number[]; 
  highlights?: number[]; 
  sortedIndices?: number[];
  completed?: boolean;
}
