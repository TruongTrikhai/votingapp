import React from "react";

const Finished = (props) => {
    return (
        <div className="login-card-wrapper">
            <div className="login-card finished-card">
                <div className="glass-shape shape-1"></div>
                <div className="glass-shape shape-3"></div>
                
                <div className="login-content">
                    <div className="brand-badge closed-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Voting Session Closed</span>
                    </div>
                    
                    <div className="trophy-illustration">
                        <svg className="trophy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a7 7 0 0 1 7 7v4.66a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z" />
                        </svg>
                    </div>

                    <h1 className="welcome-message finished-title">
                        Poll Concluded
                    </h1>
                    
                    <p className="login-subtitle">
                        The voting time has expired and the smart contract has locked the ballot box. Cryptographic consensus has been achieved and results are now frozen.
                    </p>
                    
                    <div className="finished-status-card">
                        <span>Ballot Status: <strong>Archived on Ethereum</strong></span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Finished;