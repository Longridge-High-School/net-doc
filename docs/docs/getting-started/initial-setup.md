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
| Device Name      | Hostname field for any device on the network. |   text   |                |                                              |
| Asset            | Relation to Asset Register                    | relation | Asset Register |                                              |
| Operating System | A select field for operating systems          |  select  |                | Windows 10, Windows 11 (Each on a new line). |

As with the asset register create a new asset using these feilds and these
settings:

|          |                  |
| :------- | :--------------- |
| Name     | Windows Computer |
| Slug     | windows-computer |
| Singular | Computer         |
| Plural   | Computers        |
| ACL      | Default          |

| Field            | Helper Text                               | Order | Display on Table |
| :--------------- | :---------------------------------------- | :---: | :--------------: |
| Device Name      | The computers hostname                    |   1   |       `no`       |
| Asset            | The Asset Register tag for this computer. |   2   |       `no`       |
| Operating System | The operating system on the computer      |   3   |       `no`       |

Edit the asset once you have added all the fields with these settings:

|            |             |
| :--------- | :---------- |
| Icon       | 🖥️          |
| Name Field | Device Name |
| Sort Field | Device Name |

### ChromeOS Device

As with Windows Computers we need to create a new asset, but this time we
already have all the fields we need. The only change needed is to edit the
`Operating System` field to have `ChromeOS` as an additional option.

Follow the same procedure as the Windows Computers to create teh asset with
these settings:

|          |                  |
| :------- | :--------------- |
| Name     | ChromeOS Device  |
| Slug     | chromeos-device  |
| Singular | ChromeOS Device  |
| Plural   | ChromeOS Devices |
| ACL      | Default          |

| Field            | Helper Text                                 | Order | Display on Table |
| :--------------- | :------------------------------------------ | :---: | :--------------: |
| Device Name      | The chromebooks hostname                    |   1   |       `no`       |
| Asset            | The Asset Register tag for this chromebook. |   2   |       `no`       |
| Operating System | The OS of the Chromebook.                   |   3   |       `no`       |

Edit the asset once you have added all the fields with these settings:

|            |             |
| :--------- | :---------- |
| Icon       | 💻          |
| Name Field | Device Name |
| Sort Field | Device Name |

## Adding Data

Its now possible to add data to Net-Doc!

Lets say there is a Windows Computer on the network called `Desktop-456`. It's a
`HP EliteDesk 800 G4`, serial number `CND123456`, Asset Tag `ND00123`, in the
`Main Office`, and running `Windows 11`.

From the sidebar select the newly created _Asset Register_ and hit _Add Asset_
at the top right.

The new Asset needs the _Asset Tag_ `ND00123`, the _Make/Model_ of
`HP EliteDesk 800 G4`, _serial number_ of `CND123456` and the _location_ of
`Main Office`.

Now head to the _Windows Computer_ asset and hit _Add Asset_ again.

This time the _device name_ is `Desktop-456` and the _operating system_ is
`Windows 11`. In the _Asset_ field search for the Asset tag `ND00132`. Setting
this will link the two assets. The Windows Computer will have an value in its
entry that links to the Asset Register Entry. The Asset Register will have a
linked asset in sidebar to the Windows Computer.
