import {ComponentEnum} from "../Enum";
import {ComponentState} from "./Components/Component";

type AssemblageData = {
  [key in keyof typeof ComponentEnum]?: ComponentState;
}
export default AssemblageData;
