#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

osascript -e "
tell application \"Terminal\"
  activate
  do script \"cd '$DIR/backend' && npm run start:dev\"
  do script \"cd '$DIR/frontend' && npm run dev\"
end tell
"
