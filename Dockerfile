FROM node:12.22.7-alpine3.12 as psea_builder
RUN apk update
RUN apk add --update bash

RUN apk add git
RUN npm install -g --unsafe-perm polymer-cli
RUN npm install -g typescript@4.x

WORKDIR /tmp
ADD . /tmp/
RUN npm ci
# echo done is used because tsc returns a non 0 status (tsc has some errors)
RUN tsc || echo done
RUN export NODE_OPTIONS=--max_old_space_size=4096 && polymer build

FROM node:12.22.7-alpine3.12 as psea_prod
RUN apk update
RUN apk add --update bash

WORKDIR /code
RUN npm install express@4.17.1
RUN npm install browser-capabilities@1.1.3
COPY --from=psea_builder /tmp/express.js /code/express.js
COPY --from=psea_builder /tmp/build /code/build
EXPOSE 8080
CMD ["node", "express.js"]
