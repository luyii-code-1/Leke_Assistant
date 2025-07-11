// ==UserScript==
// @name         Leke自动点名
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  自动识别并点击Leke互动课堂点名答案，记录完成次数并发出提示音
// @author       Luyii & ChatGPT(被驯服)
// @match        https://webapp.leke.cn/interact-classroom/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let completedCount = 0;

    // 提示区域
    const tip = document.createElement('div');
    tip.innerText = `已开启自动点名：完成 ${completedCount} 次`;
    tip.style.position = 'fixed';
    tip.style.bottom = '10px';
    tip.style.left = '10px';
    tip.style.zIndex = '9999';
    tip.style.background = '#dff0d8';
    tip.style.color = '#3c763d';
    tip.style.padding = '5px 10px';
    tip.style.borderRadius = '5px';
    tip.style.fontSize = '14px';
    tip.style.fontFamily = 'sans-serif';
    document.body.appendChild(tip);

    // 测试按钮
    const testBtn = document.createElement('button');
    testBtn.innerText = '测试提示音';
    testBtn.style.marginLeft = '10px';
    testBtn.style.padding = '2px 6px';
    testBtn.style.border = 'none';
    testBtn.style.cursor = 'pointer';
    testBtn.style.borderRadius = '4px';
    testBtn.style.background = '#3c763d';
    testBtn.style.color = 'white';
    testBtn.onclick = () => playSound();
    tip.appendChild(testBtn);

    function updateTip() {
        tip.firstChild.textContent = `已开启自动点名：完成 ${completedCount} 次`;
    }

    // 播放提示音（使用简单的 beep）
    function playSound() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }

    function observeDom(callback) {
        const observer = new MutationObserver(callback);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function solveAndClick() {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return;

        const questionEl = Array.from(modal.querySelectorAll('div')).find(el => el.textContent.includes('='));
        if (!questionEl) return;

        const match = questionEl.textContent.match(/(\d+)\s*([+\-*/])\s*(\d+)\s*=\?/);
        if (!match) return;

        const a = parseInt(match[1]);
        const op = match[2];
        const b = parseInt(match[3]);
        let result;

        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = Math.floor(a / b); break;
            default: return;
        }

        const answerBtns = modal.querySelectorAll('button');
        for (const btn of answerBtns) {
            if (btn.textContent.trim() === result.toString()) {
                btn.click();
                completedCount++;
                updateTip();
                playSound();
                break;
            }
        }
    }

    observeDom(() => {
        setTimeout(solveAndClick, 100);
    });
})();
