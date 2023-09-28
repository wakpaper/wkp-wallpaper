const encodeUTF16 = (value:string):Uint8Array => {
  let buf = new ArrayBuffer(value.length * 2);
  let bufView = new Uint16Array(buf);
  for(var i = 0, strLen = value.length; i < strLen; i++){
    bufView[i] = value.charCodeAt(i);
  }
  return new Uint8Array(buf);
};

export default encodeUTF16;
