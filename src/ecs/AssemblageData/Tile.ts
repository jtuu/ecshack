import AssemblageData from "./AssemblageData";
import {ComponentType} from "../../Enum";
import {ConstantPosition} from "../Components/ConstantPosition";

const TileAssemblageData: AssemblageData = {
  [ComponentType.Tile]: {
    isSeen: true,
    isBlocking: false,
    isEntry: false
  },
  [ComponentType.ConstantPosition]: {},
  [ComponentType.Storage]: {
    maxSize: 4096
  }
};
export default TileAssemblageData;
