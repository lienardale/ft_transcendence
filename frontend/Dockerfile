FROM node:16.15.0-alpine as build

ENV NODE_ENV=production
# ENV NODE_ENV=development
WORKDIR /app
USER root
COPY . .
RUN yarn && yarn build

FROM node:16-alpine as main
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
# CMD [ "yarn", "dev" ]
CMD [ "yarn", "start" ]