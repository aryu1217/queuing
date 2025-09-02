"use client";

import Header from "@/components/header";
import RoomList from "@/components/room-list";
import { useMyProfile } from "@/hooks/useMyProfile";
import Cookies from "js-cookie";

export default function MainPage() {
  const { data: profile, isLoading, isError, error } = useMyProfile();

  if (isLoading) return <div className="p-6">로딩…</div>;
  if (isError)
    return <div className="p-6 text-red-500">에러: {error.message}</div>;

  // 로그인하지 않았거나 프로필이 없으면 profile이 null일 수 있음
  return (
    <div className="bg-[#FFFAFA] h-screen p-6 text-[#17171B]">
      <Header />
      <RoomList />
    </div>
  );
}
