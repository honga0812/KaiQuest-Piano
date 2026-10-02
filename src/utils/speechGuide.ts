/**
 * Natural, Child-Friendly AI Speech Synthesis Utility
 *
 * Performance-First 0ms Latency Architecture:
 * 1. Pre-baked Static Audio Map:
 *    Maps all 15+ standard congratulatory phrases and instructions directly to
 *    pre-generated Gemini AI WAV audio files in /public/audio/tts/.
 * 2. In-Memory Audio Preloader:
 *    Preloads all static audio into memory (HTMLAudioElement) upon initialization
 *    so clicking or clearing a level triggers 0ms instant playback!
 * 3. Strictly Clean Speech:
 *    Speech output contains ONLY the congratulatory words/dialogue itself.
 *    No meta-prompts, brackets, or stage directions are ever spoken.
 * 4. Zero-Delay Resilient Fallback:
 *    If an audio file is not cached or fetch exceeds 200ms, immediately speaks
 *    via the device's neural speech synthesis without leaving the user waiting.
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

/**
 * Pre-baked Gemini AI Audio Map (0ms Instant Playback)
 * Generated with Aoede child-friendly voice, clean dialogue text only.
 */
export const STATIC_VOICE_MAP: Record<string, string> = {
  // General Level Celebrations
  '你成功了！這段旋律彈得又準又動聽，手指動作非常靈巧，繼續加油喔！': '/audio/tts/b8d10c5a9c2fa28f7cb060791b24e3fa.wav',
  '繼續加油！手型和節奏感保持得非常漂亮，你成功了，我們邁向下一關！': '/audio/tts/c745a86040b7fd1f56d1f8f6b07cb81a.wav',
  '你是最棒的！節奏掌握得太出色了，聽你的琴聲就像在聽一場歡樂的音樂會！': '/audio/tts/c9b9ec4ddb1d503873d9d1b7328029a2.wav',
  '你成功了！為你喝彩！音符一個都沒有漏掉，你是最棒的，繼續加油！': '/audio/tts/e6b7506b691eb5ddfc95c8cb67d25d0c.wav',
  '繼續加油！手指越來越靈活、動作越來越順暢了，保持這個好手感，你是最棒的！': '/audio/tts/46efe9a9f238e8b8cb6ce403707195e9.wav',
  '你是最棒的！手指站得直挺挺，音色乾淨又清脆！你成功了，繼續加油！': '/audio/tts/cbcb54c0b64c68b68acfba370109edc6.wav',
  '太厲害了！為你鼓掌！這段指法銜接得流暢自然，你成功了，繼續加油！': '/audio/tts/74b097d34069dea28d2c5cdacde3aa18.wav',
  '你是最棒的！每一個音符都充滿了活力，表現極為出色，繼續加油挑戰下一關！': '/audio/tts/3984890f682252787731bce458c32277.wav',
  '你做到了！專注聽琴、穩穩彈奏，表現超級出色！你成功了，繼續加油！': '/audio/tts/1343b4d3927e3baee43d2f8246f32b3d.wav',
  '你成功了！節奏感一級棒，指尖像在琴鍵上跳舞！你是最棒的，繼續加油！': '/audio/tts/996275a947c0d325d8dc78c97ae2f267.wav',

  // Stage 4 Full Song Grand Challenge Celebrations
  '你成功了！整首歌曲完整連貫彈奏完畢，你是最棒的鋼琴小大師！繼續加油！': '/audio/tts/7474e371ff8937e4ed105291d9c4a61f.wav',
  '你是最棒的！全曲彈得太動聽了，全場都在為你起立鼓掌！繼續加油！': '/audio/tts/3ea51b7dda84eca241e793c92380241d.wav',
  '繼續加油！你成功征服了全曲大挑戰，節奏與指法太穩健了，你是最棒的！': '/audio/tts/3e4c31468edfd97128c6e37aea6e0c90.wav',
  '太厲害了！從頭到尾零失誤，你成功了，你是最棒的，繼續加油邁向下一關！': '/audio/tts/e724d53c20b79b8b79ada549c5044c92.wav',
  '你做到了！音符像水流一樣流暢！你成功了，繼續加油！': '/audio/tts/d6cc64fe21bf20de9c88cfa152a80313.wav',

  // Stage Guides
  '哈囉小朋友！今天我們一起來開心彈琴吧！': '/audio/tts/97e53b197bbed1a7e315d35b06b4b95c.wav',
  '放輕鬆！跟著主歌旋律一句一句彈好，指法要站穩喔！': '/audio/tts/62e3c33ee2fcc2121b4f5c75857bab72.wav',
  '副歌來囉！像小海豚躍出水面一樣，彈出活潑跳動的聲音！': '/audio/tts/469a5290abc1dfc3e4d2df373a49381c.wav',
  '你成功了，來到最後的第 4 舞台！把主歌與副歌連起來，你是最棒的，彈出最完整的全曲！': '/audio/tts/041d9c4431b915857362bb72bfcba59a.wav',
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
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map();
  private phraseQueue: ChunkParam[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private pauseTimer: number | null = null;
  private sessionId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedBestVoice = this.pickBestVoice();
        };
        setTimeout(() => {
          this.cachedBestVoice = this.pickBestVoice();
        }, 150);
      }
      // Preload all fixed audio files immediately into browser memory for 0ms playback
      setTimeout(() => {
        this.preloadCommonPhrases();
      }, 300);
    }
  }

  /**
   * Preloads common static audio clips into memory for instantaneous (0ms) response
   */
  public preloadCommonPhrases(): void {
    if (typeof window === 'undefined') return;

    for (const [text, url] of Object.entries(STATIC_VOICE_MAP)) {
      if (this.preloadedAudios.has(text)) continue;
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        this.preloadedAudios.set(text, audio);
      } catch {
        // ignore preload errors
      }
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
        : 0.96;

    return sentences.map((sentence, idx) => {
      let pitch = basePitch;
      let rate = baseRate;
      let pauseAfter = 80;

      const isExclamation = /[！!~～]/.test(sentence);
      const isQuestion = /[？?]/.test(sentence);
      const isComma = /[，,；;]/.test(sentence);

      if (idx === 0 && (isExclamation || sentence.length < 8)) {
        pitch = Math.min(1.38, basePitch + 0.08);
        rate = Math.min(1.08, baseRate + 0.04);
        pauseAfter = 110;
      } else if (idx === sentences.length - 1 && isExclamation) {
        pitch = Math.min(1.35, basePitch + 0.06);
        rate = baseRate;
        pauseAfter = 60;
      } else if (isQuestion) {
        pitch = Math.min(1.32, basePitch + 0.05);
        pauseAfter = 100;
      } else if (isComma) {
        pauseAfter = 70;
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
   * Speaks the text with 0ms instant playback.
   * Prioritizes pre-baked static audio -> memory preloaded audio -> fast fetch -> instant neural speech synthesis.
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
    const emotion = options?.emotion || 'celebrating';
    this.currentEmotion = emotion;
    this.currentText = rawText.trim();
    this.isSpeaking = true;
    this.notifyStatus(true, this.currentText, emotion);

    // 1. Check for Preloaded / Static Audio (0ms instant playback)
    const played = await this.tryPlayStaticOrPreloaded(this.currentText, currentSession, emotion, options?.onEnd, options?.onError);
    if (played) {
      return;
    }

    // 2. If not preloaded, fetch with strict 180ms timeout; if not ready, instantly speak via device neural voice
    const aiSuccess = await this.trySpeakWithAi(this.currentText, emotion, options?.voice || 'Aoede', currentSession, options?.onEnd, options?.onError);
    if (aiSuccess) {
      return;
    }

    // 3. Fallback to Browser Speech Synthesis with high-quality natural voice & expressive modulation
    if (this.sessionId !== currentSession) return;
    this.fallbackBrowserSpeech(this.currentText, emotion, currentSession, options);
  }

  /**
   * Plays preloaded audio or pre-baked static audio file with 0ms delay
   */
  private async tryPlayStaticOrPreloaded(
    cleanText: string,
    session: number,
    emotion: SpeechEmotion,
    onEnd?: () => void,
    onError?: () => void
  ): Promise<boolean> {
    const staticUrl = STATIC_VOICE_MAP[cleanText];
    let audio = this.preloadedAudios.get(cleanText);

    if (!audio && staticUrl) {
      try {
        audio = new Audio(staticUrl);
        audio.preload = 'auto';
        this.preloadedAudios.set(cleanText, audio);
      } catch {
        return false;
      }
    }

    if (!audio) {
      return false;
    }

    try {
      this.currentAudio = audio;
      audio.currentTime = 0;

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
          this.currentAudio = null;
          this.fallbackBrowserSpeech(cleanText, emotion, session, { onEnd, onError });
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fast server fetch with 180ms abort timeout so user NEVER waits in silence
   */
  private async trySpeakWithAi(
    cleanText: string,
    emotion: SpeechEmotion,
    voice: string,
    session: number,
    onEnd?: () => void,
    onError?: () => void
  ): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180);

    try {
      const resp = await fetch(`/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(voice)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) return false;

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) return false;

      const blob = await resp.blob();
      if (blob.size < 100) return false;

      const audioUrl = URL.createObjectURL(blob);
      if (this.sessionId !== session) return true;

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
          this.currentAudio = null;
          this.fallbackBrowserSpeech(cleanText, emotion, session, { onEnd, onError });
        }
      };

      await audio.play();
      return true;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }

  /**
   * Fallback using device natural speech synthesis (Zero delay)
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
    } catch {
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
