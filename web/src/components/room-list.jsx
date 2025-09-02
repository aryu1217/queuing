// components/room-list.jsx
"use client";

import RoomCard from "./room-card";
import { DummyRooms } from "@/dummy-rooms";

export default function RoomList() {
  const handleJoin = (room) => {
    console.log("join", room.id);
    // TODO: router.push(`/r/${room.code}`) 등
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-5">
      {DummyRooms.map((room) => (
        <RoomCard key={room.id} room={room} onJoin={handleJoin} />
      ))}
    </div>
  );
}
