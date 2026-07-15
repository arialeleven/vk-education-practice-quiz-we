"use client";
import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import type { StateMessage } from "@/lib/game";

export function usePartyGame(roomCode: string) {
  const [state, setState] = useState<StateMessage | null>(null);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: roomCode,
    });
    socket.addEventListener("message", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "state") setState(data as StateMessage);
      } catch {}
    });
    socketRef.current = socket;
    return () => socket.close();
  }, [roomCode]);

  const send = (msg: unknown) => socketRef.current?.send(JSON.stringify(msg));
  return { state, send };
}
