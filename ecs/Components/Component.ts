import {ComponentEnum} from "../../Enum";

export interface ComponentState{
  [key: string]: any;
}

export interface Component<S extends ComponentState>{
  enum: ComponentEnum;
  name: string;
  state: S;
}
