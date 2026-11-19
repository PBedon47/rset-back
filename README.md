# R-set · Backend (Node + Express)

Solo sirve la encuesta "¿Cómo está tu semana?" (un voto por dispositivo, se puede cambiar).

```
npm install
npm start          # http://localhost:3001
```

| Método | Ruta | Cuerpo |
|---|---|---|
| GET | `/api/poll?voterId=…` | — |
| POST | `/api/poll` | `{ "voterId": "…", "option": "tranquila" \| "ritmo" \| "pausa" }` |
| GET | `/api/health` | — |

## Variables (ver `.env.example`)
- `CORS_ORIGIN`: dominio de tu web (obligatorio en producción).
- `DATA_DIR`: carpeta del archivo `poll.json`.

## Publicar (Render, Railway, Fly…)
Start command: `npm start`. Ojo: los votos se guardan en un archivo; en planes gratuitos sin disco persistente se pierden al redeplegar. Monta un disco y apunta `DATA_DIR` a él, o cambia el almacenamiento por una base de datos.
