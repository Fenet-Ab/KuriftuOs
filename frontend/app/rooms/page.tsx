import RoomPage, { type RoomInventory } from "../pages/room";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default async function RoomsRoutePage() {
  let stats: RoomInventory | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/rooms/stats`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      stats = (await res.json()) as RoomInventory;
    }
  } catch {
    stats = null;
  }

  return (
    <main>
      <RoomPage stats={stats} />
    </main>
  );
}
