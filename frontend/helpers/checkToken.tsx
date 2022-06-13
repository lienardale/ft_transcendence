import { UserType } from "../api/db/types";
import responseHandler from "./response-handler";

async function checkToken(tokenToCheck: string | null, type: number, currentUser?: UserType) {
    let connexionResult:string = 'token-ko';

    if (tokenToCheck !== null) {
      const headers = new Headers({
        'Content-Type': 'application/json'
      });
      const params = {
        method: 'POST',
        body: JSON.stringify({code: tokenToCheck}),
        headers: headers
      };
      let backRoute: string;
      if (type === 1) {
        backRoute = "/api/check-access-token";
      } else if (type === 2 && currentUser !== undefined) {
        backRoute = "/api/check-refresh-token/" + currentUser.id;
      }
      if (backRoute !== undefined) {
        await fetch(backRoute, params)
        .then(response => responseHandler(response))
        .then((response) => connexionResult = response.result)
        .catch(_error => { connexionResult = 'token-ko' });
      } else {
        connexionResult = 'token-ko';
      }
    }
    return connexionResult;
  }

  export default checkToken;
