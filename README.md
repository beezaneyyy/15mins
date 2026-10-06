# 15 Minutos

App de cursos rápidos em texto (aulas de até 15 min). React Native (Expo + Expo Router) com backend Node/Express e cursos mockados.

```
15min/
├── backend/   API Express — cursos mockados, progresso salvo em backend/data.json
└── app/       App Expo (React Native) — src/app = rotas, src/components = UI
```

## Rodando

```bash
# 1) API (porta 3333)
cd backend
npm install
npm start            # ou: npm run dev (reinicia ao salvar)

# 2) App
cd app
npm install
npx expo start       # a = Android, i = iOS, w = web, ou leia o QR no Expo Go
```

No celular físico o app usa automaticamente o IP da máquina que roda o Metro (`hostUri`) na porta 3333.
Celular e PC precisam estar na mesma rede. Para apontar para outro endereço:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333 npx expo start
```

## Telas

- **Início** — busca, "continue de onde parou", categorias, alternar claro/escuro
- **Explorar** — busca com debounce (ignora acentos), categorias e cursos em destaque
- **Curso** — detalhes, o que vai aprender, conteúdo com status de cada aula, salvar
- **Aula** — conteúdo em blocos (texto, código com destaque, dica, resumo) → "Você terminou esta aula?" → "Aula concluída!" → próxima aula
- **Parabéns** — conclusão do curso e certificado (com compartilhar)
- **Meus cursos**, **Certificados**, **Cursos salvos**, **Histórico**
- **Perfil** — estatísticas, tema (sistema/claro/escuro) e acessibilidade: tamanho do texto, alto contraste, espaçamento, reduzir animações, leitor de tela

## API

| Método | Rota | |
|---|---|---|
| GET | `/api/categories` | categorias com contagem |
| GET | `/api/courses?q=&category=&featured=true` | lista/busca |
| GET | `/api/courses/:id` | detalhe + aulas + progresso |
| GET | `/api/courses/:id/lessons/:index` | conteúdo da aula |
| POST | `/api/courses/:id/start` | inicia curso |
| POST | `/api/courses/:id/lessons/:index/complete` | conclui aula |
| POST | `/api/courses/:id/save` | salva/remove dos salvos |
| GET | `/api/me`, `/api/me/courses`, `/api/me/saved`, `/api/me/certificates[/:courseId]`, `/api/me/history` | dados do usuário |
| POST | `/api/dev/reset` | restaura os dados de demonstração |

Para adicionar cursos, edite `backend/src/data/courses.js`.
