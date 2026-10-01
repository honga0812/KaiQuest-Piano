/**
 * Natural, Child-Friendly AI Speech Synthesis Utility
 *
 * Designed specifically for young learners:
 * - Selects the most natural, human-like neural voice available on the device
 *   (Microsoft Xiaoxiao/HsiaoChen/Yunxi Natural, Apple Meijia/Tingting/Siri, Google Mandarin).
 * - Multi-phase expressive prosody: breaks text into natural conversational chunks
 *   with varied pitch and cadence tailored to speak to children (warm, cheerful, not monotonic).
 * - Emotion modes: 'excited' (high pitch, energetic), 'friendly' (warm storytelling),
 *   'encouraging' (uplifting cheer), and 'calm' (gentle instructions).
 */

export type SpeechEmotion = 'excited' | 'friendly' | 'encouraging' | 'calm';

interface ChunkParam {
  text: string;
  pitch: number;
  rate: number;
  pauseAfterMs: number;
}

class SpeechGuideManager {
  private isSpeaking = false;
  private cachedBestVoice: SpeechSynthesisVoice | null = null;
  private onStatusChangeListeners: Set<(isSpeaking: boolean, currentText: string | null) => void> = new Set();
  private currentText: string | null = null;
  private phraseQueue: ChunkParam[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private pauseTimer: number | null = null;
  private sessionId = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedBestVoice = this.pickBestVoice();
      };
      // Try resolving voice immediately
      setTimeout(() => {
        this.cachedBestVoice = this.pickBestVoice();
      }, 200);
    }
  }

  /**
   * Intelligently selects the warmest, most natural Chinese voice
   */
  public pickBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritized list of high-quality neural / natural Chinese voices
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

    // 1. Check for keyword match in Chinese voices
    for (const kw of naturalKeywords) {
      const match = voices.find(
        (v) =>
          (v.lang.startsWith('zh') || v.lang.includes('TW') || v.lang.includes('CN') || v.lang.includes('HK')) &&
          v.name.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    // 2. Secondary fallback: any zh-TW voice
    const twVoice = voices.find((v) => v.lang === 'zh-TW' || v.lang === 'cmn-Hant-TW');
    if (twVoice) return twVoice;

    // 3. Tertiary fallback: any zh voice
    const anyZh = voices.find((v) => v.lang.startsWith('zh'));
    if (anyZh) return anyZh;

    return voices[0] || null;
  }

  /**
   * Transforms raw speech into lively child-friendly clauses with emotional dynamic pitch/rate
   */
  public buildKidPhrases(rawText: string, emotion: SpeechEmotion = 'friendly'): ChunkParam[] {
    // Clean text and split by punctuation boundaries while keeping punctuation marks
    const sentences = rawText
      .replace(/[\r\n]+/g, ' ')
      .split(/(?<=[！!？?。…~～，,；;])/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) return [];

    const basePitch = emotion === 'excited' ? 1.28 : emotion === 'encouraging' ? 1.24 : emotion === 'calm' ? 1.12 : 1.20;
    const baseRate = emotion === 'excited' ? 1.02 : emotion === 'calm' ? 0.90 : 0.94;

    return sentences.map((sentence, idx) => {
      let pitch = basePitch;
      let rate = baseRate;
      let pauseAfter = 100;

      const isExclamation = /[！!~～]/.test(sentence);
      const isQuestion = /[？?]/.test(sentence);
      const isComma = /[，,；;]/.test(sentence);

      if (idx === 0 && (isExclamation || sentence.length < 8)) {
        // High, upbeat greeting or exclamation
        pitch = Math.min(1.4, basePitch + 0.10);
        rate = Math.min(1.1, baseRate + 0.05);
        pauseAfter = 140;
      } else if (idx === sentences.length - 1 && isExclamation) {
        // Cheerful closing encouragement
        pitch = Math.min(1.38, basePitch + 0.08);
        rate = baseRate;
        pauseAfter = 80;
      } else if (isQuestion) {
        // Inquisitive, engaging upward inflection
        pitch = Math.min(1.34, basePitch + 0.06);
        pauseAfter = 120;
      } else if (isComma) {
        pauseAfter = 90;
      }

      // Format text with gentle particles
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
   * Speaks the text with warm, expressive, high-emotion dynamic inflection
   */
  public speak(
    rawText: string,
    options?: {
      emotion?: SpeechEmotion;
      pitch?: number;
      rate?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }

    this.stop();

    const currentSession = ++this.sessionId;
    const emotion = options?.emotion || 'friendly';
    const phrases = this.buildKidPhrases(rawText, emotion);
    if (phrases.length === 0) return;

    this.phraseQueue = phrases;
    this.isSpeaking = true;
    this.currentText = rawText;
    this.notifyStatus(true, rawText);

    this.processNextPhrase(currentSession, options);
  }

  private processNextPhrase(
    session: number,
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
      this.notifyStatus(false, null);
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
          this.processNextPhrase(session, options);
        }, item.pauseAfterMs);
      } else {
        this.isSpeaking = false;
        this.currentText = null;
        this.activeUtterance = null;
        this.notifyStatus(false, null);
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
      this.notifyStatus(false, null);
      options?.onError?.();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis speak failure:', err);
      this.notifyStatus(false, null);
    }
  }

  public stop(): void {
    // Invalidate any ongoing speech session immediately
    this.sessionId++;

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
        // Pausing before canceling flushes buffer immediately on Chromium/Safari
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }, 10);
        setTimeout(() => {
          try {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
            }
          } catch {}
        }, 40);
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.currentText = null;
    this.notifyStatus(false, null);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentText(): string | null {
    return this.currentText;
  }

  public subscribeStatus(listener: (isSpeaking: boolean, text: string | null) => void): () => void {
    this.onStatusChangeListeners.add(listener);
    listener(this.isSpeaking, this.currentText);
    return () => {
      this.onStatusChangeListeners.delete(listener);
    };
  }

  private notifyStatus(isSpeaking: boolean, text: string | null): void {
    this.onStatusChangeListeners.forEach((l) => l(isSpeaking, text));
  }
}

export const speechGuide = new SpeechGuideManager();
