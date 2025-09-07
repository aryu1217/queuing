// src/lib/joinRoom.js
export async function joinRoom({ code, password }) {
  const res = await fetch("/api/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "입장 실패");
  return json; // { room, member, alreadyJoined? }
}
