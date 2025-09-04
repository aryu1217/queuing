import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";

export default function Room({ params }) {
  return (
    <div className="bg-[#FFFFFF] h-screen text-[#17171B]">
      <TopBar />
      <YoutubePlayer />
    </div>
  );
}
