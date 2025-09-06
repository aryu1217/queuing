import QueueList from "@/components/room/queue/queue-list";
import ParticipantList from "@/components/room/right-section/participant-list";
import TopBar from "@/components/room/top-bar";
import YoutubePlayer from "@/components/room/youtube-player";

export default function Room({ params }) {
  return (
    <div className="bg-white text-[#17171B] min-h-screen flex flex-col">
      <TopBar />

      {/* 본문 영역 */}
      <main
        className="
          flex-1 p-4 grid gap-4
          grid-cols-1
          lg:grid-cols-[minmax(240px,320px)_1fr_minmax(220px,280px)]
        "
      >
        {/* Left: Queue */}
        <aside className="order-2 lg:order-1 w-full min-w-0">
          <QueueList />
        </aside>

        {/* Center: Player */}
        <section className="order-1 lg:order-2 w-full min-w-0 flex justify-center">
          <div className="w-full max-w-[960px]">
            <YoutubePlayer />
          </div>
        </section>

        {/* Right: Participants */}
        <aside className="order-3 lg:order-3 w-full min-w-0">
          <ParticipantList />
        </aside>
      </main>
    </div>
  );
}
