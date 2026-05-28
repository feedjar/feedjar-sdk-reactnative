#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Building @feedjar/sdk-react-native..."
npm run build
npm test

read -r -p "npm one-time password (6 digits from authenticator): " OTP
if [[ ! "$OTP" =~ ^[0-9]{6,8}$ ]]; then
  echo "Invalid OTP." >&2
  exit 1
fi

npm publish --access public --otp="$OTP"
echo "Published $(node -p "require('./package.json').version")"
