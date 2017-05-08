import * as Components from "./Components";
import {Component, ComponentState} from "./Components/Component";
import {
  ComponentIdentity,
  UnknownComponentError,
  createComponent,
  getComponentType,
  getDefaultComponent,
  isComponent,
  isComponentTypeEnum,
  isComponentName,
} from "./Components/ComponentUtils";
import {AssemblageData} from "./AssemblageData/AssemblageData";
import {ComponentType} from "../Enum";
import {Entity} from "./Entity";

function equalSets(a: Set<any>, b: Set<any>): boolean{
  if(a.size !== b.size){
    for(const item of a){
      if(!b.has(item)){
        return false;
      }
    }
  }
  return true;
}

export class EntityManager{
  private entityCounter: number = 0;
  private entityStore: Map<ComponentType, Map<Entity, Component<any>>> = new Map();
  private componentSubscriptionStore: Map<ComponentType, Map<Set<ComponentType>, Array<Set<Entity>>>> = new Map();

  constructor(){}

  public createEntity(): Entity{
    return this.entityCounter++;
  }

  public createEntityFromAssemblage(assemblage: AssemblageData): Entity{
    const entity = this.createEntity();
    for(const type of Reflect.ownKeys(assemblage)){
      this.addComponent(entity, type, assemblage[type]);
    }
    return entity;
  }

  public addComponent<S extends ComponentState, C extends Component<S>>(entity: Entity, ident: ComponentIdentity<any>, state?: S): Entity{
    const component = createComponent(getDefaultComponent(ident), (state || {}));
    var map = this.entityStore.get(component.enum);
    if(!map){
      map = new Map();
      this.entityStore.set(component.enum, map);
    }
    if(map.has(entity)){
      //merge old with new
      Object.assign(this.getComponent(entity, ident).state, component.state);
      return entity;
    }

    map.set(entity, component);

    if(this.componentSubscriptionStore.has(component.enum)){
      const subscriptionTypeCombos = this.componentSubscriptionStore.get(component.enum);
      for(const typeCombo of subscriptionTypeCombos.keys()){
        if(this.hasAllComponents(entity, ...typeCombo)){
          const subscriptions = subscriptionTypeCombos.get(typeCombo);
          subscriptions.forEach(sub => sub.add(entity));
        }
      }
    }

    return entity;
  }

  public removeComponent(entity: Entity, ident: ComponentIdentity<any>): Entity{
    const componentType: ComponentType = getComponentType(ident);
    const map = this.entityStore.get(componentType);
    map.delete(entity);
    if(!map.size){
      this.entityStore.delete(componentType);
    }

    const subscriptionTypeCombos = this.componentSubscriptionStore.get(componentType);
    for(const typeCombo of subscriptionTypeCombos.keys()){
      if(this.hasAllComponents(entity, ...typeCombo)){
        const subscriptions = subscriptionTypeCombos.get(typeCombo);
        subscriptions.forEach(sub => sub.delete(entity));
      }
    }

    return entity;
  }

  public getComponent<C extends Component<any>>(entity: Entity, ident: ComponentIdentity<any>): C{
    const componentType: ComponentType = getComponentType(ident);
    const map = this.entityStore.get(componentType);
    if(map){
      return (<C>map.get(entity));
    }

    throw new UnknownComponentError(ident);
  }

  public hasComponent(entity: Entity, ident: ComponentIdentity<any>): boolean{
    const componentType: ComponentType = getComponentType(ident);
    const map = this.entityStore.get(componentType);
    if(map){
      return map.has(entity);
    }

    return false;
  }

  public hasAllComponents(entity: Entity, ...ident: Array<ComponentIdentity<any>>): boolean{
    const componentType: ComponentType = getComponentType(ident[0]);

    const map = this.entityStore.get(componentType);
    if(map){
      for(const item of ident){
        if(!this.hasComponent(entity, item))return false;
      }
      return true;
    }

    return false;
  }

  private getAllHelper(ident: ComponentIdentity<any>): Array<Entity>{
    const componentType: ComponentType = getComponentType(ident);
    const map = this.entityStore.get(componentType);
    return map ? Array.from(map.keys()) : [];
  }

  public getAllEntities(...ident: Array<ComponentIdentity<any>>): Array<Entity>{
    if(!ident.length)return [];

    var result = this.getAllHelper(ident[0]);
    for(let i = 1; i < ident.length; i++){
      const oResult = this.getAllHelper(ident[i]);
      result = result.filter(entity => oResult.indexOf(entity) > -1);
    }
    return result;
  }

  public removeEntity(entity: Entity): void{
    for(const map of this.entityStore.values()){
      map.delete(entity);
    }
  }

  public getAllComponents(entity: Entity): Array<Component<any>>{
    const components: Array<Component<any>> = [];
    for(const map of this.entityStore.values()){
      if(map.has(entity)){
        components.push(map.get(entity));
      }
    }
    return components;
  }

  public subscribeToComponents(subscriber: Set<Entity>, componentTypes: Array<ComponentType>): void{
    const typeCombo = new Set(componentTypes.sort());
    for(const componentType of typeCombo){
      let comboSubscriptionMap = this.componentSubscriptionStore.get(componentType);
      if(!comboSubscriptionMap){
        comboSubscriptionMap = new Map();
        this.componentSubscriptionStore.set(componentType, comboSubscriptionMap);
      }

      let subscriptions: Array<Set<Entity>>;
      for(const oTypeCombo of comboSubscriptionMap.keys()){
        if(equalSets(oTypeCombo, typeCombo)){
          subscriptions = comboSubscriptionMap.get(oTypeCombo);
          break;
        }
      }

      if(!subscriptions){
        subscriptions = [];
        comboSubscriptionMap.set(typeCombo, subscriptions);
      }

      subscriptions.push(subscriber);
    }

    this.getAllEntities(...componentTypes).forEach(e => subscriber.add(e));
  }
}
