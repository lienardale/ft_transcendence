import React, { createContext } from "react";
import { UserType } from "../api/db/types";
import { UserContext } from "../api/db/types";


export const CurrentUserContext = createContext<UserContext | undefined>(undefined);

export function ProvideUser(props: { children: any }) {
  const [currentUser, setCurrentUser] = React.useState<UserType | undefined>(undefined)
  const context: UserContext = {
    value: currentUser,
    setCurrentUser(value) {
      setCurrentUser(value)
    },
  };

  return (
    <CurrentUserContext.Provider value={context}>
      {props.children}
    </CurrentUserContext.Provider>
  );
}