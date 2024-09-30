---
title: Intial Setup
layout: page
menubar: docs_menu
---

# Initial Setup

Once you have the [docker image](/docs/getting-started/installation) running
open your browser to `http://docker-host:3000` and you will be greeted with the
login screen. The defaut login details are:

|Email|admin@net.doc|Password|1234|

## First Steps

Net-Doc comes completely empty. For this example we are going to build an asset
register that stores asset entries with the make and model, then has an asset
for _Windows Computer_ and _Chrome OS Device_.

### Asset Register fields

Before creating the [asset](/net-doc/docs/concepts/assets/) there needs to be
[fields](/net-doc/docs/concepts/fields) that can be added to it.

From the field manager add a few new fields.

| Name          | Description                                  | Type |
| :------------ | :------------------------------------------- | :--: |
| Asset Tag     | Name field for the asset register.           | text |
| Make/Model    | Used to store the make/model of an asset.    | text |
| Location      | Used to store the location of an asset.      | text |
| Serial Number | Used to store the serial number of an asset. | text |

### Creating the Asset Register asset

From the asset manager create a new asset.

|          |                |
| :------- | :------------- |
| Name     | Asset Register |
| Slug     | asset-register |
| Singular | Asset          |
| Plural   | Assets         |
| ACL      | Default        |

This will take you to the new asset.

From the _add field_ list select all the fields from the previous step using
these values:

| Field         | Helper Text                    | Order | Display on Table |
| :------------ | :----------------------------- | :---: | :--------------: |
| Asset Tag     | The assets tag                 |   1   |       `no`       |
| Make/Model    | The make/model of the asset    |   2   |      `yes`       |
| Location      | The location of the asset      |   3   |      `yes`       |
| Serial Number | The serial number of the asset |   4   |      `yes`       |

Now edit the asset to fill in the rest of the settings.

|            |           |
| :--------- | :-------- |
| Icon       | 🏢        |
| Name Field | Asset Tag |
| Sort Field | Asset Tag |

The rest can be left at default.

By Setting the `Asset Tag` as the
[name field](/net-doc/docs/concepts/assets#name-field) it automatically appears
on the table.

Once this has been saved the asset register will update on the sidebar with its
new icon.

### Windows Computer

Having a simple asset register isn't that helpful but this is where Net-Doc's
relations come into play.

This asset will need some more fields.

| Name             | Description                                   |   Type   | Asset Relation | Options                                      |
| :--------------- | :-------------------------------------------- | :------: | :------------- | :------------------------------------------- |
| Hostname         | Hostname field for any device on the network. |   text   |                |                                              |
| Asset            | Relation to Asset Register                    | relation | Asset Register |                                              |
| Operating System | A select field for operating systems          |  select  |                | Windows 10, Windows 11 (Each on a new line). |

As with the asset register create a new asset using these feilds.
