"use client";

import useSWR from "swr";
import { getFetcher } from "@/services/fetcher";
import { useParams } from "next/navigation";

export default function CeremonyDetails() {
  const { id } = useParams();
  const { data } = useSWR(`/api/v1/ceremonies/${id}`, (url) => getFetcher(url));

  return <h1>{data?.label}</h1>;
}
