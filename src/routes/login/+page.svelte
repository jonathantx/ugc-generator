<script>
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';

  async function login() {
    error = '';

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      error = err.message;
    } else {
      goto('/dashboard');
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
  <div class="bg-gray-800 p-8 rounded-xl w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6">Login</h1>

    <input class="w-full p-3 mb-4 rounded bg-gray-700" type="email" bind:value={email} placeholder="Email" />
    <input class="w-full p-3 mb-4 rounded bg-gray-700" type="password" bind:value={password} placeholder="Senha" />

    {#if error}<p class="text-red-500 mb-4">{error}</p>{/if}

    <button on:click={login} class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold">
      Entrar
    </button>

    <p class="mt-4 text-sm text-center">
      Não tem conta? <a class="text-blue-400 hover:underline" href="/register">Registrar</a>
    </p>
  </div>
</div>
