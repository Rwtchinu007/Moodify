import { getSong } from "../services/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
    const context = useContext(SongContext);
    const { loading, setLoading, song, setSong, songs, setSongs } = context;

    async function handleGetSong({ mood }) {
        setLoading(true);
        try {
            const data = await getSong({ mood });
            setSong(data.song);          // Sets the currently playing song
            setSongs(data.songs || []);  // FIX: Stores the full playlist
        } catch (error) {
            console.error("Failed to fetch songs", error);
        } finally {
            setLoading(false);
        }
    }

    // FIX: Exporting 'songs' and 'setSong' for the UI to use
    return { loading, song, setSong, songs, handleGetSong }; 
};