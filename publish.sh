npm i
tsc
VERSION=`node index version`
npm publish --otp=$1 && git add . && git commit -m "Release version $VERSION" && git pu
