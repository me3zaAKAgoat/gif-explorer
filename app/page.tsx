"use client";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";

interface Gif {
  import_datetime: string;
  username: string;
  images: {
    original: {
      url: string;
    };
  };
  [key: string]: any;
}

export default function Home() {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 800);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Gif | null>(null);

  const fetchGifs = useCallback(async (query: string) => {
    let response;

    if (!query) {
      response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.NEXT_PUBLIC_GIFY_API_KEY}&limit=25&offset=0&rating=g&bundle=messaging_non_clips`
      );
    } else {
      response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIFY_API_KEY}&q=${query}&limit=25&offset=0&lang=en&bundle=messaging_non_clips`
      );
    }

    if (!response.ok) {
      throw new Error("Failed to fetch gifs");
    }

    const jsonResponse = await response.json();
    const data: Gif[] = jsonResponse.data;

    return data
      .filter((gif) => gif.username && gif.username.length > 0)
      .sort(
        (a, b) =>
          new Date(a.import_datetime).getTime() -
          new Date(b.import_datetime).getTime()
      );
  }, []);

  useEffect(() => {
    const fetchAndSetGifs = async () => {
      try {
        const gifs = await fetchGifs(debouncedQuery);
        setGifs(gifs);
        setError(null);
      } catch (err) {
        setError("Failed to fetch gifs. Please try again later.");
      }
    };

    fetchAndSetGifs();
  }, [debouncedQuery]);

  return (
    <main className="h-full w-full flex flex-col gap-2 items-center justify-start pt-3">
      <div className="flex gap-5 px-4 py-3">
        <input
          type="text"
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-2 py-2 border border-black rounded-md"
          placeholder="Search for a gif..."
        />
      </div>
      {gifs.length === 0 && !error && (
        <p className="text-white font-bold">Loading</p>
      )}
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <ul className="h-full w-full flex flex-wrap justify-center gap-2 py-10  pb-12">
        {gifs.map((gif) => (
          <li
            key={gif.images.original.url}
            className={`flex w-[40vw] sm:w-[22vw] ${
              gif === selected ? "w-[82vw] sm:w-[89.5vw]" : ""
            }`}
          >
            <img
              src={gif.images.original.url}
              className={`w-full h-full rounded-md cursor-pointer ${
                selected === gif ? "w-1/2 object-contain" : ""
              }`}
              alt="gif"
              onClick={() => {
                if (selected === gif) {
                  setSelected(null);
                } else setSelected(gif);
              }}
            />
            {selected === gif && (
              <div className="flex flex-col justify-between items-start w-1/2 p-4">
                <button
                  onClick={() => setSelected(null)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md sm:text-2xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gif.images.original.url);
                    alert("Copied to clipboard");
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md sm:text-2xl"
                >
                  Copy GIF URL
                </button>
                <button
                  onClick={() => {
                    setQuery(gif.title);
                  }}
                  className="bg-green-500 text-white px-2 py-1 rounded-md sm:text-2xl"
                >
                  Search for similar GIFs
                </button>
                <div>
                  <label className="text-white sm:text-2xl font-bold">
                    Username:
                  </label>
                  <p className="text-white sm:text-2xl">{gif.username}</p>
                </div>
                <div>
                  <label className="text-white sm:text-2xl font-bold">
                    Imported on:
                  </label>
                  <p className="text-white sm:text-2xl">
                    {new Date(gif.import_datetime).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
