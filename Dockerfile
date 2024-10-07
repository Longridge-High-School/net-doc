#
# Net-Doc Docker File
#

# Start with the node alpine image
FROM node:20-alpine as base

# Install openssl for Prisma and NGINX
RUN apk update && apk add openssl nginx


# Create a new temp container called `deps` from `base`
# Add the package files and install all the deps.
  FROM base as deps

  RUN mkdir /app
  WORKDIR /app

  ADD package.json package-lock.json ./
  RUN npm install --production=false

# create a new temp container called `production-deps` from `base`
# copy the `deps` node_modules folder over and prune it to production only.
  FROM base as production-deps

  RUN mkdir /app
  WORKDIR /app

  COPY --from=deps /app/node_modules /app/node_modules
  ADD package.json package-lock.json ./
  RUN npm prune --production

# create a new temp container called `build` from `base`
# Copy over the full deps and run build.
  FROM base as build

  ENV NODE_ENV=production

  RUN mkdir /app
  WORKDIR /app

  COPY --from=deps /app/node_modules /app/node_modules

  ADD . .
  RUN npm run build

# Go back to the `base` image and copy in the production deps and build
FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/build/server /app/build/server
COPY --from=build /app/build/client /app/build/client
ADD . .

ENTRYPOINT [ "docker-entrypoint.sh" ]