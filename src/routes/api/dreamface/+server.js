
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const formData = await request.formData();

    const video = formData.get('video');
    const audio = formData.get('audio');

    const dreamForm = new FormData();
    
    dreamForm.append('video', video);
    dreamForm.append('audio', audio);

    const res = await fetch('https://api.dreamface.ai/generate', {
        method: 'POST',
        headers: {
        Authorization: '5baacef05e634ef1a005f453280cb4a9',
        },
        body: dreamForm
    });

    if (!res.ok) {
        return json({ error: true, status: res.status, message: await res.text() }, { status: 500 });
    }

    const result = await res.json();
    return json({ video_url: result.video_url });
}
