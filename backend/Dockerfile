FROM node:latest

ENV NODE_ENV=production
# ENV NODE_ENV=development

WORKDIR /home/app

USER root

COPY  . .

RUN npm install
RUN npm run build

EXPOSE 3001

# CMD ["npm", "run", "start:dev"]
CMD ["npm", "run", "start"]
