"use client";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
require("dotenv").config();

export default function Home() {
  const [gifs, setGifs] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("funny");
  const debouncedQuery = useDebounce(query, 800);

  useEffect(() => {
    const fetchGifs = async () => {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIFY_API_KEY}&q=${query}&limit=25&offset=0&lang=en&bundle=messaging_non_clips`
      );
      const jsonRes = await res.json();
      console.log(jsonRes);
      const data = jsonRes.data;
      const sortedData = data.sort((a: any, b: any) => {
        if (new Date(a.import_datetime) > new Date(b.import_datetime)) return 1;
        else if (new Date(a.import_datetime) < new Date(b.import_datetime))
          return -1;
        else return 0;
      });
      console.log("s", sortedData);
      const noUserData = sortedData.filter((gif: any) => {
        if (!gif.hasOwnProperty("username")) return false;
        else return gif.username.length !== 0;
      });
      console.log("n", noUserData);
      const gifs = noUserData.map((gif: any) => gif.images.original.url);
      setGifs(gifs);
    };
    fetchGifs();
  }, [debouncedQuery]);

  return (
    <main className="h-screen w-screen flex flex-col gap-2 items-center justify-start">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        className="h-8"
      />

      <ul className="h-full w-full flex flex-wrap gap-2">
        {gifs.map((gif) => (
          <li key={gif} className="w-[24vw]">
            <img src={gif} className="w-full h-full" />
          </li>
        ))}
      </ul>
    </main>
  );
}
