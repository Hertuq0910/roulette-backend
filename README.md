# Roulette API

Backend en Node.js + Express que permite crear ruletas, abrirlas para recibir apuestas y cerrarlas generando el resultado ganador. Está conectado a MongoDB mediante Mongoose y expone la documentación interactiva con Swagger UI para facilitar las pruebas.

## Requisitos
- Node.js 18+ y npm
- MongoDB en ejecución (por defecto `mongodb://localhost:27017/roulette`)

## Instalación y ejecución
```bash
git clone https://github.com/Hertuq0910/roulette-backend.git
cd roulette-backend
npm install

# Arrancar proyecto
npm start
```
El servidor escucha en `http://localhost:3000` (configurable con `PORT`) y usa la cadena definida en `MONGODB_URI` si está presente.

## Frontend básico
- Disponible en `http://localhost:3000/` (servido desde `public/index.html`).
- Permite seguir todo el flujo: crear, abrir, apostar (con header `user-id`) y cerrar ruletas, mostrando las respuestas en pantalla.
- No necesita build separado: se sirve con el mismo `npm start` del backend.

## Lógica de las APIs
Todas las rutas están bajo `/api/roulettes` (`routes/rouletteRoutes.js`):
- `POST /` – crea una ruleta con estado `created` y devuelve su `id`.
- `PATCH /:id/open` – cambia el estado a `open` si aún no se ha abierto/cerrado.
- `POST /:id/bets` – registra apuestas de tipo `number` o `color` mientras la ruleta está abierta. Requiere header `user-id`. Número entre 0-36, colores `red`/`black`, monto 1-10000.
- `POST /:id/close` – sortea un número ganador, calcula los pagos (`x5` para número, `x1.8` para color), marca cada apuesta como ganadora o perdedora, y cierra la ruleta.

Los modelos (`models/Roulette.js` y `models/Bet.js`) guardan los estados y las apuestas, incluyendo los campos calculados cuando se cierra la ruleta.

## Documentación Swagger
- URL: `http://localhost:3000/api-docs`
- Función: permite visualizar los esquemas, enviar peticiones y guardar el header `user-id` desde el botón **Authorize** (security scheme `userIdHeader`).
- Incluye ejemplos de cuerpo, respuestas y errores para cada endpoint.

## Flujo típico de prueba
1. Crear ruleta: `POST /api/roulettes`.
2. Abrir ruleta: `PATCH /api/roulettes/{id}/open`.
3. Apostar: `POST /api/roulettes/{id}/bets` agregando `user-id` y el JSON requerido.
4. Cerrar ruleta: `POST /api/roulettes/{id}/close` para ver ganador y pagos.

Puedes usar Swagger, Postman o `curl`. Ejemplo `curl` para apostar:
```bash
curl -X POST "http://localhost:3000/api/roulettes/<id>/bets" \
  -H "Content-Type: application/json" \
  -H "user-id: demo-user-1" \
  -d '{"betType":"color","color":"red","amount":500}'
```

## Componentes principales
- `app.js`: configuración de Express, conexión a Mongo, rutas y Swagger UI.
- `routes/rouletteRoutes.js`: lógica HTTP de creación, apertura, apuestas y cierre.
- `models/Roulette.js` y `models/Bet.js`: esquemas Mongoose con estados y resultados.
- `swagger.js`: especificación OpenAPI 3.0 utilizada por Swagger UI.
