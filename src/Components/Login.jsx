import React from "react";

const Login = (props) => {
    return (
        <div className="login-card-wrapper">
            <div className="login-card">
                {/* Decorative background shapes */}
                <div className="glass-shape shape-1"></div>
                <div className="glass-shape shape-2"></div>
                
                <div className="login-content">
                    <div className="brand-badge">
                        <svg className="ballot-box-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 12h.01M6 12h.01M12 12h.01M12 6h.01M12 18h.01" />
                            <rect x="3" y="3" width="18" height="18" rx="4" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                        <span>Web3 Voting Portal</span>
                    </div>
                    
                    <h1 className="welcome-message">
                        Decentralized <br />
                        <span>Voting Platform</span>
                    </h1>
                    
                    <p className="login-subtitle">
                        Secure, transparent, and immutable voting powered by Ethereum smart contracts. Connect your wallet to cast your vote.
                    </p>
                    
                    <button className="login-button metamask-btn" onClick={props.connectWallet}>
                        <svg className="metamask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.5L12 2L2 11.5L6.5 13L12 9.5L17.5 13L22 11.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 11.5L7 17.5L12 22L17 17.5L22 11.5L17.5 13L12 16L6.5 13L2 11.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 9.5L6.5 13L8 15L12 13.5L16 15L17.5 13L12 9.5Z" fill="#FFFFFF" stroke="#E2761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Connect Metamask
                    </button>
                    
                    <div className="login-footer">
                        <span className="secure-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            End-to-End Encrypted
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;