# The Quoter ![GitHub package.json version](https://img.shields.io/github/package-json/v/MaximMaximS/TheQuoter?style=for-the-badge) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/MaximMaximS/TheQuoter?style=for-the-badge)](https://www.codefactor.io/repository/github/maximmaxims/thequoter) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/MaximMaximS/TheQuoter?style=for-the-badge)](https://github.com/MaximMaximS/TheQuoter/commits/main)

TheQuoter (also known as "Hláškomat") ~~is~~ _will be_ server application for storing and viewing quotes (or rather, funny catchphrases). It was made for a school environment, but that may be subject to change _(probably not since that would mean a lot of work)_.

## Roles and permissions

### Roles

| Role        | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| `admin`     | Manager of the database, accepts global quotes                                  |
| `moderator` | Can accept quotes from their own class, and moderates them                      |
| `user`      | Member of a class, can submit quotes globally or for their class                |
| `guest`     | Can view only global quotes, but cannot submit any, can request to join a class |

### Permissions

#### Users

These permissions aren't implemented yet.

| Role        | View & remove from class | Ban                |
| ----------- | ------------------------ | ------------------ |
| `admin`     | :white_check_mark:       | :white_check_mark: |
| `moderator` | From their class         | :x:                |

#### Quotes

| Symbol | Meaning                     |
| ------ | --------------------------- |
| `P`    | Public                      |
| `W`    | Pending                     |
|        |                             |
| `S`    | Same class (as the user)    |
| `N`    | No class                    |
| `O`    | Own (Means user's existing) |
|        |                             |
| `A`    | Any                         |
| `X`    | None                        |

| Role        | Create    | View               | Edit      | Publish | Delete    |
| ----------- | --------- | ------------------ | --------- | ------- | --------- |
| `admin`     | `A`       | `A`                | `A`       | `A`     | `A`       |
| `moderator` | `PS, WN`  | `P(S, N), W(S, O)` | `W(S, O)` | `WS`    | `W(S, O)` |
| `user`      | `W(S, N)` | `P(S, N), WO`      | `WO`      | `X`     | `WO`      |
| `guest`     | `X`       | `PN`               | `X`       | `X`     | `X`       |

#### Classes

| Role    | View               | Modify             |
| ------- | ------------------ | ------------------ |
| `admin` | :white_check_mark: | :white_check_mark: |
| Others  | :white_check_mark: | :x:                |

#### People

| Role    | View               | Modify             |
| ------- | ------------------ | ------------------ |
| `admin` | :white_check_mark: | :white_check_mark: |
| Others  | :white_check_mark: | :x:                |

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
