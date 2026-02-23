# navigate to the project folder 
cd project
# Run project
npx expo start

## OPOTION 1 
scan QR Code on expo Go 

#   OPTION 2
manually enter url  exp://192.168.4.158:8081     ## use your ip address  ## 

# 1. Update expo package to SDK 54
npm install expo@54.0.0 --legacy-peer-deps   ##  Use current SDK

# 2. Upgrade all Expo packages to SDK 54 compatible versions
npx expo install --fix

# 3. Update react and react-native to SDK 54 versions
npm install react@19.0.0 react-native@0.79.2 --legacy-peer-deps

# 4. Update @types/react to match React 19
npm install -D @types/react@19.0.0 --legacy-peer-deps
