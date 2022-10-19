import { window, env, Uri } from "vscode";
import ConfigurationManager from "../../config/configurationManager";
import { snakeToPascalCase } from "../../util/helpers";
import { NativeMethod } from "../../util/nativeMethodsRepository";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build(
    'openDocumentation',
    async (showMultipleMethods: boolean, nativeMethods: NativeMethod[]) => {

        function capitalizeFirstLetter(string: string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        const selectNativeMethod = showMultipleMethods
            ? await window.showQuickPick(
                nativeMethods.map((nativeMethod: NativeMethod) => {
                    //const url = `${searchQuery}${hash}`;
                    const { name, hash } = nativeMethod;

                    return {
                        label: snakeToPascalCase(name), description: hash, detail: name, hash: hash, result: nativeMethod
                    };
                }),
                { title: 'Select a Native Method' }
            )
            : { result: nativeMethods[0] };

        if (!selectNativeMethod) { return; }

        const { name, hash } = selectNativeMethod.result;
        const links = ConfigurationManager.getConfig<string[]>('documentation.links');

        if (!Array.isArray(links) || links.length === 0) {
            window.showErrorMessage("Failed to get documation links. The setting 'RedM CodeLens > Documentation > links' should atleast have one entry.")
            return;
        }

        const urls = links.map(link => {
            const { hostname, origin, pathname } = new URL(link);

            return { label: capitalizeFirstLetter(hostname.split('.')[hostname.split('.').length - 2]), detail: `${origin}${pathname}`, url: link.replace('${hash}', hash) }
        });

        if (ConfigurationManager.assertConfig('documentation.showQuickPick', false)) {
            const [firstPick] = urls;
            env.openExternal(Uri.parse(firstPick.url));
            return;
        }

        const target = await window.showQuickPick(
            urls,
            { title: 'Select which documentation website you want to open' });

        if (!target) {
            return;
        }

        env.openExternal(Uri.parse(target.url));
    }
);
