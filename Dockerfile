FROM node:16

# RUN apt-get update \
#     && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

WORKDIR /app/
COPY . .
RUN npm config set strict-ssl false \
    && npm install \
    && npm run build

EXPOSE 80
CMD [ "npm", "start" ]