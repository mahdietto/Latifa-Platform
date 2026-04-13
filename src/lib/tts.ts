// French Text-to-Speech utility with word boundary tracking

export interface TTSCallbacks {
  onEnd?: () => void;
  onWordBoundary?: (charIndex: number, charLength: number) => void;
  rate?: number;
}

export function speak(text: string, onEndOrCallbacks?: (() => void) | TTSCallbacks) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const callbacks: TTSCallbacks = typeof onEndOrCallbacks === "function"
    ? { onEnd: onEndOrCallbacks }
    : onEndOrCallbacks || {};

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = callbacks.rate ?? 0.9;

  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.startsWith("fr"));
  if (frVoice) utterance.voice = frVoice;

  if (callbacks.onEnd) utterance.onend = callbacks.onEnd;

  if (callbacks.onWordBoundary) {
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        callbacks.onWordBoundary!(event.charIndex, event.charLength);
      }
    };
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
