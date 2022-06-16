# The Quoter ![GitHub package.json version](https://img.shields.io/github/package-json/v/MaximMaximS/TheQuoter?style=for-the-badge) [![GitHub license](https://img.shields.io/github/license/MaximMaximS/TheQuoter?style=for-the-badge)](https://github.com/MaximMaximS/TheQuoter/blob/main/LICENSE) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://prettier.io/) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/MaximMaximS/TheQuoter?style=for-the-badge)](https://www.codefactor.io/repository/github/maximmaxims/thequoter) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/MaximMaximS/TheQuoter?style=for-the-badge)](https://github.com/MaximMaximS/TheQuoter/commits/main)

TheQuoter (also known as "Hláškomat") is server application for storing and viewing quotes (or rather, funny catchphrases). It was made for a school environment, but that may be subject to change.

## Usage

Be aware that the application is not yet fully functional.

Before you can use the application, you need to have a MongoDB database.

### Docker

Create .env file with the following content:

```env
MONGODB_URI=<URI>
JWT_SECRET=<RANDOM>
```

Note: Replace `<URI>` with the URI of your MongoDB database and `<RANDOM>` with a random string.

```shell
docker pull maximmaxims/thequoter:<TAG>
docker run -p 3000:<PORT> --env-file ".env" maximmaxims/thequoter:<TAG>
```

Note: Replace `<TAG>` with the tag of the image you want to use (version from the badge above without the V) and `<PORT>` with the port you want to use.

### Build

Create .env file with the following content:

```env
MONGODB_URI=<URI>
JWT_SECRET=<RANDOM>
PORT=<PORT>
```

Note: Replace `<URI>` with the URI of your MongoDB database, `<RANDOM>` with a random string and `<PORT>` with the port you want to use.

```shell
git clone https://github.com/MaximMaximS/TheQuoter.git
cd TheQuoter
npm install --production --ignore-scripts
npm run build
npm run start
```
