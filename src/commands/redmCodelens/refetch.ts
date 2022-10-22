import { commands } from "vscode";
import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'refetch',
    async () => {
        try {
            await commands.executeCommand(
                'redmCodelens.executeRefetchRepository',
            );
        } catch (error) {
            
        }
    }
);
