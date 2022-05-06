import React, { createContext } from "react";

export const ChatSocketContext = createContext({
    chatSocket: null,
    setChatSocket: function(newSocket) {},
});

export function ChatSocketProvider(props: {children}) {
    const [socket, setSocket] = React.useState();

    function setSocketHandler(newSocket) {
        setSocket(newSocket);
    }

    const context = {
        chatSocket: socket,
        setChatSocket: setSocketHandler,
    };

    React.useEffect(() => {
        return () => {}
    }, [socket]);

    return (
        <ChatSocketContext.Provider value={context}>
            {props.children}
        </ChatSocketContext.Provider>
    );
}