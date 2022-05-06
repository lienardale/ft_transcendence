FROM node:latest

ENV NODE_ENV=production
# ENV NODE_ENV=development

WORKDIR /app

USER root

COPY . .

RUN yarn
RUN yarn build

EXPOSE 3000

# CMD [ "yarn", "dev" ]
CMD [ "yarn", "start" ]