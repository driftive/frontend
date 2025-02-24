import React, {createContext} from "react";
import {AuthAction, AuthState} from "./types.ts";

export const AuthStateContext = createContext<AuthState | undefined>(undefined);
export const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | undefined>(undefined);
