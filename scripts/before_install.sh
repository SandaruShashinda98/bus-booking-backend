#!/bin/bash
# Stop the running application if it exists
pm2 stop nestjs-app || true
pm2 delete nestjs-app || true
# Clean up the destination directory
rm -rf /home/ec2-user/nestjs-app/*
