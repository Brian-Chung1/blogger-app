FROM node:14-slim 

WORKDIR /app

COPY package*.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
       then npm install; \
       else npm install --only=production; \
       fi

COPY . ./

EXPOSE 3001

CMD [ "node", "index.js" ]