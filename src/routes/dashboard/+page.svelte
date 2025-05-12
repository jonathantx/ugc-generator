<script>
import { onMount } from 'svelte';
import { supabase } from '$lib/supabaseClient';
import { Clock, Dot, DotSquare, DownloadIcon, Edit2, Ellipsis, File, FolderInput, Mic, Plus, Search, StickyNote, Trash, Trash2Icon } from 'lucide-svelte';
import NovoCriativoForm from '../novo-criativo/+page.svelte';

let criativos = [];
let criativosFiltrados = [];
let status = []
let showModal = false;
let search = ''

onMount(async () => {
    carregarCriativos();
});

async function carregarCriativos() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('criativos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (!error) criativos = data;
}

$: criativosFiltrados = criativos.filter(item =>
    item.nome.toLowerCase().includes(search.toLowerCase()) ||
    item.texto?.toLowerCase().includes(search.toLowerCase())
);


async function excluir(id) {
    await supabase.from('criativos').delete().eq('id', id);
    criativos = criativos.filter(c => c.id !== id);
}

</script>

<div class="min-h-screen bg-slate-900 text-white p-8">
    <div class="flex justify-between items-center gap-3 mb-6">
        <div class="flex w-full relative">
            <input 
                type="text"
                bind:value={search} 
                placeholder="Filtrar por titulo ou texto" 
                class="w-full pl-10 pr-3 py-3 rounded-lg outline-0 bg-slate-800 border border-slate-600 focus:ring focus:ring-purple-600/80 placeholder:text-gray-500" />
            <Search size="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <button on:click={() => showModal = true} class="flex items-center justify-center font-semibold gap-2 bg-purple-600 hover:bg-purple-700 w-1/6 px-4 py-3 rounded">
            <Plus size="15" />
            Novo Criativo
        </button>
    </div>
    <div class="flex justify-between items-center mb-6">
        <div class="flex justify-center items-center gap-3">
            <div class="p-2 bg-slate-800 rounded-lg">
                <File />
            </div>
            <h1 class="text-2xl font-bold">
                Criativos sem pasta
            </h1>
        </div>
       
    </div>

    <div class="grid md:grid-cols-4 gap-6">
        {#each criativosFiltrados as item}
            <div class="bg-slate-800 rounded-lg relative">
                <!-- svelte-ignore a11y_media_has_caption -->
                <video class="rounded w-full object-cover" controls src={item.final_url || item.video_url}></video>
                <div class="p-4">
                    <h2 class="text-md font-semibold">{item.nome}</h2>
                    <!-- <p class="text-sm text-gray-400">{item.texto}</p> -->
    
                    <div class="flex justify-between items-center gap-2 text-xs mt-2">
                        <div class="flex items-center gap-2">
                            <div class="bg-purple-900 p-1 rounded-full">
                                <Mic size="12" />
                            </div>
                            <span class="text-gray-300">ElevenLabs + DreamFace</span>
                        </div>
                        <div class="flex items-center gap-3 text-gray-400">
                            <button class="hover:text-gray-300 hover:cursor-pointer">
                                <FolderInput size="12" />
                            </button>
                            <button class="hover:text-gray-300 hover:cursor-pointer">
                                <Ellipsis size="12" />
                            </button>
                        </div>
                    </div>
    
                    <div class="mt-3 flex justify-center items-center gap-2 pb-3 border-b border-slate-600">
                        <a class="bg-slate-800 min-w-40 border border-purple-800 hover:bg-slate-700 text-purple-400 text-xs py-2 px-8 rounded flex justify-center items-center gap-2 font-bold transition-colors hover:cursor-pointer" href={item.final_url} target="_blank">
                            <DownloadIcon size="15" />
                            Download
                        </a>
                        <button class="bg-slate-800 min-w-40 border border-purple-800 hover:bg-slate-700 text-purple-400 text-xs py-2 px-8 rounded flex justify-center items-center gap-2 font-bold transition-colors hover:cursor-pointer">
                            <Edit2 size="15" />
                            Edit
                        </button>
                    </div>
                    <div class="text-gray-500 text-xs flex items-center justify-between pt-3 ">
                        <div class="flex items-center gap-2">
                            <Clock size="15" />
                            <span class="">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <button on:click={() => excluir(item.id)} class="flex items-center gap-2 text-gray-300 hover:cursor-pointer hover:text-red-600">
                            <Trash2Icon size="15" />
                            Exluir
                        </button>
                    </div>
        
                    <span class="absolute top-2 right-2 bg-green-600/10 text-xs px-3 py-2 rounded-full uppercase">{item.status}</span>
                </div>
            </div>
        {/each}
         {#if criativosFiltrados.length === 0}
            <div class="col-span-full text-center text-gray-500 py-10">
            Nenhum criativo encontrado.
            </div>
        {/if}
    </div>
    {#if showModal}
        <NovoCriativoForm 
        on:close={() => showModal = false} 
        on:criado={() => {
        showModal = false;
        carregarCriativos(); 
        }}/>
    {/if}
</div>

<style>
    video::-webkit-media-controls-panel {
        background-color: rgba(0,0,0,0.3);
    }
</style>