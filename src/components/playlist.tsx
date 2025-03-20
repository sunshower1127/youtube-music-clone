import { removePlaylist as removeFirebasePlaylist } from "@/firebase/firebase";
import { useStore } from "@/zustand/store";
import { useState } from "react";
import { PlaylistTable } from "./playlist-table";

export default function Playlist() {
  const playlists = useStore((state) => state.playlists);
  const currentPlaylist = useStore((state) => state.currentPlaylist);
  const { setCurrentPlaylist, removePlaylist, shuffleCurrentPlaylist, refresh } = useStore((state) => state.actions);
  const [selectedPlaylist, setSelectedPlaylist] = useState(currentPlaylist || "All");

  const deletePlaylist = async () => {
    if (selectedPlaylist === "All") return;
    if (!window.confirm(`Are you sure you want to delete "${selectedPlaylist}"?`)) {
      return;
    }
    removePlaylist(selectedPlaylist);
    removeFirebasePlaylist(selectedPlaylist);
    setCurrentPlaylist("All");
    setSelectedPlaylist("All");
  };

  return (
    <div className="flex flex-col items-center gap-2 border">
      <p>Playlists</p>
      <ul className="w-full p-2">
        {Array.from(playlists.keys()).map((playlist) => (
          <li className="border p-1" key={playlist}>
            <div className="w-full text-sm" onClick={() => setSelectedPlaylist(playlist)} style={{ fontWeight: playlist === selectedPlaylist ? "bold" : "normal" }}>
              {playlist}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between w-full p-2 items-center">
        <button
          className="text-4xl"
          onClick={() => {
            setCurrentPlaylist(selectedPlaylist);
          }}
        >
          ⏏️
        </button>
        <button className="text-4xl" onClick={shuffleCurrentPlaylist}>
          🔀
        </button>
        <button className="text-4xl" onClick={refresh}>
          🔄
        </button>
        <button className="text-4xl" onClick={deletePlaylist}>
          ⛔️
        </button>
      </div>
      <PlaylistTable selectedPlaylist={selectedPlaylist} />
    </div>
  );
}
