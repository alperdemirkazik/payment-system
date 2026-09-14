FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite'ın dışarıdan erişime izin vermesi için --host bayrağı şarttır!
CMD ["npm", "run", "dev", "--", "--host"]