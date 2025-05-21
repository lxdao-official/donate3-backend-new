FROM node:16-slim

RUN apt-get update \
    && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/
COPY package*.json ./
RUN npm install --production \
    && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 80
CMD [ "npm", "start" ]