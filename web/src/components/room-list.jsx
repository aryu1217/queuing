// components/room-list.jsx
"use client";

import RoomCard from "./room-card";
import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/lib/fetchRooms";
import Spinner from "./ui/spinner";

export default function RoomList() {
  const {
    data: rooms = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    staleTime: 10_000,
  });

  const handleJoin = (room) => {
    console.log("join", room.id);
    // router.push(`/room/${room.code}`)
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4 pt-5">
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="pt-5 px-4 text-rose-600">
        방 목록을 불러오지 못했어요: {String(error?.message || error)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-5 px-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onJoin={handleJoin} />
      ))}
    </div>
  );
}
