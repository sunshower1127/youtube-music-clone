import { useStore } from "@/zustand/store";
import { useCallback } from "react";
import { Button } from "./ui/button";

export default function MusicPlayer() {
  const playlists = useStore((state) => state.playlists);
  const currentPlaylist = useStore((state) => state.currentPlaylist);
  const currentMusic = useStore((state) => state.currentMusic);
  const { prevMusic, nextMusic, shuffleCurrentPlaylist } = useStore((state) => state.actions);

  let [author, title, thumbnail] = ["", "", ""];
  if (currentPlaylist) {
    const music = playlists.get(currentPlaylist)?.[currentMusic];
    if (music) {
      author = music.author;
      title = music.title;
      thumbnail = music.thumbnail!;
    }
  }

  const url = `https://ytmdl-music-server.vercel.app/api?author=${author}&title=${title}`;

  const handleRef = useCallback(
    (audioElement: HTMLAudioElement) => {
      if (audioElement === null) return; // 이걸 꼭 추가해줘야함(이유는 모르겠음)
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: author,
          artwork: [{ src: thumbnail || "", type: "image/webp" }],
        });

        navigator.mediaSession.setActionHandler("previoustrack", prevMusic);
        navigator.mediaSession.setActionHandler("nexttrack", nextMusic);
        navigator.mediaSession.setActionHandler("play", () => audioElement.play()); // audioElement.play 만 넣어주면 에러남. play안에 있는 this쪽에서 문제 생기는듯.
        navigator.mediaSession.setActionHandler("pause", () => audioElement.pause());
      }
    },
    [author, nextMusic, prevMusic, thumbnail, title]
  );

  return (
    <div
      className="flex justify-end flex-col items-center aspect-square w-full"
      style={{
        backgroundImage: thumbnail ? `url(${encodeURI(thumbnail)})` : undefined, // 안해주면 띄어쓰기 있는 애들한테 에러남
        backgroundSize: "cover",
      }}
    >
      <div className="relative">
        <p className="relative mix-blend-difference font-serif">{currentPlaylist}</p>
        <button className="absolute top-0 -right-7 text-lg" onClick={shuffleCurrentPlaylist}>
          🔀
        </button>
      </div>
      <div className="flex flex-row w-full justify-between items-center mix-blend-difference">
        <Button variant="ghost" className="" onClick={prevMusic}>
          {"<<"}
        </Button>

        <p className="mix-blend-difference font-serif">
          {author} - {title}
        </p>
        <Button className="mix-blend-difference" variant="ghost" onClick={nextMusic}>
          {">>"}
        </Button>
      </div>
      <audio ref={handleRef} autoPlay controls src={url} onEnded={nextMusic} />
    </div>
  );
}
