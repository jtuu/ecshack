import {KeyCode, CommandType} from "./Enum";

interface Option{
  key: KeyCode;
  value: CommandType;
  enabled: boolean;
}

export function loadConfigFromPath(path: string): Promise<Array<Option>>{
  return fetch(path).then(response => response.text())
    .then(parseConfig);
}

export function parseConfig(file: string): Array<Option>{
  return file.split(/\n|\r\n/).map((line): Option => {
    line = line.trim();
    const enabled = line.startsWith("#");
    var [rawKey, rawValue] = line.split(" ");
    var key, value;

    if(rawKey in KeyCode){
      key = <KeyCode>KeyCode[rawKey];
    }

    if(rawValue in CommandType){
      value = <CommandType>CommandType[rawValue];
    }

    return {
      key,
      value,
      enabled
    };
  });
}
