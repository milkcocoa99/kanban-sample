import KanbanBoard from "../components/KanbanBoard";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Kanbanボード</h1>
      <KanbanBoard />
    </main>
  );
}