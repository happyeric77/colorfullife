# Use the latest stable version of Node.js as base image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json to /app
COPY package*.json ./

# Install the project dependencies
RUN yarn install

# Copy the source code to /app
COPY . .

# Start the interval task using the `npm start` command
CMD ["yarn", "start"]