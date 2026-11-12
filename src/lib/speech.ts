import { useCallback, useEffect, useRef, useState } from "react";
import { androidSpeak, androidStopSpeaking, isAndroidApp } from "./native";

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

export const useRecitation = (text: string, onError?: () => void) => {
  const [speaking, setSpeaking] = useState(false);
  const errorRef = useRef(onError);
  const native = useRef(isAndroidApp()).current;
  const supported = useRef(
    native || (typeof window !== "undefined" && "speechSynthesis" in window),
  ).current;

  const stop = useCallback(() => {
    if (native) {
      androidStopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [native, supported]);

  const speak = useCallback((): boolean => {
    if (native) {
      androidStopSpeaking();
      androidSpeak(text);
      setSpeaking(true);
      return true;
    }
    if (!supported) return false;
    window.speechSynthesis.cancel();
    const chunks = splitForSpeech(text);
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("ar")) ??
      voices.find((v) => /arab/i.test(v.name));
    // Browsers without an Arabic voice accept the utterance and stay silent, so
    // watch for the first "start" event and report a failure when it never comes.
    let started = false;
    const watchdog = window.setTimeout(() => {
      if (started) return;
      window.speechSynthesis.cancel();
      setSpeaking(false);
      errorRef.current?.();
    }, 2500);

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = "ar-SA";
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.rate = 0.82;
      utterance.pitch = 1;
      if (index === 0) {
        utterance.onstart = () => {
          started = true;
          window.clearTimeout(watchdog);
        };
      }
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          window.clearTimeout(watchdog);
          setSpeaking(false);
        };
        utterance.onerror = () => {
          window.clearTimeout(watchdog);
          setSpeaking(false);
          errorRef.current?.();
        };
      }
      window.speechSynthesis.speak(utterance);
    });
    setSpeaking(true);
    return true;
  }, [native, supported, text]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  // The native TTS engine reports completion and failures back through this hook.
  useEffect(() => {
    if (!native) return;
    const host = window as unknown as {
      NoorTtsEnded?: () => void;
      NoorTtsError?: () => void;
    };
    host.NoorTtsEnded = () => setSpeaking(false);
    host.NoorTtsError = () => {
      setSpeaking(false);
      errorRef.current?.();
    };
    return () => {
      delete host.NoorTtsEnded;
      delete host.NoorTtsError;
      androidStopSpeaking();
    };
  }, [native]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
};
