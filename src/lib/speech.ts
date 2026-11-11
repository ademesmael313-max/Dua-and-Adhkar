import { useCallback, useEffect, useRef, useState } from "react";

const splitForSpeech = (text: string): string[] => {
  const clean = text.replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();
  const parts = clean.split(/(?<=[.؟!،])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const part of parts) {
    if ((current + " " + part).trim().length > 180) {
      if (current) chunks.push(current.trim());
      current = part;
    } else {
      current = `${current} ${part}`;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [clean];
};

export const useRecitation = (text: string) => {
  const [speaking, setSpeaking] = useState(false);
  const supported = useRef(
    typeof window !== "undefined" && "speechSynthesis" in window,
  ).current;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback((): boolean => {
    if (!supported) return false;
    window.speechSynthesis.cancel();
    const chunks = splitForSpeech(text);
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("ar")) ??
      voices.find((v) => /arab/i.test(v.name));
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = "ar-SA";
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.rate = 0.82;
      utterance.pitch = 1;
      if (index === chunks.length - 1) {
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
      }
      window.speechSynthesis.speak(utterance);
    });
    setSpeaking(true);
    return true;
  }, [supported, text]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
};
