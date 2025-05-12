<script>
import { supabase } from '$lib/supabaseClient';
import { onMount } from 'svelte';
import { getVoices, generateAudio } from '$lib/elevenlabs';
import { gerarLipsyncVideo, consultarResultado } from '$lib/dreamface';
import { createEventDispatcher } from 'svelte';
import { toast } from 'sonner-svelte';

let nome = '';
let texto = '';
let voz = '';
let videoFile = null;
let etapa = 'inicial';
let error = '';
let criando = false;
let sucesso = '';
let voices = [];
let audioPreview = null;

const dispatch = createEventDispatcher();

onMount(async () => {
    voices = await getVoices();
    
});

async function ouvirPreview() {
    audioPreview = null; 
    const audioBlob = await generateAudio(voz, 'Olá! Esta é uma prévia da minha voz.');
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play(); 
    }
}

$: videoPreviewUrl = videoFile ? URL.createObjectURL(videoFile) : null;

async function enviar() {
    criando = true;
    error = '';
    sucesso = '';
    etapa = 'upload_video';
    
    if (!videoFile || videoFile.size > 100 * 1024 * 1024) {
        toast.error('Vídeo obrigatório (máx. 100MB)');
        etapa = 'erro';
        criando = false;
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.error('Usuário não autenticado.');
        etapa = 'erro';
        criando = false;
        return;
    }

    const user_id = user.id;

    const videoExt = videoFile.name.split('.').pop();
    const videoName = `${Date.now()}.${videoExt}`;
    const videoPath = `criativos/${videoName}`;

    const { error: uploadVideoError } = await supabase
        .storage.from('videos')
        .upload(videoPath, videoFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: videoFile.type || 'video/mp4'
        });

    if (uploadVideoError) {
        toast.error('Erro ao enviar vídeo');
        etapa = 'erro';
        criando = false;
        return;
    }

    const video_url = `https://ztlzaqyxfaclpkqgxibs.supabase.co/storage/v1/object/public/videos/${videoPath}`;

    etapa = 'upload_audio';
    const audioBlob = await generateAudio(voz, texto);
    const audioName = `${Date.now()}.mp3`;
    const audioPath = `audios/${audioName}`;

    const { error: uploadAudioError } = await supabase
        .storage.from('videos')
        .upload(audioPath, audioBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'audio/mpeg'
        });

    if (uploadAudioError) {
        toast.error('Erro ao enviar áudio: ' + uploadAudioError.message);
        etapa = 'erro';
        criando = false;
        return;
    }

    const audio_url = `https://ztlzaqyxfaclpkqgxibs.supabase.co/storage/v1/object/public/videos/${audioPath}`;

    etapa = 'enviando_dreamface';
    await supabase.from('criativos').insert({
        user_id,
        nome,
        texto,
        voz,
        video_url,
        status: 'processando'
    });

    try {
        etapa = 'aguardando_resultado';
        const taskId = await gerarLipsyncVideo(video_url, audio_url);

        let finalUrl = null;
        for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 4000));
            const result = await consultarResultado(taskId);
            if (result) {
                finalUrl = result;
                break;
            }
        }

        if (finalUrl) {
            await supabase
                .from('criativos')
                .update({ status: 'concluido', final_url: finalUrl })
                .eq('user_id', user_id)
                .eq('video_url', video_url);

            toast.success('Criativo enviado e finalizado!');
            etapa = 'concluido';
            dispatch('close');
            dispatch('criado');
        } else {
            toast.error('Vídeo não foi gerado a tempo.');
            criando = false;
            etapa = 'erro';
        }
    } catch (err) {
        toast.error('Erro no processamento do vídeo final');
        criando = false;
        etapa = 'erro';
    }
}

function closeModal() {
    dispatch('close'); 
}

</script>

<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  <div class="bg-[#111827] text-white p-8 rounded-xl w-full max-w-2xl shadow-lg">
    <h2 class="text-xl font-bold mb-6 text-purple-400">Novo Criativo</h2>

    <div class="space-y-4">
        <label for="nome_base" class="text-sm font-semibold">Nome Base:</label>
        <input bind:value={nome} name="nome_base" placeholder="Criativo 01" class="w-full mt-2 px-3 py-2 rounded-lg outline-0 bg-slate-800 border border-slate-600 focus:ring focus:ring-purple-600/80" />
        <label for="texto" class="text-sm font-semibold">Textos Criativos (texto vazio é ignorado)</label>
        <textarea bind:value={texto} placeholder="Texto Criativo 01" class="w-full mt-2 px-3 py-2 outline-0 rounded-lg bg-slate-800 border border-slate-600 h-28 focus:ring focus:ring-purple-600/80"></textarea>

    <div class="flex flex-col gap-2">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="text-sm font-semibold">Voz:</label>
        <select bind:value={voz} class="w-full mt-1 px-3 py-2 outline-0 rounded-lg bg-slate-800 border border-slate-600 focus:ring focus:ring-purple-600/80">
            <option value="">Selecione uma voz</option>
            {#each voices as voice}
            <option value={voice.voice_id}>{voice.name}</option>
            {/each}
        </select>
        {#if voz}
            <button on:click={ouvirPreview} class="text-sm px-3 py-2 bg-purple-700 hover:bg-purple-800 rounded self-start">Ouvir Preview</button>
        {/if}
    </div>

    <div class="flex flex-col gap-2">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        {#if videoPreviewUrl}
        <div class="relative w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-600">
            <!-- svelte-ignore a11y_media_has_caption -->
            <video class="w-full h-48 object-contain" src={videoPreviewUrl} controls></video>
            <button
            on:click={() => videoFile = null}
            class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-sm px-2 py-1 rounded"
            >
            Remover vídeo
            </button>
        </div>
        {:else}
        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-36 bg-slate-800 border border-slate-600 focus:ring focus:ring-purple-600/80 border-dashed rounded-lg cursor-pointer">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p class="mb-2 text-md text-gray-500">Escolha um avatar da biblioteca</p>
            </div>
            <input id="dropzone-file" type="file" accept="video/mp4" on:change={(e) => videoFile = e.target.files[0]} class="hidden" />
        </label>
        {/if}
    </div>

    {#if etapa !== 'inicial'}
        <div class="w-full bg-gray-700 h-2 rounded overflow-hidden">
            <div class="h-full transition-all duration-500 bg-purple-500" style="width: {
            etapa === 'upload_video' ? '20%' :
            etapa === 'upload_audio' ? '40%' :
            etapa === 'enviando_dreamface' ? '60%' :
            etapa === 'aguardando_resultado' ? '80%' :
            etapa === 'concluido' ? '100%' : '0%'
            }"></div>
        </div>
    {/if}

        {#if error}<p class="text-red-400 text-sm">{error}</p>{/if}
        {#if sucesso}<p class="text-green-400 text-sm">{sucesso}</p>{/if}

        <div class="flex justify-end gap-2 pt-4">
            <button on:click={closeModal} class="bg-slate-800 hover:bg-slate-700 px-5 py-2 hover:cursor-pointer rounded">Cancelar</button>

            <button 
                on:click={enviar} 
                class="bg-purple-600 hover:cursor-pointer hover:bg-purple-700 px-5 py-2 rounded text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={criando}
                >
                {#if criando}
                    <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando...
                {:else}
                    Criar Criativo
                {/if}
            </button>

        </div>
    </div>
  </div>
</div>
