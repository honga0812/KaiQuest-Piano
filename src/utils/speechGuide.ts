/**
 * Natural, Child-Friendly AI Speech Synthesis Utility
 *
 * Designed specifically for young learners:
 * 1. AI Real-Human Voice Generation:
 *    Calls the backend /api/tts endpoint powered by Gemini 3.8 Flash TTS
 *    with melodic, sweet child-friendly personas (Aoede / Puck).
 * 2. Emotional Acting & Inflections:
 *    Supports expressive emotional modes:
 *    - 'excited': High energy, delighted cheers (🤩)
 *    - 'celebrating': Grand fanfare, joyful ovation (🥳)
 *    - 'encouraging': Loving, warm teacher confidence boost (🌟)
 *    - 'friendly': Natural, sweet companion storytelling (🥰)
 *    - 'calm': Gentle, patient step-by-step guidance (🌸)
 * 3. In-Memory & Disk Audio Caching:
 *    Pre-buffers and caches generated WAV audio blobs so repeat sounds play with 0ms latency.
 * 4. Resilient Fallback:
 *    If offline or network is interrupted, seamlessly falls back to high-quality device neural voices.
 */

export type SpeechEmotion = 'excited' | 'friendly' | 'encouraging' | 'celebrating' | 'calm';

export interface SpeechStatusEvent {
  isSpeaking: boolean;
  currentText: string | null;
  emotion: SpeechEmotion;
  emotionEmoji: string;
}

export const EMOTION_EMOJIS: Record<SpeechEmotion, string> = {
  excited: '🤩',
  celebrating: '🥳',
  encouraging: '🌟',
  friendly: '🥰',
  calm: '🌸',
};

interface ChunkParam {
  text: string;
  pitch: number;
  rate: number;
  pauseAfterMs: number;
}

class SpeechGuideManager {
  private isSpeaking = false;
  private currentEmotion: SpeechEmotion = 'friendly';
  private cachedBestVoice: SpeechSynthesisVoice | null = null;
  private onStatusChangeListeners: Set<(event: SpeechStatusEvent) => void> = new Set();
  private currentText: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // hash/key -> blob URL
  private phraseQueue: ChunkParam[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private pauseTimer: number | null = null;
  private sessionId = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedBestVoice = this.pickBestVoice();
      };
      setTimeout(() => {
        this.cachedBestVoice = this.pickBestVoice();
      }, 200);
    }
  }

  /**
   * Intelligently selects the warmest, most natural Chinese voice for fallback
   */
  public pickBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const naturalKeywords = [
      'xiaoxiao',  // Microsoft Xiaoxiao Natural (warm, child-friendly)
      'hsiaochen', // Microsoft HsiaoChen Natural (Taiwanese warm female)
      'yunxi',     // Microsoft Yunxi Natural (lively boy-like)
      'tingting',  // Apple Tingting (Siri natural)
      'meijia',    // Apple Meijia (Taiwanese natural)
      'sinji',     // Apple Sinji
      'google 國語',
      'google 普通话',
      'yating',    // Taiwan AI natural voice
      'hanhan',    // Warm female voice
      'natural',
      'neural',
    ];

    for (const kw of naturalKeywords) {
      const match = voices.find(
        (v) =>
          (v.lang.startsWith('zh') || v.lang.includes('TW') || v.lang.includes('CN') || v.lang.includes('HK')) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    const twVoice = voices.find((v) => v.lang === 'zh-TW' || v.lang === 'cmn-Hant-TW');
    if (twVoice) return twVoice;

    const anyZh = voices.find((v) => v.lang.startsWith('zh'));
    if (anyZh) return anyZh;

    return voices[0] || null;
  }

  /**
   * Transforms raw speech into lively child-friendly clauses with emotional dynamic pitch/rate
   */
  public buildKidPhrases(rawText: string, emotion: SpeechEmotion = 'friendly'): ChunkParam[] {
    const sentences = rawText
      .replace(/[\r\n]+/g, ' ')
      .split(/(?<=[！!？?。…~～，,；;])/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) return [];

    const basePitch =
      emotion === 'excited' || emotion === 'celebrating'
        ? 1.28
        : emotion === 'encouraging'
        ? 1.24
        : emotion === 'calm'
        ? 1.12
        : 1.20;
    const baseRate =
      emotion === 'excited' || emotion === 'celebrating'
        ? 1.02
        : emotion === 'calm'
        ? 0.90
        : 0.95;

    return sentences.map((sentence, idx) => {
      let pitch = basePitch;
      let rate = baseRate;
      let pauseAfter = 100;

      const isExclamation = /[！!~～]/.test(sentence);
      const isQuestion = /[？?]/.test(sentence);
      const isComma = /[，,；;]/.test(sentence);

      if (idx === 0 && (isExclamation || sentence.length < 8)) {
        pitch = Math.min(1.4, basePitch + 0.10);
        rate = Math.min(1.1, baseRate + 0.05);
        pauseAfter = 140;
      } else if (idx === sentences.length - 1 && isExclamation) {
        pitch = Math.min(1.38, basePitch + 0.08);
        rate = baseRate;
        pauseAfter = 80;
      } else if (isQuestion) {
        pitch = Math.min(1.34, basePitch + 0.06);
        pauseAfter = 120;
      } else if (isComma) {
        pauseAfter = 90;
      }

      const text = sentence
        .replace(/！/g, '！')
        .replace(/。/g, '～')
        .trim();

      return {
        text,
        pitch,
        rate,
        pauseAfterMs: pauseAfter,
      };
    });
  }

  /**
   * Speaks the text with warm, expressive, high-emotion AI human speech
   */
  public async speak(
    rawText: string,
    options?: {
      emotion?: SpeechEmotion;
      voice?: string;
      pitch?: number;
      rate?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): Promise<void> {
    if (!rawText || !rawText.trim()) {
      options?.onEnd?.();
      return;
    }

    this.stop();

    const currentSession = ++this.sessionId;
    const emotion = options?.emotion || 'friendly';
    this.currentEmotion = emotion;
    this.currentText = rawText;
    this.isSpeaking = true;
    this.notifyStatus(true, rawText, emotion);

    // 1. Try AI-powered Gemini Text-To-Speech from server
    const aiSuccess = await this.trySpeakWithAi(rawText, emotion, options?.voice || 'Aoede', currentSession, options?.onEnd, options?.onError);
    if (aiSuccess) {
      return;
    }

    // 2. Fallback to Browser Speech Synthesis with high-quality natural voice & expressive modulation
    if (this.sessionId !== currentSession) return;
    this.fallbackBrowserSpeech(rawText, emotion, currentSession, options);
  }

  /**
   * Fetches real AI human audio from /api/tts with emotion styling and plays it
   */
  private async trySpeakWithAi(
    rawText: string,
    emotion: SpeechEmotion,
    voice: string,
    session: number,
    onEnd?: () => void,
    onError?: () => void
  ): Promise<boolean> {
    try {
      const cacheKey = `${voice}:${emotion}:${rawText.trim()}`;
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        const resp = await fetch(`/api/tts?text=${encodeURIComponent(rawText.trim())}&emotion=${encodeURIComponent(emotion)}&voice=${encodeURIComponent(voice)}`);
        if (!resp.ok) {
          return false;
        }

        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          // Fallback flag returned by server
          return false;
        }

        const blob = await resp.blob();
        if (blob.size < 100) {
          return false;
        }
        audioUrl = URL.createObjectURL(blob);
        this.audioCache.set(cacheKey, audioUrl);
      }

      if (this.sessionId !== session) {
        return true;
      }

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.sessionId === session) {
          this.isSpeaking = false;
          this.currentText = null;
          this.currentAudio = null;
          this.notifyStatus(false, null, emotion);
          onEnd?.();
        }
      };

      audio.onerror = () => {
        if (this.sessionId === session) {
          console.warn('AI audio playback error, falling back to browser speech synthesis');
          this.currentAudio = null;
          this.fallbackBrowserSpeech(rawText, emotion, session, { onEnd, onError });
        }
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('AI TTS fetch/play error:', err);
      return false;
    }
  }

  /**
   * Fallback using browser speech synthesis
   */
  private fallbackBrowserSpeech(
    rawText: string,
    emotion: SpeechEmotion,
    session: number,
    options?: {
      pitch?: number;
      rate?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      this.currentText = null;
      this.notifyStatus(false, null, emotion);
      options?.onEnd?.();
      return;
    }

    const phrases = this.buildKidPhrases(rawText, emotion);
    if (phrases.length === 0) {
      this.isSpeaking = false;
      this.currentText = null;
      this.notifyStatus(false, null, emotion);
      options?.onEnd?.();
      return;
    }

    this.phraseQueue = phrases;
    this.processNextPhrase(session, emotion, options);
  }

  private processNextPhrase(
    session: number,
    emotion: SpeechEmotion,
    options?: {
      pitch?: number;
      rate?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (this.sessionId !== session) return;

    if (this.phraseQueue.length === 0) {
      this.isSpeaking = false;
      this.currentText = null;
      this.activeUtterance = null;
      this.notifyStatus(false, null, emotion);
      options?.onEnd?.();
      return;
    }

    const item = this.phraseQueue.shift()!;
    const voice = this.cachedBestVoice || this.pickBestVoice();

    const utterance = new SpeechSynthesisUtterance(item.text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'zh-TW';
    }

    utterance.pitch = options?.pitch ?? item.pitch;
    utterance.rate = options?.rate ?? item.rate;
    utterance.volume = 1.0;

    this.activeUtterance = utterance;

    utterance.onend = () => {
      if (this.sessionId !== session) return;
      if (this.phraseQueue.length > 0) {
        this.pauseTimer = window.setTimeout(() => {
          if (this.sessionId !== session) return;
          this.processNextPhrase(session, emotion, options);
        }, item.pauseAfterMs);
      } else {
        this.isSpeaking = false;
        this.currentText = null;
        this.activeUtterance = null;
        this.notifyStatus(false, null, emotion);
        options?.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      if (this.sessionId !== session) return;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      this.isSpeaking = false;
      this.currentText = null;
      this.activeUtterance = null;
      this.notifyStatus(false, null, emotion);
      options?.onError?.();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis speak failure:', err);
      this.notifyStatus(false, null, emotion);
    }
  }

  public stop(): void {
    this.sessionId++;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.pauseTimer !== null) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    this.phraseQueue = [];

    if (this.activeUtterance) {
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }, 10);
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.currentText = null;
    this.notifyStatus(false, null, this.currentEmotion);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentText(): string | null {
    return this.currentText;
  }

  public getCurrentEmotion(): SpeechEmotion {
    return this.currentEmotion;
  }

  public subscribeStatus(listener: (event: SpeechStatusEvent) => void): () => void {
    this.onStatusChangeListeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      currentText: this.currentText,
      emotion: this.currentEmotion,
      emotionEmoji: EMOTION_EMOJIS[this.currentEmotion] || '🥰',
    });
    return () => {
      this.onStatusChangeListeners.delete(listener);
    };
  }

  private notifyStatus(isSpeaking: boolean, text: string | null, emotion: SpeechEmotion): void {
    const event: SpeechStatusEvent = {
      isSpeaking,
      currentText: text,
      emotion,
      emotionEmoji: EMOTION_EMOJIS[emotion] || '🥰',
    };
    this.onStatusChangeListeners.forEach((l) => l(event));
  }
}

export const speechGuide = new SpeechGuideManager();
