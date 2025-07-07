# Usa Node LTS como base
FROM node:20

# Crea carpeta de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock a la carpeta destino, que siempre será el argumento final
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el resto
COPY . .

# Construye el proyecto
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Arranca la app
CMD ["npm", "run", "start:prod"]
