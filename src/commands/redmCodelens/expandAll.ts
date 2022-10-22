import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'expandAll',
    () => {
        ConfigurationManager.setRuntimeConfig('globalCodeLensFlag', 'expandAll')
    }
);
