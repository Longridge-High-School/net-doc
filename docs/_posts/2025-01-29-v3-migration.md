---
layout: post
title: 'Welcome to the Documentation'
date: 2025-01-29 12:29:04 +0000
categories: migration
author: Adam Laycock
---

Welcome to Version 3.0.0 of Net-Doc!

This version adds a couple of new features and fixes some bugs, but does contain
a Breaking Change

Now that the Prisma schema is split across multiple files the path to the
database needs changing if it was defined as a relative path.

To update to version 3 you need to change your `docker-compose.yml` so that:

- The docker tag is 3, so your image needs to be
  `image: longridgehighschool/net-doc:3`
- The env variable `DATABASE_URL` (if using `./`) needs to be changed to `../`
