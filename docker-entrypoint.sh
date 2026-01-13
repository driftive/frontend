#!/bin/sh
set -e

# If ENV_CONFIG_PATH is set, copy the config file to the expected location
if [ -n "$ENV_CONFIG_PATH" ]; then
    if [ -f "$ENV_CONFIG_PATH" ]; then
        echo "Copying env config from $ENV_CONFIG_PATH to /usr/share/nginx/html/env-config.js"
        cp "$ENV_CONFIG_PATH" /usr/share/nginx/html/env-config.js
    else
        echo "Warning: ENV_CONFIG_PATH is set but file does not exist: $ENV_CONFIG_PATH"
    fi
fi

# Start nginx
exec nginx -g "daemon off;"
