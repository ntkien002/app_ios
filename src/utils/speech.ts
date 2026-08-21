class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private rate: number = 1.0;
  private isSpeakingState: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  setRate(rate: number) {
    this.rate = Math.max(0.25, Math.min(2.0, rate));
  }

  getRate(): number {
    return this.rate;
  }

  async speak(text: string, customRate?: number): Promise<void> {
    const clean = text.trim();
    if (!clean) return;

    this.stop();
    const rateToUse = customRate ?? this.rate;

    // Try native Web Speech API first
    if (this.synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = rateToUse;
        utterance.pitch = 1.0;
        utterance.lang = "en-US";

        // Try to pick a good English voice if available
        const voices = this.synth.getVoices();
        const enVoice = voices.find(
          v => (v.lang === "en-US" || v.lang === "en-GB") && !v.name.includes("whisper")
        );
        if (enVoice) {
          utterance.voice = enVoice;
        }

        this.isSpeakingState = true;
        utterance.onend = () => {
          this.isSpeakingState = false;
        };
        utterance.onerror = () => {
          this.isSpeakingState = false;
          this.fallbackOnlineAudio(clean);
        };

        this.synth.speak(utterance);
        return;
      } catch (err) {
        console.warn("Web Speech API error, trying dictionary API fallback:", err);
      }
    }

    // Fallback to online dictionary audio
    await this.fallbackOnlineAudio(clean);
  }

  private async fallbackOnlineAudio(word: string): Promise<void> {
    try {
      const cleanWord = word.toLowerCase().trim().replace(/[^a-z0-9 -]/g, "");
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      let audioUrl = "";
      for (const entry of data) {
        if (Array.isArray(entry.phonetics)) {
          for (const ph of entry.phonetics) {
            if (ph.audio && typeof ph.audio === "string" && ph.audio.startsWith("http")) {
              audioUrl = ph.audio;
              break;
            }
          }
        }
        if (audioUrl) break;
      }

      if (audioUrl) {
        if (!this.audioEl) {
          this.audioEl = new Audio();
        }
        this.audioEl.src = audioUrl;
        this.audioEl.playbackRate = this.rate;
        await this.audioEl.play();
      }
    } catch {
      // Ignore network fallback errors
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // Ignore
      }
    }
    this.isSpeakingState = false;
  }
}

export const speechService = new SpeechService();
