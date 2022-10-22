import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'reload',
    () => {
        /* The `onCommand:redmCodelens.reload` will ensure when this command is called the codelens provider will run again */
    }
);
