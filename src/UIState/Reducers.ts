import * as redux from "redux";
import * as actions from "./Actions";
import {UIStateActionType, SpriteId, ComponentType} from "../Enum";
import {entityManager} from "../EngineWorker";
import Entity from "../ecs/Entity";
import TileMap from "../TileMap";

type Reducer<S> = <A extends redux.Action>(state: S, action: A, ...otherStates: Array<S>) => S;

interface ReducersMapObject extends redux.ReducersMapObject{
  [key: string]: Reducer<any>;
}

function updateObject<T extends {}>(oldObject: T, newValues: Partial<T>): T{
  return Object.assign({}, oldObject, newValues);
}

function createReducer(initialState: any, handlers: ReducersMapObject): Reducer<any>{
  return function reducer(state = initialState, action: redux.Action, ...otherStates: Array<any>){
    if(handlers.hasOwnProperty(action.type)){
      return handlers[action.type](state, action, ...otherStates);
    }
    return state;
  }
}

export interface EntityRenderData{
  [key: number]: {
    x: number;
    y: number;
    spriteId: SpriteId;
    layer: number;
  }
}

export interface UIMapPart{
  activeEntities: Array<number>;
  entityData: EntityRenderData;
}

export interface MapReducerState{
  fullMap: UIMapPart;
  mapChanges: UIMapPart;
}

interface SimpleGrid{
  [key: string]: Set<number>;
}
const gridCoordinates: Set<string> = new Set();
const grid: SimpleGrid = new Proxy({}, {
  get: (o, p: string) => {
    if(!o.hasOwnProperty(p)){
      o[p] = new Set();
      gridCoordinates.add(p);
    }
    return o[p];
  }
});
function clearGrid(){
  gridCoordinates.forEach(coord => delete grid[coord]);
  gridCoordinates.clear();
}

const initialStates = {
  mapPart: {
    activeEntities: [],
    entityData: {}
  } as UIMapPart,
  map: {
    get mapChanges(): UIMapPart{
      return initialStates.mapPart;
    },
    get fullMap(): UIMapPart{
      return initialStates.mapPart;
    }
  } as MapReducerState
};

function encodeCoordinates<T extends Coordinate>(entityData: T): string{
  return `${entityData.x},${entityData.y}`;
}

function getSpriteId(entity: Entity): SpriteId{
  return entityManager.hasComponent(entity, ComponentType.Renderable) ?
    entityManager.getComponent(entity, ComponentType.Renderable).state.spriteId :
    SpriteId.VOID;
}

function getCoordinates(entity: Entity): Coordinate{
  if(entityManager.hasComponent(entity, ComponentType.TileReference)){
    return entityManager.getComponent(entityManager.getComponent(entity, ComponentType.TileReference).state.tile, ComponentType.ConstantPosition).state;
  }
  if(entityManager.hasComponent(entity, ComponentType.ConstantPosition)){
    return entityManager.getComponent(entity, ComponentType.ConstantPosition).state;
  }
  return {x: 0, y: 0};
}

function getLayer(entity: Entity): number{
  return entityManager.hasComponent(entity, ComponentType.Renderable) ?
    entityManager.getComponent(entity, ComponentType.Renderable).state.layer :
    0;
}

function buildNewState(tileMap: TileMap): UIMapPart{
  const newState = {
    activeEntities: [],
    entityData: {}
  } as UIMapPart;
  clearGrid();

  for(const [tile, idx, x, y] of tileMap.grid){
    const contents = tileMap.getContents(x, y);
    contents.forEach(entity => {
      const spriteId = getSpriteId(entity);
      if(spriteId !== SpriteId.VOID){
        newState.activeEntities.push(entity);
        grid[encodeCoordinates({x,y})].add(entity);
        newState.entityData[entity] = {
          x, y,
          spriteId: spriteId,
          layer: getLayer(entity)
        };
      }
    });
    const spriteId = getSpriteId(tile);
    if(spriteId !== SpriteId.VOID){
      grid[encodeCoordinates({x,y})].add(tile);
      newState.activeEntities.push(tile);
      newState.entityData[tile] = {
        x, y,
        spriteId: spriteId,
        layer: getLayer(tile)
      };
    }
  }

  return newState;
}

const mapChangeReducer = createReducer(initialStates.map.mapChanges, {
  [UIStateActionType.SET_STATE]: function(previousState: UIMapPart, action: actions.SetStateAction, fullMap: UIMapPart): UIMapPart{
    return buildNewState(action.payload.newState);
  },
  [UIStateActionType.MOVE_ENTITY]: function(previousState: UIMapPart, action: actions.MoveEntityAction, fullMap: UIMapPart): UIMapPart{
    //TODO: add fov checks
    const entityId = action.payload.entity;
    const entity = fullMap.entityData[entityId];
    const oldTile = grid[encodeCoordinates(entity)];
    const newEntityData = Object.assign({}, previousState.entityData);
    const newActiveEntities = previousState.activeEntities.concat();

    oldTile.forEach(e => {
      if(e === entityId) return;
      newEntityData[e] = Object.assign({}, fullMap.entityData[e]);
      newActiveEntities.push(e);
    });
    const spriteId = getSpriteId(action.payload.entity);
    if(spriteId !== SpriteId.VOID){
      newActiveEntities.push(entityId);
      newEntityData[entityId] = updateObject(fullMap.entityData[entityId], {
        x: action.payload.newPos.x,
        y: action.payload.newPos.y,
        spriteId: spriteId,
        layer: getLayer(action.payload.entity)
      });
    }

    return {
      activeEntities: newActiveEntities,
      entityData: newEntityData
    }
  },
  [UIStateActionType.FORCE_UPDATE_ENTITY]: function(previousState: UIMapPart, action: actions.ForceUpdateEntityAction, fullMap: UIMapPart): UIMapPart{
    const newEntityData = Object.assign({}, previousState.entityData);
    const newActiveEntities = previousState.activeEntities.concat();
    const spriteId = getSpriteId(action.payload.entity);
    if(spriteId !== SpriteId.VOID){
      newActiveEntities.push(action.payload.entity);
      const position = getCoordinates(action.payload.entity);
      newEntityData[action.payload.entity] = updateObject(fullMap.entityData[action.payload.entity], {
        spriteId: spriteId,
        x: position.x,
        y: position.y,
        layer: getLayer(action.payload.entity)
      });
    }
    return {
      activeEntities: newActiveEntities,
      entityData: newEntityData
    };
  }
});

const fullMapReducer = createReducer(initialStates.map.fullMap, {
  [UIStateActionType.SET_STATE]: function(previousState: UIMapPart, action: actions.SetStateAction, changeState: UIMapPart): UIMapPart{
    return buildNewState(action.payload.newState);
  },
  [UIStateActionType.MOVE_ENTITY]: function(previousState: UIMapPart, action: actions.MoveEntityAction, changeState: UIMapPart): UIMapPart{
    const entityId = action.payload.entity;
    const newEntityData = Object.assign({}, previousState.entityData);
    changeState.activeEntities.forEach(e => {
      if(e in changeState.entityData){
        const entity = changeState.entityData[e];
        newEntityData[e] = Object.assign({}, entity);
        if(e === entityId){
          const oldTile = grid[encodeCoordinates(previousState.entityData[e])];
          oldTile.delete(entityId);
          grid[encodeCoordinates(entity)].add(entityId);
        }
      }
    });
    return {
      activeEntities: previousState.activeEntities,
      entityData: newEntityData
    }
  },
  [UIStateActionType.FORCE_UPDATE_ENTITY]: function(previousState: UIMapPart, action: actions.ForceUpdateEntityAction, changeState: UIMapPart): UIMapPart{
    const newEntityData = Object.assign({}, previousState.entityData);
    const entity = Object.assign({}, changeState.entityData[action.payload.entity]);
    newEntityData[action.payload.entity] = entity;
    grid[encodeCoordinates(entity)].add(action.payload.entity);
    return {
      activeEntities: previousState.activeEntities,
      entityData: newEntityData
    }
  }
});

const mapReducer = createReducer(initialStates.map, {
  [UIStateActionType.SET_STATE]: function(previousState: MapReducerState, action: actions.SetStateAction): MapReducerState{
    const mapChangeState = mapChangeReducer(previousState.mapChanges, action);
    const fullMapState = fullMapReducer(previousState.fullMap, action, mapChangeState);
    return {
      mapChanges: mapChangeState,
      fullMap: fullMapState
    };
  },
  [UIStateActionType.MOVE_ENTITY]: function(previousState: MapReducerState, action: actions.MoveEntityAction): MapReducerState{
    const mapChangeState = mapChangeReducer(previousState.mapChanges, action, previousState.fullMap);
    return {
      mapChanges: mapChangeState,
      fullMap: fullMapReducer(previousState.fullMap, action, mapChangeState)
    };
  },
  [UIStateActionType.STEP_END]: function(previousState: MapReducerState, action: actions.EndStepAction): MapReducerState{
    return {
      mapChanges: initialStates.map.mapChanges,
      fullMap: previousState.fullMap
    };
  },
  [UIStateActionType.FORCE_UPDATE_ENTITY]: function(previousState: MapReducerState, action: actions.ForceUpdateEntityAction): MapReducerState{
    const mapChangeState = mapChangeReducer(previousState.mapChanges, action, previousState.fullMap);
    return {
      mapChanges: mapChangeState,
      fullMap: fullMapReducer(previousState.fullMap, action, mapChangeState)
    };
  }
});

export interface UIState{
  map: MapReducerState;
}

export const UIStateReducer = redux.combineReducers<UIState>({
  map: mapReducer
});
