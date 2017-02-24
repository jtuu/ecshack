import * as Components from "./Components";
import {Component, ComponentState} from "./Components/Component";
import {
  ComponentIdentity,
  UnknownComponentError,
  createComponent,
  getComponentEnum,
  getDefaultComponent,
  isComponent,
  isComponentEnum,
  isComponentName,
} from "./Components/ComponentUtils";
import AssemblageData from "./AssemblageData";
import {ComponentEnum} from "../Enum";
import Entity from "./Entity";
import {intersection} from "lodash";

export default class EntityManager{
  private entityCounter: number = 0;
  private entityStore: Map<ComponentEnum, Map<Entity, Component<any>>> = new Map();

  constructor(){}

  public createEntity(): Entity{
    return new Entity();
  }

  public createEntityFromAssemblage(assemblage: AssemblageData): Entity{
    const entity = new Entity();
    for(const [name, state] of Object.entries(assemblage)){
      this.addComponent(entity, createComponent(getDefaultComponent(name), state));
    }
    return entity;
  }

  public addComponent<S extends ComponentState, C extends Component<S>>(entity: Entity, component: C, state?: S): Entity{
    component = createComponent(component, (state || {}));
    var map = this.entityStore.get(component.enum);
    if(!map){
      map = new Map();
      this.entityStore.set(component.enum, map);
    }
    map.set(entity, component);
    return entity;
  }

  public removeComponent<C extends Component<any>>(entity: Entity, ident: ComponentIdentity<any>): Entity{
    const componentEnum: ComponentEnum = getComponentEnum(ident);
    const map = this.entityStore.get(componentEnum);
    map.delete(entity);
    if(!map.size){
      this.entityStore.delete(componentEnum);
    }
    return entity;
  }

  public getComponent<C extends Component<any>>(entity: Entity, ident: ComponentIdentity<any>): C{
    const componentEnum: ComponentEnum = getComponentEnum(ident);
    if(componentEnum){
      const map = this.entityStore.get(componentEnum);
      if(map){
        return (<C>map.get(entity));
      }
    }

    throw new UnknownComponentError(ident);
  }

  public hasComponent<C extends Component<any>>(entity: Entity, ident: ComponentIdentity<any>): boolean{
    const componentEnum: ComponentEnum = getComponentEnum(ident);
    const map = this.entityStore.get(componentEnum);
    if(map){
      return map.has(entity);
    }

    throw new UnknownComponentError(ident);
  }

  public hasAllComponents<C extends Component<any>>(entity: Entity, ...ident: Array<ComponentIdentity<any>>): boolean{
    const componentEnum: ComponentEnum = getComponentEnum(ident[0]);

    const map = this.entityStore.get(componentEnum);
    if(map){
      for(const item of ident){
        if(!this.hasComponent(entity, item))return false;
      }
      return true;
    }

    throw new UnknownComponentError(ident);
  }

  private getAllHelper<C extends Component<any>>(ident: ComponentIdentity<any>): Array<Entity>{
    const componentEnum: ComponentEnum = getComponentEnum(ident);
    const map = this.entityStore.get(ident);
    return Array.from(map.keys());
  }

  public getAll<C extends Component<any>>(...ident: Array<ComponentIdentity<any>>): Array<Entity>{
    if(!ident.length)return [];

    var result = this.getAllHelper(ident[0]);
    for(let i = 1; i < ident.length; i++){
      result = intersection(result, this.getAllHelper(ident[i]));
    }
    return result;
  }

  public removeEntity(entity: Entity): void{
    for(const map of this.entityStore.values()){
      map.delete(entity);
    }
  }
}
