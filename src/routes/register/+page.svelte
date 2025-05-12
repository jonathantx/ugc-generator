<script>
import { supabase } from '$lib/supabaseClient';
import { goto } from '$app/navigation';

let email = '';
let password = '';
let error = '';

async function register() {
error = '';

const { error: err } = await supabase.auth.signUp({ email, password });

if (err) {
    error = err.message;
} else {
    goto('/dashboard');
}
}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
  <div class="bg-gray-800 p-8 rounded-xl w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6">Registrar</h1>

    <input class="w-full p-3 mb-4 rounded bg-gray-700" type="email" bind:value={email} placeholder="Email" />
    <input class="w-full p-3 mb-4 rounded bg-gray-700" type="password" bind:value={password} placeholder="Senha" />

    {#if error}<p class="text-red-500 mb-4">{error}</p>{/if}

    <button on:click={register} class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold">
      Criar conta
    </button>

    <p class="mt-4 text-sm text-center">
      Já tem conta? <a class="text-blue-400 hover:underline" href="/login">Login</a>
    </p>
  </div>
</div>
