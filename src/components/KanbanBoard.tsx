"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Column, ColumnId } from "../types";
import { COLUMNS, COLUMN_IDS, INITIAL_TASKS } from "../constants";

function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
    </div>
  );
}

function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-64">
      <div className="bg-gray-100 rounded-t-lg px-3 py-2 border border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">{column.label}</p>
          <span className="text-xs font-bold text-gray-500">{tasks.length}</span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-96 p-2 rounded-b-lg border border-t-0 border-gray-200 transition-colors ${
          isOver ? "bg-blue-50" : "bg-gray-50"
        }`}
      >
        <div className="space-y-2">
          <SortableContext
            id={column.id}
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // タスクが属するカラムIDを返す
  const findColumnId = (id: string): ColumnId | null => {
    // カラムIDそのものなら返す
    if (COLUMN_IDS.includes(id as ColumnId)) return id as ColumnId;
    // カードIDならそのカードが属するカラムIDを返す
    return tasks.find((t) => t.id === id)?.columnId ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // カラム間移動はonDragOverで処理する
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, delta } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnId(activeId);
    const overColumnId = findColumnId(overId);

    if (!activeColumnId || !overColumnId) return;
    if (activeColumnId === overColumnId) return;

    setTasks((prev) => {
      const overItems = prev.filter((t) => t.columnId === overColumnId);

      const overIndex = overItems.findIndex((t) => t.id === overId);

      // 挿入位置を計算
      const newIndex = (() => {
        const putOnLastItem =
          overIndex === overItems.length - 1 && delta.y > 0;
        const modifier = putOnLastItem ? 1 : 0;
        return overIndex >= 0
          ? overIndex + modifier
          : overItems.length + 1;
      })();

      return prev.map((t) => {
        if (t.id === activeId) {
          return { ...t, columnId: overColumnId, orderIndex: newIndex };
        }
        return t;
      });
    });
  };

  // 同一カラム内の並び替えはonDragEndで処理する
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnId(activeId);
    const overColumnId = findColumnId(overId);

    if (!activeColumnId || !overColumnId) return;
    if (activeColumnId !== overColumnId) return;

    const columnTasks = tasks
      .filter((t) => t.columnId === activeColumnId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const newIndex = columnTasks.findIndex((t) => t.id === overId);

    if (oldIndex === newIndex) return;

    const reordered = arrayMove(columnTasks, oldIndex, newIndex).map(
      (t, i) => ({ ...t, orderIndex: i })
    );

    setTasks((prev) => {
      const others = prev.filter((t) => t.columnId !== activeColumnId);
      return [...others, ...reordered];
    });
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks
              .filter((t) => t.columnId === column.id)
              .sort((a, b) => a.orderIndex - b.orderIndex)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-lg w-64">
            <p className="text-sm font-medium text-gray-800">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}