import { Column, ColumnId } from "../types";

export const COLUMNS: Column[] = [
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export const COLUMN_IDS: ColumnId[] = COLUMNS.map((c) => c.id);

export const INITIAL_TASKS = [
  { id: "1", title: "タスク1", columnId: "todo" as ColumnId, orderIndex: 0 },
  { id: "2", title: "タスク2", columnId: "todo" as ColumnId, orderIndex: 1 },
  { id: "3", title: "タスク3", columnId: "in_progress" as ColumnId, orderIndex: 0 },
  { id: "4", title: "タスク4", columnId: "done" as ColumnId, orderIndex: 0 },
];