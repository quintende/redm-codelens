export default {
    lua: /Citizen\.InvokeNative\((.*?)[,)]/g,
    c: /::(_0x.*?)\(/g,
    csharp: /Function\.Call<?(.*?)>?\((?:\(Hash\))?(.*?)[,)]/g,
    javascript: /Citizen\.invokeNative\((.*?)[,)]/g,
    typescript: /Citizen\.invokeNative<?(.*?)>?\((.*?)[,)]/g
};