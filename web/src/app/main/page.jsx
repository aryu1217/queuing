"use client";

import Header from "@/components/header";
import RoomList from "@/components/room-list";
import CreateRoom from "@/components/topbar/create-room";
import SortButton from "@/components/topbar/sort-button";
import TagBar from "@/components/topbar/tag-bar";
import TopBar from "@/components/topbar/top-bar";
import Spinner from "@/components/ui/spinner";
import { useMyProfile } from "@/hooks/useMyProfile";
import Cookies from "js-cookie";

export default function MainPage() {
  const { data: profile, isLoading, isError, error } = useMyProfile();

  if (isLoading) return <Spinner />;
  if (isError)
    return <div className="p-6 text-red-500">에러: {error.message}</div>;

  // 로그인하지 않았거나 프로필이 없으면 profile이 null일 수 있음
  return (
    <div className="bg-[#FFFFFF] h-screen p-6 text-[#17171B]">
      <Header />
      <div className="justify-between flex">
        <TagBar />
        <div className="flex gap-2 items-center pt-5 mr-5">
          <SortButton />
          <CreateRoom />
        </div>
      </div>
      <RoomList />
    </div>
  );
}
