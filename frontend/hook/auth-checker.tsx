import React, { createContext } from "react";
import { UserType } from "../api/db/types";
import checkToken from "../helpers/checkToken";
import responseHandler from "../helpers/response-handler";
import { CurrentUserContext } from './session';

async function refresh(refreshToken: string | null) {
    let fetchFailed = false;
    const customHeaders = new Headers({
        'Authorization': 'Bearer ' + refreshToken
    });
    const params = { headers: customHeaders };
    await fetch("/api/refresh", params)
    .then(response => responseHandler(response))
    .then((response) => {
        localStorage.setItem("currentUser", response.accessToken);
        fetchFailed = false;
    })
    .catch(_error => {
        console.error("error refresh"); 
        fetchFailed = true
    });
    return fetchFailed;
}

async function handleExpiration(currentUser: UserType) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken !== null) {
      let connexionResult:string = 'token-ko';
      connexionResult = await checkToken(refreshToken, 2, currentUser);
      if (connexionResult !== 'token-ko') {
        return await refresh(refreshToken);
      }
    }
    return 'token-ko';
}

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const AuthChecker = createContext({
    checker: null,
    authCheck: function(authCheck) {},
});

export function AuthCheckerProvider(props: any) {
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const context = {
    authCheck: authCheckHandler
  };

    async function authCheckHandler(accessToken: string) {
        if (accessToken) { 
            const decodedJwt = parseJwt(accessToken);
            if (decodedJwt.exp * 1000 < Date.now()) {
                if (await handleExpiration(currentUser) === 'token-ko') {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('refreshToken');
                    setCurrentUser(undefined);
                }
            }
        }
    }

    return (
        <AuthChecker.Provider value={context}>
            {props.children}
        </AuthChecker.Provider>
    );
}

export default AuthChecker;
