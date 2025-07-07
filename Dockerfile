# Creo mi máquina con la versión 20 de node y un SO Linux alpine con lo mínimo para que corra
FROM node:20.19.3-alpine3.22

# Crea carpeta de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia todo mi proyecto a la carpeta destino, que siempre será el argumento final
COPY . ./
COPY package*.json tsconfig.json tsconfig.build.json ./

# Instala dependencias y crea la build de producción
RUN npm install 
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Arranca la app
CMD ["npm", "run", "start:prod"]
