const API_KEY = import.meta.env.VITE_DREAMFACE_KEY;


export async function gerarLipsyncVideo(srcVideoUrl, audioUrl) {
  const res = await fetch('https://api.newportai.com/api/async/lipsync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      srcVideoUrl,
      audioUrl,
      videoParams: {
        video_width: 0,
        video_height: 0,
        video_enhance: 1
      }
    })
  });

  const result = await res.json();
  if (result.code !== 0) throw new Error(result.message);
  return result.data.taskId;
}

export async function consultarResultado(taskId) {
  const res = await fetch('https://api.newportai.com/api/getAsyncResult', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ taskId })
  });

  const text = await res.text();

  try {
    const result = JSON.parse(text);
    if (result.code !== 0 || result.data.task.status !== 3) return null;
    return result.data.videos?.[0]?.videoUrl || null;
  } catch (e) {
    console.warn('Resposta inválida da API Dreamface:', text);
    return null;
  }
}
