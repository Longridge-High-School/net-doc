---
title: Install
layout: page
menubar: docs_menu
toc: true
---

# Install

Net-Doc is distributed as a docker container.

## Docker Compose

> The tag `latest` will always pull the latest
> [release](https://github.com/Longridge-High-School/net-doc/releases), `main`
> will pull the latest commit to the main branch.

```yml
version: '3.9'
services:
  remix:
    image: longridgehighschool/net-doc:latest
    restart: always
    ports:
      - '3000:3000'
    environment:
      - PASSWORD_KEY=YOUR KEY
      - PASSWORD_SALT=YOUR SALT
      - PASSWORD_IV=YOUR IV
      - DATABASE_URL=file:./data/net-doc.db
    volumes:
      - ./db:/app/prisma/data
      - ./uploads:/app/public/uploads
      - ./backups:/app/public/backups
  redis:
    image: redis:7
    restart: always
    volumes:
      - ./data/redis:/data
    ports:
      - 6379:6379
```

### Environment Variables

| Variable        | Value                                                                                                       |
| :-------------- | :---------------------------------------------------------------------------------------------------------- |
| `PASSWORD_KEY`  | Your unique Password Key. Used to encrypt the passwords stored in the database.                             |
| `PASSWORD_SLAT` | Your unique Password Salt. Used to salt the value for encryption of passwords in the database.              |
| `PASSWORD_IV`   | The initiation vector for your password encryption. Needs to be a 16 Character HEX Value.                   |
| `DATABASE_URL`  | The file path to your database. Should be `file:./data/something.db` so that the data is stored on the host |

### Volumes

| Container Path        | Purpose                                                   |
| :-------------------- | :-------------------------------------------------------- |
| `/app/prisma/data`    | Contains the sqlite database                              |
| `/app/public/uploads` | [Attachments](/docs/fields/attachment) are uploaded here. |
| `/app/public/backups` | Contains the generated backup files                       |
