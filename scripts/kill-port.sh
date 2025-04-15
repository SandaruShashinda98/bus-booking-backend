#!/bin/bash

# Script to kill processes using specific ports and restart applications
# Usage: ./port-killer.sh <port1> <port2> ... [--restart-nest] [--restart-react]

# Function to kill process using a specific port
kill_port() {
  local port=$1
  echo "Checking port $port..."
  
  # For Linux/Mac
  if command -v lsof > /dev/null; then
    pid=$(lsof -i :$port -t)
    if [ -n "$pid" ]; then
      echo "Found process $pid using port $port. Killing it..."
      kill -9 $pid
      echo "Process killed."
    else
      echo "No process found using port $port."
    fi
  # For Windows
  elif command -v netstat > /dev/null && command -v taskkill > /dev/null; then
    pid=$(netstat -ano | grep ":$port" | grep "LISTENING" | awk '{print $NF}')
    if [ -n "$pid" ]; then
      echo "Found process $pid using port $port. Killing it..."
      taskkill /F /PID $pid
      echo "Process killed."
    else
      echo "No process found using port $port."
    fi
  else
    echo "Could not find lsof or netstat. Please install them to use this script."
    exit 1
  fi
}

# Parse arguments
ports=()
restart_nest=false
restart_react=false

for arg in "$@"; do
  if [[ $arg == "--restart-nest" ]]; then
    restart_nest=true
  elif [[ $arg == "--restart-react" ]]; then
    restart_react=true
  else
    ports+=($arg)
  fi
done

# Kill processes on specified ports
for port in "${ports[@]}"; do
  kill_port $port
done

# Wait a moment to ensure ports are freed
sleep 2

# Restart applications if requested
if $restart_nest; then
  echo "Restarting NestJS application..."
  cd $(dirname "$0")/path/to/your/nest/app && npm run start:dev &
fi

if $restart_react; then
  echo "Restarting React application..."
  cd $(dirname "$0")/path/to/your/react/app && npm run dev &
fi

echo "Done!"