---
title: Passwords
layout: page
menubar: docs_menu
---

Passwords are built in asset that stores user account details. The `password`
part of a Password is stored in the database using reversible encryption.

> The reversible encryption of the database uses the `PASSWORD_KEY`,
> `PASSWORD_SALT` and `PASSWORD_IV` environment variables to encrypt the
> password using the `aes-192-cbc` algorithm. You can see the encryption code in
> [crypto.server.ts](https://github.com/Longridge-High-School/net-doc/blob/main/app/lib/crypto.server.ts).
> Make sure that you have a backup of the KEY, SALT and IV as your encrypted
> passwords will be useless without them.
