import { createContext, useState } from "react";

export let TokenContext = createContext()

export default function TokenContextProvider({ children }) {
    const [userToken, setUserToken] = useState(localStorage.getItem('userToken'))
    const [myId, setMyId] = useState(localStorage.getItem('MyId'))

    return <TokenContext.Provider value={{ userToken, setUserToken, myId, setMyId }}>
        {children}
    </TokenContext.Provider>
}