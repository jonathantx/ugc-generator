# Gerador de Criativos UGC

 O sistema consiste em um gerador de criativos baseados em avatar + áudio via IA, integrando ferramentas como **ElevenLabs** e **Dreamface (NewportAI)**.


## 🚀 Funcionalidades

* Autenticação de usuário (login/registro)
* Upload de vídeo do avatar (MP4)
* Escolha de voz via API do ElevenLabs
* Geração de narração via ElevenLabs
* Envio para API da Dreamface (NewportAI) com lipsync
* Criação automática de um novo vídeo falado com lipsync
* Dashboard com listagem dos criativos enviados e status (processando/concluído/erro)
* Download do vídeo final gerado
* Exclusão de criativo

## ⚖️ Tecnologias Utilizadas

### Frontend:

* [SvelteKit](https://kit.svelte.dev/) - Framework fullstack moderno
* [TailwindCSS](https://tailwindcss.com) - Estilização moderna e responsiva
* [Supabase Auth](https://supabase.com) - Autenticação de usuários
* [Supabase Storage](https://supabase.com) - Upload de arquivos

### Backend/API:

* [ElevenLabs API](https://www.elevenlabs.io/) - Geração de narrações de IA
* [NewportAI (Dreamface) API](https://dreamface.ai) - Geração de vídeos com lipsync
* [Supabase Database](https://supabase.com) - PostgreSQL com Row Level Security

## 📚 Estrutura do Projeto

```
/src
  /routes
    /login        - Tela de login
    /register     - Tela de cadastro
    /dashboard    - Lista de criativos + modal novo
  /lib
    /components/NovoCriativoForm.svelte - Formulário modal
    /elevenlabs.js - Funções para consumir API ElevenLabs
    /dreamface.js - Funções para consumir API Dreamface
```

## 📝 Setup Local

1. Clone este repositório:

```bash
git clone https://github.com/jonathantx/ugc-generator.git
```

2. Instale as dependências:

```bash
npm install
```

3. Configure seu `.env` com as chaves:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ELEVENLABS_KEY=...
VITE_DREAMFACE_KEY=...
```

4. Rode o projeto localmente:

```bash
npm run dev

```

### 🛠️ Setup do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/)
2. Crie um bucket público chamado `videos` em `Storage`
3. Vá até o menu “SQL Editor” → cole e execute o conteúdo de [`supabase/supabase-setup.sql`](./supabase/supabase-setup.sql)

## 📄 Considerações Finais

Este projeto foi estruturado para refletir um fluxo real de geração de conteúdo UGC automatizado com tecnologias modernas de IA e cloud. Pode ser facilmente expandido com seleção de avatares, pastas e edição de criativos.

---

Desenvolvido por Jonathan Teixeira
