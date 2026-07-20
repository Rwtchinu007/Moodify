import { createContext, useState } from "react";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState(null);
  const [songs, setSongs] = useState([]); // FIX: New state for the full playlist
  const [loading, setLoading] = useState(false);

  return (
    <SongContext.Provider value={{ loading, setLoading, song, setSong, songs, setSongs }}>
      {children}
    </SongContext.Provider>
  );
};