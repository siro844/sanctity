FROM node:22

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g pnpm
RUN pnpm install
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start:prod"]