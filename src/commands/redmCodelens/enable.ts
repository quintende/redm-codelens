import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'enable',
    () => {
        ConfigurationManager.setConfig('enabled', true)
    }
);
