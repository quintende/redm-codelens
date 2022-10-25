![codelens-github-banner](https://user-images.githubusercontent.com/17977249/163669670-1e679bda-c9d4-4a84-b669-d864db9ff09b.png)

The RedM CodeLens provides an easy way to see the Native Method Reference when invoking a hash with the native method invoker. It will provide you with the corresponding native method name and and its parameters. No more searching native methods, with the `Documentation` CodeLens it will bring you directly to the corresponding documentation page.

The CodeLens can be used on Lua, JavaScript, TypeScript, C and C# files in VS Code Desktop and VS Code web.

## Features

* Show the matching method name for corresponding native hash via codelens above the Native Invoker line.
* Provides RedM Native Reference via CodeLens for Lua, JavaScript, TypeScript, C and C# files in VS Code.

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
