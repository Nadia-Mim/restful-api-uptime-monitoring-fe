import React, { useEffect, useRef, useState } from 'react';
import '../../css/Terminal.css';
import { execCommand } from '../../api/deployments/POST';

const Terminal = () => {
    const [history, setHistory] = useState([]); // {cmd, stdout, stderr, code}
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('');
    const [running, setRunning] = useState(false);
    const [idx, setIdx] = useState(-1);
    const termRef = useRef(null);
    const inputRef = useRef(null);

    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};

    useEffect(() => {
        // Initialize cwd from server-side process if unset by asking for pwd once
        if (!cwd) {
            (async () => {
                const [ok, res] = await execCommand({ command: 'pwd' });
                if (ok) setCwd(res?.stdout?.trim() || '');
            })();
        }
    }, []);

    useEffect(() => {
        if (termRef.current) {
            termRef.current.scrollTop = termRef.current.scrollHeight;
        }
    }, [history, running]);

    const run = async (cmd) => {
        if (!cmd) return;
        setRunning(true);
        setHistory((h) => [...h, { cmd }]);
        const [ok, res] = await execCommand({ command: cmd, cwd });
        let item = { cmd, stdout: '', stderr: '', code: 0 };
        if (ok) {
            item.stdout = res?.stdout || '';
            item.stderr = res?.stderr || '';
            item.code = res?.code || 0;
            if (cmd.startsWith('cd ')) {
                // Try to keep cwd in sync by asking for pwd
                const [ok2, res2] = await execCommand({ command: `cd ${cmd.slice(3)} && pwd`, cwd });
                if (ok2) setCwd(res2?.stdout?.trim());
            } else if (cmd === 'pwd') {
                setCwd((res?.stdout || '').trim());
            }
        } else {
            item.stderr = res; // error message
            item.code = -1;
        }
        setHistory((h) => {
            const copy = [...h];
            copy[copy.length - 1] = { ...copy[copy.length - 1], ...item };
            return copy;
        });
        setRunning(false);
        setIdx(-1);
        // ensure input stays focused after command completes
        if (inputRef.current) inputRef.current.focus();
    };

    const onKeyDown = async (e) => {
        if (e.key === 'Enter' && running) {
            // ignore enter while a command is running but keep focus
            e.preventDefault();
            if (inputRef.current) inputRef.current.focus();
            return;
        }
        if (e.key === 'Enter' && !running) {
            e.preventDefault();
            const cmd = input.trim();
            setInput('');
            await run(cmd);
            if (inputRef.current) inputRef.current.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIdx = idx < 0 ? history.length - 1 : Math.max(0, idx - 1);
            setIdx(prevIdx);
            if (history[prevIdx]) setInput(history[prevIdx].cmd || '');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = Math.min(history.length - 1, idx + 1);
            setIdx(nextIdx);
            if (history[nextIdx]) setInput(history[nextIdx].cmd || '');
            if (nextIdx >= history.length - 1) setIdx(-1);
        }
    };

    const clear = () => setHistory([]);

    return (
        <div className="terminal-shell">
            <div className="terminal-header">
                <span className="term-dot red" />
                <span className="term-dot yellow" />
                <span className="term-dot green" />
                <div style={{ marginLeft: 8, color: '#bcd0ef', fontWeight: 600 }}>Deployments Terminal</div>
                <div style={{ marginLeft: 'auto' }} className="cwd-display">{cwd}</div>
            </div>
            <div className="terminal-body" ref={termRef}>
                {history.map((h, i) => (
                    <div key={i} className="terminal-line">
                        <span className="terminal-prompt">{authData?.userId || 'user'}@host</span>
                        <span style={{ color: '#7b8798' }}>:</span>
                        <span className="terminal-cwd">{cwd}</span>
                        <span style={{ color: '#7b8798' }}>$</span> {h.cmd}
                        {h.stdout ? <div className="terminal-output">{h.stdout}</div> : null}
                        {h.stderr ? <div className="terminal-error">{h.stderr}</div> : null}
                        {typeof h.code === 'number' && h.code !== 0 ? (
                            <div className="terminal-error">exit code: {h.code}</div>
                        ) : null}
                    </div>
                ))}
                {running && <div className="terminal-output">Running...</div>}
            </div>
            <div className="terminal-input-wrap">
                <span className="terminal-prompt">$</span>
                <input
                    placeholder="Type a command (e.g., pwd, ls, mkdir test) and press Enter"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    ref={inputRef}
                    autoFocus
                />
                <div className="terminal-actions">
                    <button className="btn-secondary" onClick={clear} disabled={running}>Clear</button>
                    <button className="btn-primary" onClick={() => run(input)} disabled={running || !input.trim()}>Run</button>
                </div>
            </div>
        </div>
    );
};

export default Terminal;
