import CommandBuilder from "../base/commandBuilder";

export default CommandBuilder.build( 
    'requestCollapsedStateChange',
    (func: Function ) => func() 
);
