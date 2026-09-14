# Temel olarak hafif bir Node.js sürümü kullan
FROM node:20-alpine

# Konteyner içinde çalışma klasörü oluştur
WORKDIR /app

# Sadece paket listesini kopyala ve indir (Hız kazandırır)
COPY package*.json ./
RUN npm install

# Bütün kodları konteynere kopyala
COPY . .

# 5000 portunu dışarı aç
EXPOSE 5000

# Motoru ateşle
CMD ["node", "server.js"]