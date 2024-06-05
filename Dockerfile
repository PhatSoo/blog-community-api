FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

# RUN rm -rf node_modules
RUN npm install

EXPOSE 8000

CMD ["npm", "run", "dev"]