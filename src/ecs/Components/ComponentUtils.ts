import {Component, ComponentState} from "./Component";
import {ComponentEnum} from "../../Enum";
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

export type ComponentEnumKey = keyof typeof ComponentEnum;
export type ComponentIdentity<C extends Component<any>> = C | ComponentEnum | ComponentEnumKey;

export function isComponent<C extends Component<any>>(ident: ComponentIdentity<any>): ident is C{
  const c = <Component<any>>ident;
  return ("enum" in c && "name" in c && "state" in c);
}

export function isComponentEnum(ident: ComponentIdentity<any>): ident is ComponentEnum{
  return !isNaN(<number>ident) && ident in ComponentEnum;
}

export function isComponentName(ident: ComponentIdentity<any>): ident is ComponentEnumKey{
  return ident in ComponentEnum;
}

export class UnknownComponentError extends Error{
  constructor(ident: ComponentIdentity<any>){
    super(`No such component: ${ident}`);
    this.name = "UnknownComponentError";
  }
}

export function getDefaultComponent<C extends Component<any>>(ident: ComponentIdentity<any>): C{
  if(isComponent(ident)){
    return componentMap[ident.enum];
  }else if(isComponentEnum(ident)){
    return componentMap[ident];
  }else if(isComponentName(ident)){
    return componentMap[ident];
  }

  throw new UnknownComponentError(ident);
}

export function createComponent<S extends ComponentState, C extends Component<S>>(component: C, state: S): C{
  return Object.assign({}, component, {state: Object.assign({}, component.state, state)});
}

export function getComponentEnum(ident: ComponentIdentity<any>): ComponentEnum{
  return getDefaultComponent(ident).enum;
}

export function getComponentName(ident: ComponentIdentity<any>): ComponentEnumKey{
  return <ComponentEnumKey>getDefaultComponent(ident).name;
}
