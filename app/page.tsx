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
}

export default function Home() {
  const [gifs, setGifs] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 800);
  const [error, setError] = useState<string | null>(null);

  const fetchGifs = useCallback(async (query: string): Promise<string[]> => {
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
      )
      .map((gif) => gif.images.original.url);
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

    // if (debouncedQuery) {
    fetchAndSetGifs();
    // }
  }, [debouncedQuery]);

  return (
    <main className="h-full w-full flex flex-col gap-2 items-center justify-start py-3 pb-12">
      <div className="flex gap-5 px-4">
        <label htmlFor="search" className="font-bold">
          Search for gifs:
        </label>
        <input
          type="text"
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-2 border border-black rounded-md"
          placeholder="Type your search term..."
        />
      </div>
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <ul className="h-full w-full flex flex-wrap justify-center gap-2 py-10 bg-gray-500">
        {gifs.map((gif) => (
          <li key={gif} className="w-[40vw] sm:w-[22vw]">
            <img src={gif} className="w-full h-full rounded-md" alt="gif" />
          </li>
        ))}
      </ul>
    </main>
  );
}
