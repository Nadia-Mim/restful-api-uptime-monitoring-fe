import React from 'react'

const AuthContext = React.createContext();

const AuthDetailsProvider = AuthContext.Provider;
const AuthDetailsConsumer = AuthContext.Consumer;

export { AuthDetailsProvider, AuthDetailsConsumer };
export default AuthContext;