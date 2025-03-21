import { hexToHue } from "@/utils/color";
import { Music } from "@/utils/music";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useStore = create<{
  refreshTrigger: boolean;
  playlists: Map<string, Music[]>;
  currentPlaylist: string;
  currentMusic: number;
  actions: {
    refresh(): void;
    setPlaylist: (title: string, musics: Music[]) => void;
    removePlaylist: (title: string) => void;
    setCurrentPlaylist: (title: string) => void;
    setCurrentMusic: (index: number) => void;
    nextMusic: () => void;
    prevMusic: () => void;
    shuffleCurrentPlaylist: () => void;
    sortCurrentPlaylist: (sortType: "emotion" | "energy", order: "asc" | "desc") => void;
  };
}>()(
  devtools(
    persist(
      (set, get) => ({
        refreshTrigger: false,
        playlists: new Map(),
        currentPlaylist: "",
        currentMusic: 0,
        actions: {
          refresh: () => set((state) => ({ refreshTrigger: !state.refreshTrigger })),

          setPlaylist: (title, musics) => {
            musics = musics.map((music) => ({
              ...music,
              thumbnail: music.thumbnail || `https://ytmdl-music-server.vercel.app/api/thumbnail?author=${encodeURIComponent(music.author)}&title=${encodeURIComponent(music.title)}`,
              thumbnailHue: hexToHue(music.thumbnailColorcode || "000000"),
            }));
            set((state) => {
              const newPlaylists = new Map(state.playlists);
              newPlaylists.set(title, musics);
              return { playlists: newPlaylists };
            });
          },

          removePlaylist: (title) =>
            set((state) => {
              const newPlaylists = new Map(state.playlists);
              newPlaylists.delete(title);
              return { playlists: newPlaylists };
            }),

          setCurrentPlaylist: (title) => set({ currentPlaylist: title, currentMusic: 0 }),

          setCurrentMusic: (index) => set({ currentMusic: index }),

          nextMusic: () => {
            const state = get();
            const playlist = state.playlists.get(state.currentPlaylist);
            if (!playlist) return;

            let newIndex = state.currentMusic + 1;
            if (newIndex >= playlist.length) {
              newIndex = 0;
            }
            state.actions.setCurrentMusic(newIndex);
          },

          prevMusic: () => {
            const state = get();
            const playlist = state.playlists.get(state.currentPlaylist);
            if (!playlist) return;

            let newIndex = state.currentMusic - 1;
            if (newIndex < 0) {
              newIndex = playlist.length - 1;
            }
            state.actions.setCurrentMusic(newIndex);
          },

          shuffleCurrentPlaylist: () =>
            set((state) => {
              const playlist = state.playlists.get(state.currentPlaylist);
              if (!playlist) return {};

              const newPlaylist = [...playlist];
              for (let i = newPlaylist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newPlaylist[i], newPlaylist[j]] = [newPlaylist[j], newPlaylist[i]];
              }

              const newPlaylists = new Map(state.playlists);
              newPlaylists.set(state.currentPlaylist, newPlaylist);
              return { playlists: newPlaylists, currentMusic: 0 };
            }),

          sortCurrentPlaylist: (sortType, order) =>
            set((state) => {
              const playlist = state.playlists.get(state.currentPlaylist);
              if (!playlist) return {};

              const newPlaylist = [...playlist];
              newPlaylist.sort((a, b) => {
                const aValue = a.musicValue[sortType];
                const bValue = b.musicValue[sortType];
                return order === "asc" ? aValue - bValue : bValue - aValue;
              });

              const newPlaylists = new Map(state.playlists);
              newPlaylists.set(state.currentPlaylist, newPlaylist);
              return { playlists: newPlaylists, currentMusic: 0 };
            }),
        },
      }),
      {
        name: "ytmdl",
        partialize: ({ currentMusic, currentPlaylist }) => ({ currentMusic, currentPlaylist }), // 반드시 해줘야함
      }
    )
  )
);
