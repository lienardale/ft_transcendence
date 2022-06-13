FROM node:16.15.0-alpine AS build

ENV NODE_ENV=production
# ENV NODE_ENV=development
WORKDIR /home/app
USER root
COPY  . .
RUN npm install && npm run build


FROM node:16.15.0-alpine as main
ENV NODE_ENV=production
WORKDIR /home/app
COPY --from=build /home/app /home/app
EXPOSE 3001
# CMD ["npm", "run", "start:dev"]
CMD ["npm", "run", "start"]
