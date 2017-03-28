import {LogMessageType} from "./Enum";

export interface LogMessage{
  id: number;
  text: string;
  type: LogMessageType;
}

export class MessageLog{
  private messageIdCounter: number = 0;
  private log: Array<LogMessage> = [];

  constructor(){}

  public addMessage(text: string, type: LogMessageType = LogMessageType.DEFAULT): void{
    this.log.push({id: this.messageIdCounter++, text, type});
  }
}
