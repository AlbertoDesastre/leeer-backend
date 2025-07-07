# Imagen 1: sólo tiene las dependencias. Esto es bueno porque siempre utilizará la misma imagen en caché hasta que las dependencias cambien y eso acelera el build de los contenedores.
FROM node:20.19.3-alpine3.22 AS dependencies
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install ci

# Imagen 2: se copia el código FUENTE (no la compilación resultante) y construye la app con las dependencias cacheadas de la capa anterior
FROM node:20.19.3-alpine3.22 AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagen 3: Imagen final de producción, copia los package e instala SOLO LAS DEPENDENCIAS NECESARIAS DE PRODUCCIÓN (se omiten las Devdependencies). Además, se copia únicamente el programa compilado (dist) y la imagen final excluye el código fuente, dando como resultado una imagen super limpia y livian porque no tiene ni código fuente ni dependencias de desarrollo.
FROM node:20.19.3-alpine3.22 AS runner
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --prod
COPY --from=builder /app/dist ./dist

# # Dar permiso para ejecutar la applicación
# Crea un usuario nuevo llamado leeeruser sin contraseña (no puede hacer login interactivo).
RUN adduser --disabled-password leeeruser 
RUN chown -R leeeruser:leeeruser ./
USER leeeruser

CMD [ "node","dist/main" ]