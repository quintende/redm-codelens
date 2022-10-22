import ConfigurationManager from "../../config/configurationManager";
import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'collapseAll',
    () => {
        ConfigurationManager.setRuntimeEvent('collapseAll')
    }
);
