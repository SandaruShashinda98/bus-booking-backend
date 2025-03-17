#!/bin/bash
cd /home/ec2-user/nestjs-app

# Load environment variables
set -a
source .env
set +a


# Start the application with PM2, passing the environment variables
pm2 start dist/src/main.js --name nestjs-app