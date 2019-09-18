FROM node:11.9.0-alpine as psea_builder
RUN apk update
RUN apk add --update bash

RUN apk add git
RUN npm install -g --unsafe-perm polymer-cli
RUN npm install -g typescript

ADD . /code/
WORKDIR /code
RUN npm cache verify
RUN npm i
# echo done is used because tsc returns a non 0 status (tsc has some errors)
RUN tsc || echo done
RUN export NODE_OPTIONS=--max_old_space_size=4096 && polymer build

FROM node:11.9.0-alpine
RUN apk update
RUN apk add --update bash

WORKDIR /code
RUN npm install express --no-save
RUN npm install browser-capabilities@1.1.3 --no-save
COPY --from=psea_builder /code/express.js /code/express.js
COPY --from=psea_builder /code/build /code/build
EXPOSE 8080
CMD ["node", "express.js"]
