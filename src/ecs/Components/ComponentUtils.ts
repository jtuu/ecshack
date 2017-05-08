import {Component, ComponentState} from "./Component";
import {ComponentType} from "../../Enum";
import * as components from "./";

interface ComponentMap<C extends Component<any>>{
  [key: string]: C;
  [key: number]: C;
}

const componentMap: ComponentMap<any> = {};
for(const [key, component] of Object.entries(components)){
  componentMap[component.enum] = component;
  componentMap[component.name] = component;
}

export type ComponentTypeKey = keyof typeof ComponentType;
export type ComponentIdentity<C extends Component<any>> = C | ComponentType | ComponentTypeKey;

export function isComponent<C extends Component<any>>(ident: ComponentIdentity<any>): ident is C{
  const c = <Component<any>>ident;
  return typeof c === "object" && ("enum" in c && "name" in c && "state" in c);
}

export function isComponentTypeEnum(ident: ComponentIdentity<any>): ident is ComponentType{
  return !isNaN(<number>ident) && ident in ComponentType;
}

export function isComponentName(ident: ComponentIdentity<any>): ident is ComponentTypeKey{
  return ident in ComponentType;
}

export class UnknownComponentError extends Error{
  constructor(ident: ComponentIdentity<any>){
    const message = `No such component: ${ident} (${getDefaultComponent(ident).name})`;
    super(message);
    this.name = "UnknownComponentError";
    if (typeof Error["captureStackTrace"] === "function") {
      Error["captureStackTrace"](this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export function getDefaultComponent<C extends Component<any>>(ident: ComponentIdentity<any>): C{
  if(isComponentTypeEnum(ident)){
    return componentMap[ident];
  }else if(isComponent(ident)){
    return componentMap[ident.enum];
  }else if(isComponentName(ident)){
    return componentMap[ident];
  }

  throw new UnknownComponentError(ident);
}

export function createComponent<S extends ComponentState, C extends Component<S>>(component: C, state: S): C{
  return Object.assign({}, component, {state: Object.assign({}, component.state, state)});
}

export function getComponentType(ident: ComponentIdentity<any>): ComponentType{
  return getDefaultComponent(ident).enum;
}

export function getComponentName(ident: ComponentIdentity<any>): ComponentTypeKey{
  return <ComponentTypeKey>getDefaultComponent(ident).name;
}
