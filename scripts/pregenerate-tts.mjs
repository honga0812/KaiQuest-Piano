import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ai = new GoogleGenAI();
const outputDir = path.resolve('public/audio/tts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

export function getAudioHash(text, voice = 'Puck') {
  return crypto.createHash('md5').update(`${voice}:${text.trim()}`).digest('hex');
}

const phrases = [
  '你成功了！這段旋律彈得又準又動聽，手指動作非常靈巧，繼續加油喔！',
  '繼續加油！手型和節奏感保持得非常漂亮，你成功了，我們邁向下一關！',
  '你是最棒的！節奏掌握得太出色了，聽你的琴聲就像在聽一場歡樂的音樂會！',
  '你成功了！為你喝彩！音符一個都沒有漏掉，你是最棒的，繼續加油！',
  '繼續加油！手指越來越靈活、動作越來越順暢了，保持這個好手感，你是最棒的！',
  '你是最棒的！手指站得直挺挺，音色乾淨又清脆！你成功了，繼續加油！',
  '太厲害了！為你鼓掌！這段指法銜接得流暢自然，你成功了，繼續加油！',
  '你是最棒的！每一個音符都充滿了活力，表現極為出色，繼續加油挑戰下一關！',
  '你做到了！專注聽琴、穩穩彈奏，表現超級出色！你成功了，繼續加油！',
  '你成功了！節奏感一級棒，指尖像在琴鍵上跳舞！你是最棒的，繼續加油！',
  '你成功了！整首歌曲完整連貫彈奏完畢，你是最棒的鋼琴小大師！繼續加油！',
  '你是最棒的！全曲彈得太動聽了，全場都在為你起立鼓掌！繼續加油！',
  '繼續加油！你成功征服了全曲大挑戰，節奏與指法太穩健了，你是最棒的！',
  '太厲害了！從頭到尾零失誤，你成功了，你是最棒的，繼續加油邁向下一關！',
  '你做到了！音符像水流一樣流暢！你成功了，繼續加油！',
  '哈囉小朋友！今天我們一起來開心彈琴吧！',
  '放輕鬆！跟著主歌旋律一句一句彈好，指法要站穩喔！',
  '副歌來囉！像小海豚躍出水面一樣，彈出活潑跳動的聲音！',
  '你成功了，來到最後的第 4 舞台！把主歌與副歌連起來，你是最棒的，彈出最完整的全曲！',
];

async function generateWithRetry(text, voice = 'Puck', retries = 3) {
  const hash = getAudioHash(text, voice);
  const filePath = path.join(outputDir, `${hash}.wav`);
  if (fs.existsSync(filePath)) {
    console.log(`[Cache Hit] ${hash}.wav: "${text.slice(0, 15)}..."`);
    return filePath;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Generating] "${text.slice(0, 20)}..." (voice: ${voice})`);
      const res = await ai.models.generateContent({
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

      const audioData = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const buf = Buffer.from(audioData, 'base64');
        fs.writeFileSync(filePath, buf);
        console.log(`[Success] Saved ${hash}.wav (${buf.length} bytes)`);
        return filePath;
      }
      throw new Error('No audio data in response');
    } catch (err) {
      console.warn(`[Attempt ${attempt} Failed]: ${err.message}`);
      if (attempt < retries) {
        // Wait 12s on error (e.g. rate limit)
        console.log('Sleeping 12s before retry...');
        await new Promise((r) => setTimeout(r, 12000));
      }
    }
  }
}

async function run() {
  console.log(`Pre-generating ${phrases.length} AI speech files...`);
  // Generate first 6 primary phrases so we have immediate rich human voice coverage
  for (let i = 0; i < Math.min(8, phrases.length); i++) {
    await generateWithRetry(phrases[i], 'Puck');
    // Polite pause
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log('Core pre-generation completed!');
}

run().catch(console.error);
