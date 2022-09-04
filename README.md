# The Quoter ![GitHub package.json version](https://img.shields.io/github/package-json/v/MaximMaximS/TheQuoter?style=for-the-badge) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/MaximMaximS/TheQuoter?style=for-the-badge)](https://www.codefactor.io/repository/github/maximmaxims/thequoter) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/MaximMaximS/TheQuoter?style=for-the-badge)](https://github.com/MaximMaximS/TheQuoter/commits/main)

TheQuoter (also known as "Hláškomat") ~~is~~ _will be_ server application for storing and viewing quotes (or rather, funny catchphrases). It was made for a school environment, but that may be subject to change _(probably not since that would mean a lot of work)_.

## Permissions

| Symbol | Meaning                     |
| ------ | --------------------------- |
| P      | Public                      |
| W      | Pending                     |
|        |                             |
| S      | Same class (as the user)    |
| N      | No class                    |
| O      | Own (Means user's existing) |
|        |                             |
| A      | Any                         |
| X      | None                        |

### Quotes

| Role        | Create  | View             | Edit    | Change state | Delete  |
| ----------- | ------- | ---------------- | ------- | ------------ | ------- |
| Admin       | A       | A                | A       | A            | A       |
| Moderator   | PS, WN  | P(S, N), W(S, O) | W(S, O) | WS           | W(S, O) |
| User        | W(S, N) | P(S, N), WO      | WO      | X            | WO      |
| Guest (TBA) | X       | PN               | X       | X            | X       |

### Classes

Managed by admins, others can only view.

### People

Managed by admins, others can only view. (Support for students is not yet implemented.)

## Usage

Be aware that the application is not yet fully functional.

Before you can use the application, you need to have a MongoDB cluster running.

### Docker

Create .env file with the following content:

```env
MONGODB_URI=<URI>
JWT_SECRET=<RANDOM> # Replace with a random string
```

Then run:

```shell
# Use the tag from the badge above without the `v`
docker pull maximmaxims/thequoter:<TAG>
docker run -p 3000:<PORT> --env-file ".env" maximmaxims/thequoter:<TAG>
```

### Build

Create .env file with the following content:

```env
MONGODB_URI=<URI>
JWT_SECRET=<RANDOM> # Replace with a random string
PORT=<PORT>
```

Then run:

```shell
git clone https://github.com/MaximMaximS/TheQuoter.git
cd TheQuoter
npm install --omit=dev --ignore-scripts
npm run build
npm run start
```
