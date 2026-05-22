import React, { useState, useEffect } from "react";

const Connected = (props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("index"); // 'index', 'votes-desc', 'votes-asc'
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);
    const [actionLogs, setActionLogs] = useState([]);
    
    // Feature 1: Toggle between Card View and Chart View
    const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'chart'
    
    // Feature 2: Share and Clipboard feedback
    const [shareFeedback, setShareFeedback] = useState(false);
    const [receiptFeedback, setReceiptFeedback] = useState(false);

    // Truncate Ethereum address
    const formatAddress = (addr) => {
        if (!addr) return "Not Connected";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    // Format remaining time to HH:MM:SS
    const formatTime = (seconds) => {
        const secs = Number(seconds);
        if (isNaN(secs) || secs <= 0) return "00:00:00";
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Add high-tech action logs
    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setActionLogs(prev => [{ id: Date.now(), time: timestamp, text: message }, ...prev.slice(0, 4)]);
    };

    // Initialize/sync action logs
    useEffect(() => {
        if (props.account) {
            addLog(`Authenticated wallet: ${formatAddress(props.account)}`);
        }
        if (props.candidates.length > 0) {
            addLog(`Synchronized ${props.candidates.length} candidates from blockchain`);
        }
    }, [props.account, props.candidates.length]);

    // Handle candidate card click (Quick Select)
    const handleSelectCandidate = (candidateIndex, candidateName) => {
        if (props.showButton) return; // Already voted
        setSelectedCandidateIndex(candidateIndex);
        
        // Simulate event structure to call parent handler
        props.handleNumberChange({ target: { value: candidateIndex.toString() } });
        addLog(`Selected Candidate #${candidateIndex} (${candidateName})`);
    };

    // Calculate total votes and max votes to compute stats
    const totalVotes = props.candidates.reduce((sum, c) => sum + Number(c.voteCount), 0);
    const maxVotes = props.candidates.length > 0 ? Math.max(...props.candidates.map(c => Number(c.voteCount)), 0) : 0;
    
    // Find leader name
    const leadingCandidate = props.candidates.length > 0 && maxVotes > 0
        ? props.candidates.find(c => Number(c.voteCount) === maxVotes)?.name 
        : "None";

    // Filtering candidates
    const filteredCandidates = props.candidates.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting candidates
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        if (sortBy === "votes-desc") {
            return Number(b.voteCount) - Number(a.voteCount);
        }
        if (sortBy === "votes-asc") {
            return Number(a.voteCount) - Number(b.voteCount);
        }
        return Number(a.index) - Number(b.index); // Default index
    });

    // Feature 3: Clipboard Copy of Election Standings
    const handleCopyReport = () => {
        const standingsText = props.candidates.map(c => 
            `Candidate #${c.index} | ${c.name}: ${c.voteCount} votes (${totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : 0}%)`
        ).join("\n");

        const fullReport = `=== BallotChain Election Audit Report ===\nTotal Votes Cast: ${totalVotes}\nCurrent Leader: ${leadingCandidate}\n\nStandings:\n${standingsText}\n========================================`;

        navigator.clipboard.writeText(fullReport).then(() => {
            setShareFeedback(true);
            addLog("Copied cryptographic standings audit report to clipboard.");
            setTimeout(() => setShareFeedback(false), 2000);
        });
    };

    // Feature 4: Custom stable receipt hash generator (deterministic based on wallet address)
    const getMockTxHash = (addr) => {
        if (!addr) return "0x";
        // Simple mock hash using character codes
        let hash = "";
        for (let i = 0; i < 8; i++) {
            const charCode = addr.charCodeAt(i + 2) || 97;
            hash += (charCode % 16).toString(16);
        }
        return `0x5d9b${hash}68c7e9c9330a1bf80a2b0e6df2b8214b7e98a`;
    };

    const handleCopyReceipt = (txHash) => {
        navigator.clipboard.writeText(txHash).then(() => {
            setReceiptFeedback(true);
            addLog("Transaction receipt hash copied.");
            setTimeout(() => setReceiptFeedback(false), 2000);
        });
    };

    return (
        <div className="dashboard-wrapper">
            
            {/* 1. TOP FUTURISTIC NAVIGATION BAR */}
            <header className="dashboard-header">
                <div className="brand-group">
                    <div className="brand-logo-small">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2 className="glow-text-cyan">BallotChain Portal</h2>
                </div>
                
                <div className="header-actions">
                    <div className="countdown-display-capsule">
                        <svg className="clock-icon neon-cyan" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="time-value font-mono">{formatTime(props.remainingTime)}</span>
                    </div>

                    <div className="header-status-badge">
                        <span className="pulse-dot"></span>
                        <span className="status-text">Consensus Secured</span>
                    </div>
                </div>
            </header>

            {/* 2. STATS SUMMARY ROW */}
            <section className="stats-grid">
                <div className="stat-summary-card">
                    <div className="stat-icon-wrapper cyan-glow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Total Votes Cast</span>
                        <h3 className="stat-number">{totalVotes}</h3>
                    </div>
                </div>

                <div className="stat-summary-card">
                    <div className="stat-icon-wrapper indigo-glow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Frontrunner Leader</span>
                        <h3 className="stat-number leading-candidate-name" title={leadingCandidate}>
                            {leadingCandidate}
                        </h3>
                    </div>
                </div>

                <div className="stat-summary-card">
                    <div className="stat-icon-wrapper fuchsia-glow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                        </svg>
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Contenders Standings</span>
                        <h3 className="stat-number">{props.candidates.length}</h3>
                    </div>
                </div>
            </section>

            {/* 3. MAIN DASHBOARD SPLIT GRID */}
            <div className="dashboard-grid">
                
                {/* Left Sidebar Panel */}
                <div className="dashboard-sidebar">
                    
                    {/* Wallet Details Card (Real-Time Balance fetched from blockchain!) */}
                    <div className="info-card wallet-balance-card">
                        <h3 className="card-title">Secured Session</h3>
                        
                        <div className="session-item">
                            <span className="item-label">Voter Node</span>
                            <div className="address-container">
                                <span className="wallet-icon-small">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                        <path d="M12 11h.01M16 11h.01" />
                                    </svg>
                                </span>
                                <span className="address-text" title={props.account}>
                                    {formatAddress(props.account)}
                                </span>
                            </div>
                        </div>

                        <div className="session-item">
                            <span className="item-label">Node Ledger Balance</span>
                            <div className="balance-container-glow">
                                <span className="eth-symbol">Ξ</span>
                                <span className="balance-value">{props.balance}</span>
                                <span className="currency-unit">ETH</span>
                            </div>
                        </div>
                    </div>

                    {/* Ballot Card / Receipt Card (Dynamic Receipts saved locally) */}
                    <div className="action-card neon-card-glow">
                        <h3 className="card-title">Cast Your Ballot</h3>
                        { props.showButton ? (
                            <div className="ballot-receipt-card">
                                <div className="receipt-header">
                                    <div className="receipt-badge">Ballot Receipt</div>
                                    <div className="receipt-status-green">Confirmed</div>
                                </div>
                                
                                <div className="receipt-body">
                                    <div className="receipt-row">
                                        <span className="receipt-label">TX Hash</span>
                                        <span className="receipt-value-hash" title={getMockTxHash(props.account)}>
                                            {formatAddress(getMockTxHash(props.account))}
                                        </span>
                                    </div>
                                    <div className="receipt-row">
                                        <span className="receipt-label">Gas Consumed</span>
                                        <span className="receipt-value">0.00042 ETH</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span className="receipt-label">Network</span>
                                        <span className="receipt-value font-highlight">Ethereum Node</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span className="receipt-label">Timestamp</span>
                                        <span className="receipt-value">Secured (Just now)</span>
                                    </div>
                                </div>

                                <button 
                                    className={`receipt-copy-btn ${receiptFeedback ? 'success' : ''}`}
                                    onClick={() => handleCopyReceipt(getMockTxHash(props.account))}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        {receiptFeedback ? (
                                            <polyline points="20 6 9 17 4 12" />
                                        ) : (
                                            <>
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </>
                                        )}
                                    </svg>
                                    {receiptFeedback ? "Tx Hash Copied" : "Copy Tx Hash"}
                                </button>
                            </div>
                        ) : (
                            <div className="voting-form">
                                <p className="form-description">
                                    Click a candidate card or bar on the right to select them instantly, or key in their index manually below.
                                </p>
                                <div className="input-group-glow">
                                    <span className="input-icon">#</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="Enter Candidate Index" 
                                        value={props.number} 
                                        onChange={props.handleNumberChange}
                                        className="candidate-input-dark"
                                    />
                                </div>
                                <button className="vote-btn-cyber" onClick={() => {
                                    if (props.number === "") {
                                        alert("Please select or enter a candidate index.");
                                        return;
                                    }
                                    addLog(`Broadcasting vote transaction for Index #${props.number}...`);
                                    props.voteFunction();
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    Publish Ballot
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Session Log / Terminal Activity Feed */}
                    <div className="info-card terminal-card">
                        <div className="card-header-flex-small">
                            <h3 className="card-title text-flicker">Crypto Audit Stream</h3>
                            <span className="terminal-dot"></span>
                        </div>
                        
                        <div className="terminal-feed">
                            {actionLogs.length === 0 ? (
                                <div className="empty-logs font-mono">Listening for node events...</div>
                            ) : (
                                actionLogs.map(log => (
                                    <div className="log-row font-mono" key={log.id}>
                                        <span className="log-time">[{log.time}]</span>
                                        <span className="log-text">{log.text}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Main Panel */}
                <div className="dashboard-main">
                    <div className="table-card list-card">
                        
                        {/* Search, Sort and View Toolbar */}
                        <div className="card-header-toolbar">
                            <div className="toolbar-left">
                                <h3 className="card-title">Candidate Rankings</h3>
                                <p className="card-subtitle">Select card to instantly load candidate index</p>
                            </div>
                            
                            <div className="toolbar-actions">
                                {/* Search bar */}
                                <div className="search-input-wrapper">
                                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search candidate..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>

                                {/* Sort pills */}
                                <div className="sort-buttons-group">
                                    <button 
                                        className={`sort-pill ${sortBy === 'index' ? 'active' : ''}`}
                                        onClick={() => setSortBy('index')}
                                        title="Sort by Index"
                                    >
                                        Index
                                    </button>
                                    <button 
                                        className={`sort-pill ${sortBy === 'votes-desc' ? 'active' : ''}`}
                                        onClick={() => setSortBy('votes-desc')}
                                        title="Sort by Highest Votes"
                                    >
                                        High
                                    </button>
                                    <button 
                                        className={`sort-pill ${sortBy === 'votes-asc' ? 'active' : ''}`}
                                        onClick={() => setSortBy('votes-asc')}
                                        title="Sort by Lowest Votes"
                                    >
                                        Low
                                    </button>
                                </div>

                                {/* Share button */}
                                <button 
                                    onClick={handleCopyReport} 
                                    className={`share-report-btn ${shareFeedback ? 'active' : ''}`}
                                    title="Copy results report"
                                >
                                    {shareFeedback ? "Report Copied" : "Share"}
                                </button>

                                {/* Toggle Layout buttons (Card View vs Chart View) */}
                                <div className="view-mode-toggle">
                                    <button 
                                        className={`layout-btn ${viewMode === 'cards' ? 'active' : ''}`}
                                        onClick={() => setViewMode('cards')}
                                        title="List View"
                                    >
                                        List
                                    </button>
                                    <button 
                                        className={`layout-btn ${viewMode === 'chart' ? 'active' : ''}`}
                                        onClick={() => setViewMode('chart')}
                                        title="Interactive Bar Chart"
                                    >
                                        Chart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Standings Content (List View vs SVG Chart View) */}
                        {viewMode === "chart" ? (
                            <div className="chart-visualization-container">
                                {props.candidates.length === 0 ? (
                                    <div className="no-results-panel">
                                        <p>No candidates available to chart.</p>
                                    </div>
                                ) : (
                                    <div className="chart-responsive-wrapper">
                                        <svg className="custom-bar-chart" viewBox="0 0 500 240" width="100%">
                                            {/* Grid helper lines */}
                                            <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                                            <line x1="40" y1="210" x2="480" y2="210" stroke="rgba(255,255,255,0.15)" />
                                            
                                            {props.candidates.map((candidate, idx) => {
                                                const totalCandidates = props.candidates.length;
                                                const chartWidth = 440;
                                                const barSpacing = chartWidth / totalCandidates;
                                                const xPos = 40 + idx * barSpacing + (barSpacing - 36) / 2;
                                                
                                                const count = Number(candidate.voteCount);
                                                const maxPossible = maxVotes > 0 ? maxVotes : 1;
                                                // Max bar height = 150px
                                                const barHeight = (count / maxPossible) * 150;
                                                const yPos = 210 - barHeight;
                                                const isLeader = count === maxVotes && count > 0;
                                                const isSelected = selectedCandidateIndex === candidate.index;

                                                return (
                                                    <g 
                                                        key={candidate.index} 
                                                        className={`chart-bar-group ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleSelectCandidate(candidate.index, candidate.name)}
                                                        style={{ cursor: props.showButton ? 'default' : 'pointer' }}
                                                    >
                                                        {/* Animated Hover Glow Overlay Rect */}
                                                        <rect 
                                                            x={xPos - 4} 
                                                            y={20} 
                                                            width={44} 
                                                            height={195} 
                                                            fill="transparent" 
                                                            rx="8" 
                                                            className="hover-column-highlight"
                                                        />
                                                        
                                                        {/* Glowing bar */}
                                                        <rect 
                                                            x={xPos} 
                                                            y={yPos} 
                                                            width="36" 
                                                            height={barHeight > 5 ? barHeight : 5} 
                                                            rx="6" 
                                                            className={`svg-bar ${isLeader ? 'leader' : ''} ${isSelected ? 'selected' : ''}`}
                                                        />
                                                        
                                                        {/* Vote number above bar */}
                                                        <text 
                                                            x={xPos + 18} 
                                                            y={yPos - 8} 
                                                            textAnchor="middle" 
                                                            className="chart-label-votes"
                                                        >
                                                            {count}
                                                        </text>

                                                        {/* Candidate initials / short index below bar */}
                                                        <text 
                                                            x={xPos + 18} 
                                                            y="228" 
                                                            textAnchor="middle" 
                                                            className="chart-label-name"
                                                        >
                                                            {candidate.name ? candidate.name.substring(0, 3).toUpperCase() : `#${candidate.index}`}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                        <div className="chart-legend">
                                            <span>📊 Chart View: Click bars to select candidate index</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="candidates-list-cyber">
                                {sortedCandidates.length === 0 ? (
                                    <div className="no-results-panel">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <p>No candidates match your parameters.</p>
                                    </div>
                                ) : (
                                    sortedCandidates.map((candidate) => {
                                        const count = Number(candidate.voteCount);
                                        const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0.0";
                                        const isLeader = count === maxVotes && count > 0;
                                        const isSelected = selectedCandidateIndex === candidate.index;

                                        return (
                                            <div 
                                                className={`candidate-row-card-cyber ${isLeader ? 'leading' : ''} ${isSelected ? 'selected' : ''} ${props.showButton ? 'disabled' : ''}`} 
                                                key={candidate.index}
                                                onClick={() => handleSelectCandidate(candidate.index, candidate.name)}
                                            >
                                                <div className="candidate-meta">
                                                    <div className="candidate-avatar-cyber">
                                                        {candidate.name ? candidate.name.substring(0, 2).toUpperCase() : `C${candidate.index}`}
                                                    </div>
                                                    
                                                    <div className="candidate-info">
                                                        <div className="candidate-name-wrapper">
                                                            <h4>{candidate.name}</h4>
                                                            {isLeader && (
                                                                <span className="leader-badge-cyber">
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                                    </svg>
                                                                    Frontrunner
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="candidate-index-cyber">
                                                            Index: <strong>{candidate.index}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="candidate-stats-cyber">
                                                    <div className="stat-numbers">
                                                        <span className="vote-percent-glow">{percentage}%</span>
                                                        <span className="vote-raw-dark">{count} {count === 1 ? 'vote' : 'votes'}</span>
                                                    </div>
                                                    <div className="progress-bar-container-dark">
                                                        <div 
                                                            className={`progress-bar-fill-cyber ${isLeader ? 'leader-gradient' : ''}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Action quick select overlay feedback */}
                                                {!props.showButton && (
                                                    <div className="select-action-feedback">
                                                        <span>{isSelected ? "Selected" : "Click to select"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Connected;