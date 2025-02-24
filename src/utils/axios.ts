import {AxiosResponse} from "axios";

export function isOk(response: AxiosResponse) {
  return response.status >= 200 && response.status < 300;
}
