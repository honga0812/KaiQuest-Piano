import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const TTS_CACHE_DIR = path.join(ROOT_DIR, 'public', 'audio', 'tts');

if (!fs.existsSync(TTS_CACHE_DIR)) {
  try {
    fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
  } catch {
    // Ignore if exists
  }
}

let aiInstance = null;
function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI();
  }
  return aiInstance;
}

export function computeTtsHash(text, voice = 'Puck') {
  return crypto.createHash('md5').update(`${voice}:${text.trim()}`).digest('hex');
}

/**
 * Handles incoming TTS requests from Vite dev server or Express/Node server
 */
export async function handleTtsRequest(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    let text = urlObj.searchParams.get('text') || '';
    let voice = urlObj.searchParams.get('voice') || 'Puck';

    // If POST, parse json body
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const bodyStr = Buffer.concat(chunks).toString('utf-8');
      if (bodyStr) {
        try {
          const parsed = JSON.parse(bodyStr);
          if (parsed.text) text = parsed.text;
          if (parsed.voice) voice = parsed.voice;
        } catch {
          // ignore json parse error
        }
      }
    }

    text = text.trim();
    if (!text) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing text parameter' }));
      return;
    }

    const hash = computeTtsHash(text, voice);
    const cachedFilePath = path.join(TTS_CACHE_DIR, `${hash}.wav`);

    // 1. Check disk cache
    if (fs.existsSync(cachedFilePath)) {
      const cachedBuf = fs.readFileSync(cachedFilePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', cachedBuf.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-TTS-Source', 'cache');
      res.end(cachedBuf);
      return;
    }

    // 2. Generate on-the-fly with Gemini 3.8 Flash TTS
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) {
      throw new Error('Gemini TTS returned no audio data');
    }

    const audioBuf = Buffer.from(audioBase64, 'base64');

    // Save to disk cache for all future calls
    try {
      fs.writeFileSync(cachedFilePath, audioBuf);
    } catch (saveErr) {
      console.warn('Failed to cache TTS audio:', saveErr);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-TTS-Source', 'gemini-ai');
    res.end(audioBuf);
  } catch (err) {
    console.warn('[TTS API Error, falling back]:', err.message);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        fallback: true,
        error: err.message || 'TTS generation unavailable',
      })
    );
  }
}
