import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import Entity from "../Entity";

export interface StorageState extends ComponentState{
  contents: Set<Entity>;
  maxSize: number;
}

export interface StorageComponent extends Component<StorageState>{
  state: StorageState;
}

export const Storage: StorageComponent = {
  enum: ComponentType.Storage,
  name: ComponentType[ComponentType.Storage],
  state: {
    maxSize: 0,
    get contents(){
      return new Set();
    }
  }
}
