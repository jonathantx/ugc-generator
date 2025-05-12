import axios from 'axios';

const API_KEY = import.meta.env.VITE_ELEVENLABS_KEY;

const instance = axios.create({
    baseURL: 'https://api.elevenlabs.io/v1',
    headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
});

export async function getVoices() {
    try {
        const res = await instance.get('/voices');
        return res.data.voices;
    } catch (error) {
        console.error('Erro ao buscar vozes:', error);
        return [];
    }
}

export async function generateAudio(voiceId, text) {
  try {
    const response = await instance.post(
      `/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      { responseType: 'arraybuffer' }
    );

    return new Blob([response.data], { type: 'audio/mpeg' });
  } catch (err) {
    console.error('Erro ao gerar áudio:', err);
    return null;
  }
}
