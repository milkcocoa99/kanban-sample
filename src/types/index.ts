export type ColumnId = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  columnId: ColumnId;
  orderIndex: number;
}

export interface Column {
  id: ColumnId;
  label: string;
}