import React from 'react'
const styles = {
    loginWrapper: {
        height: "60vh",
        width: "30vw",
        backgroundColor: "#1c1c1c",
        fontSize: "1.8rem",
        padding: "1rem"
    },
    forgotPassword: {
        color: "#f9dbbd",
        fontSize: "1rem",
        textAlign: "left",
        marginTop: "0.5rem"
    }
}
const Login = () => {
    return (
        <div style={styles.loginWrapper}>
            <h5>Login</h5>
            <div style={{ marginBottom: "3.5rem" }}>
                <div className='inputWrapper'>
                    <input placeholder='Email' type="email" id="inputEmail4" />
                </div>
                <div className='inputWrapper'>
                    <input placeholder='Password' type="password" id="inputPassword4" />
                </div>
            </div>
            <div>
                <div className='submitButton'>Sign In</div>
                <div style={styles.forgotPassword}>Forgot Password?</div>
            </div>

        </div>
    )
}

export default Login