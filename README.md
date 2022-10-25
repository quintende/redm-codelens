![codelens-github-banner](https://user-images.githubusercontent.com/17977249/163669670-1e679bda-c9d4-4a84-b669-d864db9ff09b.png)

The RedM CodeLens provides an easy way to see the Native Method when it is called via a Native Invoker. It provides you with the Native Method name and its parameters. No more searching for Native Methods is required, with the `Documentation` CodeLens you have direct access to your favourite Native Method documentation website.

## Features

* The CodeLens can be used for the following languages: Lua, JavaScript, TypeScript, C and C#
* The extension can run on VS Code Desktop and VS Code Web
* Show the matching Native Method name and parameters for corresponding Native Hash via the CodeLens above the Native Invoker line.
* Direct access to any documentation website, as long as it has a query url that supports the hash
* Enable or disable each part of the CodeLens rendering 
* Personalize what documentation website you want to use

&nbsp;
<p align="center">
  <img width="700" src="https://user-images.githubusercontent.com/17977249/197844138-e55db930-3e87-4030-b5ab-4030c8980fa3.png">
</p>


## Requirements

* Visual Studio Code `v1.63.0` or higher.
* Active internet connection (only on start-up) to fetch native dictionary.

## How to install

## Extension Settings

The extensions includes following settings:
* `redmCodelens.renderCodeLens`: enable/disable the rendering of the codelens for the native methods
* `redmCodelens.showPrefix`: enable/disable if a prefix (`0xE820.. ~ `) needs to be shown when having multiple native methods on one line

## Known Issues

See https://github.com/quintende/redm-codelens/issues for currently known issues.

## Release Notes

### 1.0.0

First release
