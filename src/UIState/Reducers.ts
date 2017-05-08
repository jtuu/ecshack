import * as redux from "redux";
import * as actions from "./Actions";
import {UIStateActionType, SpriteId, ComponentType} from "../Enum";
import {entityManager} from "../EngineWorker";
import {Entity} from "../ecs/Entity";
import {TileMap} from "../TileMap";
import {getSpriteId, getPosition, getLayer, getAlpha} from "../ecs/EntityUtils";
import {VisionComponent} from "../ecs/Components/Vision";
import {Fov} from "../Fov";
import {GeometryUtils} from "../Utils";
const {encodeCoordinate} = GeometryUtils;

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
    unsee?: boolean;
    alpha?: number;
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
const gridCoordinates: Set<number> = new Set();
const grid: SimpleGrid = new Proxy({}, {
  get: (o, p: number) => {
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

function buildNewState(tileMap: TileMap): UIMapPart{
  const newState = {
    activeEntities: [],
    entityData: {}
  } as UIMapPart;
  clearGrid();

  for(const [tile, x, y] of tileMap.grid){
    const contents = tileMap.getContents(x, y);
    contents.forEach(entity => {
      const spriteId = getSpriteId(entity);
      if(spriteId !== SpriteId.VOID){
        newState.activeEntities.push(entity);
        grid[encodeCoordinate({x,y})].add(entity);
        newState.entityData[entity] = {
          x, y,
          spriteId: spriteId,
          layer: getLayer(entity),
          alpha: getAlpha(entity)
        };
      }
    });
    const spriteId = getSpriteId(tile);
    if(spriteId !== SpriteId.VOID){
      grid[encodeCoordinate({x,y})].add(tile);
      newState.activeEntities.push(tile);
      newState.entityData[tile] = {
        x, y,
        spriteId: spriteId,
        layer: getLayer(tile),
        alpha: getAlpha(tile)
      };
    }
  }

  return newState;
}

const visionEntities = new Set<Entity>();
var isVisionSubscribed = false;

const mapChangeReducer = createReducer(initialStates.map.mapChanges, {
  [UIStateActionType.SET_STATE]: function(previousState: UIMapPart, action: actions.SetStateAction, fullMap: UIMapPart): UIMapPart{
    if(!isVisionSubscribed){
      entityManager.subscribeToComponents(visionEntities, [ComponentType.Vision]);
      isVisionSubscribed = true;
    }

    const visionComponents = Array.from(visionEntities).map(entity => <VisionComponent>entityManager.getComponent(entity, ComponentType.Vision)).filter(vision => vision.state.shouldRender);
    const isSeen = (x: number, y: number) => visionComponents.some(vision => vision.state.fov.center && vision.state.fov.canSee(vision.state.fov.globalToLocal({x, y})));
    const newState = buildNewState(action.payload.newState);

    newState.activeEntities = newState.activeEntities.filter(id => {
      const entity = newState.entityData[id];
      if(isSeen(entity.x, entity.y)){
        return true;
      }
      delete newState.entityData[id];
      return false;
    });

    return newState;
  },
  [UIStateActionType.MOVE_ENTITY]: function(previousState: UIMapPart, action: actions.MoveEntityAction, fullMap: UIMapPart): UIMapPart{
    const c = fullMap.entityData[16984];
    const entityId = action.payload.entity;
    const entity = fullMap.entityData[entityId];
    const oldTile = grid[encodeCoordinate(entity)];
    const newEntityData = Object.assign({}, previousState.entityData);
    const newActiveEntities = new Set(previousState.activeEntities);
    const visionComponents = Array.from(visionEntities).map(entity => <VisionComponent>entityManager.getComponent(entity, ComponentType.Vision)).filter(vision => vision.state.shouldRender);
    const isSeen = (x: number, y: number) => visionComponents.some(vision => vision.state.fov.center && vision.state.fov.canSee(vision.state.fov.globalToLocal({x, y})));
    const vision = <VisionComponent>entityManager.getComponent(entityId, ComponentType.Vision);

    if(vision.state.shouldRender){
      const fovDiff = Fov.diff(new Fov(vision.state.radius, {x: entity.x, y: entity.y}), new Fov(vision.state.radius, action.payload.newPos));
      fovDiff.b.forEach(tile => {
        grid[encodeCoordinate(getPosition(tile))].forEach(e => {
          newEntityData[e] = Object.assign({}, fullMap.entityData[e], {unsee: false});
          newActiveEntities.add(e);
        });
        newEntityData[tile] = Object.assign({}, fullMap.entityData[tile], {unsee: false});
        newActiveEntities.add(tile);
      });
      fovDiff.a.forEach(tile => {
        const pos = getPosition(tile);
        if(pos.x === action.payload.newPos.x && pos.y === action.payload.newPos.y) return;

        grid[encodeCoordinate(pos)].forEach(e => {
          newEntityData[e] = Object.assign({}, fullMap.entityData[e], {unsee: true});
          newActiveEntities.add(e);
        });
        newEntityData[tile] = Object.assign({}, fullMap.entityData[tile], {unsee: true});
        newActiveEntities.add(tile);
      });
    }

    oldTile.forEach(e => {
      if(e === entityId) return;
      if(isSeen(entity.x, entity.y)){
        newEntityData[e] = Object.assign({}, fullMap.entityData[e], {unsee: false});
        newActiveEntities.add(e);
      }
    });
    const spriteId = getSpriteId(entityId);
    if(spriteId !== SpriteId.VOID && isSeen(action.payload.newPos.x, action.payload.newPos.y)){
      newActiveEntities.add(entityId);
      newEntityData[entityId] = updateObject(fullMap.entityData[entityId], {
        x: action.payload.newPos.x,
        y: action.payload.newPos.y,
        spriteId: spriteId,
        layer: getLayer(entityId),
        alpha: 1,
        unsee: false
      });
    }

    return {
      activeEntities: Array.from(newActiveEntities),
      entityData: newEntityData
    }
  },
  [UIStateActionType.FORCE_UPDATE_ENTITY]: function(previousState: UIMapPart, action: actions.ForceUpdateEntityAction, fullMap: UIMapPart): UIMapPart{
    const newEntityData = Object.assign({}, previousState.entityData);
    const newActiveEntities = previousState.activeEntities.concat();
    const visionComponents = Array.from(visionEntities).map(entity => <VisionComponent>entityManager.getComponent(entity, ComponentType.Vision)).filter(vision => vision.state.shouldRender);
    const isSeen = (x: number, y: number) => visionComponents.some(vision => vision.state.fov.center && vision.state.fov.canSee(vision.state.fov.globalToLocal({x, y})));
    const position = getPosition(action.payload.entity);

    const spriteId = getSpriteId(action.payload.entity);
    if(spriteId !== SpriteId.VOID && isSeen(position.x, position.y)){
      newActiveEntities.push(action.payload.entity);
      newEntityData[action.payload.entity] = updateObject(fullMap.entityData[action.payload.entity], {
        spriteId: spriteId,
        x: position.x,
        y: position.y,
        layer: getLayer(action.payload.entity),
        alpha: getAlpha(action.payload.entity)
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
    [entityId].concat(changeState.activeEntities).forEach(e => {
      if(e in changeState.entityData){
        const entity = changeState.entityData[e];
        newEntityData[e] = Object.assign({}, entity, {unsee: false});
        if(e === entityId){
          const oldTile = grid[encodeCoordinate(previousState.entityData[e])];
          oldTile.delete(entityId);
          grid[encodeCoordinate(entity)].add(entityId);
        }
      }
    });
    newEntityData[entityId].x = action.payload.newPos.x;
    newEntityData[entityId].y = action.payload.newPos.y;
    return {
      activeEntities: previousState.activeEntities,
      entityData: newEntityData
    }
  },
  [UIStateActionType.FORCE_UPDATE_ENTITY]: function(previousState: UIMapPart, action: actions.ForceUpdateEntityAction, changeState: UIMapPart): UIMapPart{
    const newEntityData = Object.assign({}, previousState.entityData);
    const entity = Object.assign({}, changeState.entityData[action.payload.entity]);
    newEntityData[action.payload.entity] = entity;
    grid[encodeCoordinate(entity)].add(action.payload.entity);
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
