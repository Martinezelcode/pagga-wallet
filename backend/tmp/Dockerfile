# Dockerfile

# Use the official Node.js image as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Compile TypeScript
RUN npm run build

# Set working directory to /app/dist where compiled files are located
WORKDIR /app/dist

# Specify the port the container will use
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]
