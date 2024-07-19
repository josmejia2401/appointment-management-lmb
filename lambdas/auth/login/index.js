import { doAction } from "./services/login.service";
export const handler = async (event, context) => doAction(event, context);