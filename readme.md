# Project Setup

## Node project initialization
- Initialize node project: npm init
- Install essential fastify related package: npm i fastify pino-pretty dotenv
- Add typescript support: npm i -D typescript @types/node
- Initialize project typescript support: npx tsc --init
- Essential typescript settings: set tsconfig.json compilerOptions.outDir, compilerOptions.rootDir
- Install hot reload required package: npm i -D concurrently nodemon
- script
  - build: "tsc"
  - dev: "concurrently \"tsc -w\" \"nodemon dist/index.js\""
- Add .gitignore Node project version
- Add .env file
- With MongoDB: npm i mongoose

## Add backend endpoint

## MongoDB
docker run -d -p 27017:27017 mongo:6.0.6
brew services start mongodb-community@6.0
brew services stop mongodb-community@6.0