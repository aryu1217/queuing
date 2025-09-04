import QueueList from "@/components/room/queue/queue-list";
import ParticipantList from "@/components/room/right-section/participant-list";
import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";

export default function Room({ params }) {
  return (
    <div className="bg-white text-[#17171B] min-h-screen flex flex-col">
      <TopBar />

      {/* 본문 영역 */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-[320px_1fr_280px] gap-4">
        {/* Left: Queue */}
        <aside className="order-2 md:order-1">
          <QueueList />
        </aside>

        {/* Center: Player */}
        <section className="order-1 md:order-2 flex justify-center">
          <div className="w-full max-w-[960px]">
            <YoutubePlayer />
          </div>
        </section>

        {/* Right: Participants */}
        <aside className="order-3 md:order-3">
          <ParticipantList />
        </aside>
      </main>
    </div>
  );
}
