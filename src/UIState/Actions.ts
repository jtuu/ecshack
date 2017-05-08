import * as redux from "redux";
import {UIStateActionType, SpriteId} from "../Enum";
import {Entity} from "../ecs/Entity";
import {store} from "./Store";
import {TileMap} from "../TileMap";

export interface UIStateAction extends redux.Action{
  type: UIStateActionType;
  payload?: {[key: string]: any};
}

export type SetStateAction = {
  type: UIStateActionType.SET_STATE;
  payload: {
    newState: TileMap
  }
}

export const setState: redux.ActionCreator<SetStateAction> = (newState: TileMap): SetStateAction => {
  return {
    type: UIStateActionType.SET_STATE,
    payload: {newState}
  }
}

export type MoveEntityAction = {
  type: UIStateActionType.MOVE_ENTITY;
  payload: {
    entity: Entity;
    newPos: Coordinate;
  }
}

export const moveEntity: redux.ActionCreator<MoveEntityAction> = (entity: Entity, newPos: Coordinate): MoveEntityAction => {
  return {
    type: UIStateActionType.MOVE_ENTITY,
    payload: {
      entity,
      newPos
    }
  }
}

export type EndStepAction = {
  type: UIStateActionType.STEP_END,
  payload: {}
}

export const endStep: redux.ActionCreator<EndStepAction> = (): EndStepAction => {
  return {
    type: UIStateActionType.STEP_END,
    payload: {}
  }
}


export type ForceUpdateEntityAction = {
  type: UIStateActionType.FORCE_UPDATE_ENTITY,
  payload: {
    entity: Entity
  }
}

export const updateEntity: redux.ActionCreator<ForceUpdateEntityAction> = (entity: Entity): ForceUpdateEntityAction => {
  return {
    type: UIStateActionType.FORCE_UPDATE_ENTITY,
    payload: {
      entity
    }
  }
}
