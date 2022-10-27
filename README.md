![codelens-github-banner](https://user-images.githubusercontent.com/17977249/163669670-1e679bda-c9d4-4a84-b669-d864db9ff09b.png)

> The **RedM CodeLens** provides an easy way to view the Red Dead Native Method used by a Native Invoker in VS Code. With the CodeLens you also gain the ability to quickly lookup the Native Method used in a Native Invoker. Fully configurable rendering of the CodeLens, select the documentation websites you want, and much more! 

## Features

* The CodeLens can be used for the following languages: Lua, JavaScript, TypeScript, C and C#.
* The extension can run on VS Code Desktop and VS Code Web.
* Show the matching Native Method name and parameters for corresponding Native Hash via the CodeLens above the Native Invoker line.
* Direct access to any documentation website, as long as it has a query url that supports the hash.
* Enable or disable each part of the CodeLens rendering.
* Personalize what documentation website you want to use.

&nbsp;
<p align="center">
  <img width="700" src="https://user-images.githubusercontent.com/17977249/197844138-e55db930-3e87-4030-b5ab-4030c8980fa3.png">
</p>


## Requirements

* Visual Studio Code `v1.63.0` or higher.
* Active internet connection (only on start-up) to fetch native dictionary.

## How to install
You 

## Extension Settings

##### `redmCodelens.documentation.renderCodelens`
*Controls whetever the **Documentation** CodeLens is shown.*
##### `redmCodelens.documentation.links` 
*Configure associated documentation dictionaries that have a builtin query url. Use **${hash}** for query value.*
##### `redmCodelens.documentation.showQuickPick`
*Controls whetever all documentation dictionaries are shown when clicking on the **Documentation** CodeLens. When disabled, the first item from **redmCodelens.documentation.links** will be used.*
##### `redmCodelens.native.renderCodelens`
*Controls whetever the **SomeNativeMethod(id: number): void** Native Method CodeLens is shown.*
##### `redmCodelens.native.showPrefix`
*Controls whetever a prefix **0x7265.. ~ SomeNativeMethod(id: number): void** is shown in the Native Method CodeLens when multiple native methods are used on the same line.*

## Known Issues

See https://github.com/quintende/redm-codelens/issues for currently known issues.
