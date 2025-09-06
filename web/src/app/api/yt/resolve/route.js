function extractYouTubeVideoId(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      // https://youtu.be/VIDEOID
      return u.pathname.split("/")[1]?.split("?")[0] || null;
    }

    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;

      const parts = u.pathname.split("/").filter(Boolean);
      // /shorts/VIDEOID | /embed/VIDEOID | /live/VIDEOID
      if (parts.length >= 2 && ["shorts", "embed", "live"].includes(parts[0])) {
        return parts[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  const { url } = await req.json();
  if (!url) {
    return Response.json({ error: "url 필드는 필수입니다." }, { status: 400 });
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return Response.json(
      { error: "유효한 유튜브 링크가 아닙니다." },
      { status: 400 }
    );
  }

  // 필요 시 여기서 YouTube Data API로 메타 정보 보강 가능
  return Response.json({ provider: "youtube", videoId });
}
