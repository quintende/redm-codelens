import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'disable',
    () => {
        ConfigurationManager.setConfig('enabled', false)
    }
);
