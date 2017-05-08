export {ConstantPosition} from "./ConstantPosition";
export {Floor} from "./Floor";
export {Health} from "./Health";
export {KeyboardControlled} from "./KeyboardControlled";
export {Movement} from "./Movement";
export {Renderable} from "./Renderable";
export {Storage} from "./Storage";
export {Tile} from "./Tile";
export {TileReference} from "./TileReference";
export {Vision} from "./Vision";
export {Wall} from "./Wall"
export {Flicker} from "./Flicker";
export {Energy} from "./Energy";
export {SimpleWalker} from "./SimpleWalker";
export {AIControlled} from "./AIControlled";
export {Solid} from "./Solid";

import {ComponentState} from "./Component";

export interface Controller extends ComponentState{
  needsInput: boolean;
}
