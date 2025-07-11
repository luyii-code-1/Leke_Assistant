// ==UserScript==
// @name         乐课网自动脉冲举手助手（可折叠版）
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  在乐课网互动课堂中自动按指定时间间隔点击举手按钮，支持脉冲模式，可折叠控制面板
// @author       Luyii & DeepSeek-V3(被驯服)
// @match        https://webapp.leke.cn/interact-classroom/*
// @grant        GM_addStyle
// @icon         https://webapp.leke.cn/favicon.ico
// ==/UserScript==

(function() {
    'use strict';
    
    // 添加自定义样式
    GM_addStyle(`
        #auto-hand-raise-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
            background: linear-gradient(135deg, #1a2a6c, #2a4d69);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            color: white;
            z-index: 9999;
            font-family: 'Microsoft YaHei', sans-serif;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            overflow: hidden;
            transition: all 0.3s ease;
            max-height: 500px;
        }
        
        .panel-minimized {
            height: 50px !important;
            width: 50px !important;
            border-radius: 50% !important;
            overflow: hidden;
        }
        
        .panel-minimized .panel-content {
            display: none;
        }
        
        .panel-minimized .panel-header {
            padding: 0;
            border: none;
            height: 100%;
        }
        
        .panel-minimized .panel-title {
            display: none;
        }
        
        .panel-minimized .minimize-btn {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .panel-minimized .close-btn {
            display: none;
        }
        
        .panel-header {
            display: flex;
            align-items: center;
            padding: 15px;
            cursor: pointer;
            position: relative;
        }
        
        .pulse-indicator {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 230, 118, 0.1);
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .pulse-mode .pulse-indicator {
            opacity: 1;
            animation: pulse 1.5s infinite;
        }
        
        .panel-title {
            flex-grow: 1;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        
        .panel-title i {
            margin-right: 10px;
            font-size: 24px;
        }
        
        .panel-controls {
            display: flex;
            gap: 8px;
        }
        
        .minimize-btn, .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .minimize-btn:hover, .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .minimize-btn:hover {
            transform: rotate(180deg);
        }
        
        .close-btn:hover {
            transform: rotate(90deg);
        }
        
        .panel-content {
            padding: 0 20px 20px;
            transition: all 0.3s ease;
        }
        
        .control-group {
            margin-bottom: 20px;
        }
        
        .control-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
        }
        
        .control-label i {
            margin-right: 8px;
            font-size: 16px;
        }
        
        .input-container {
            position: relative;
        }
        
        .interval-input {
            width: 100%;
            padding: 12px 15px;
            padding-left: 40px;
            border-radius: 8px;
            border: none;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        .input-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.7);
        }
        
        .interval-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.25);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        .button-container {
            display: flex;
            gap: 12px;
            margin-bottom: 15px;
        }
        
        .control-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .control-btn i {
            margin-right: 8px;
        }
        
        .start-btn {
            background: linear-gradient(to right, #00b09b, #96c93d);
            color: white;
        }
        
        .start-btn:hover {
            background: linear-gradient(to right, #009c7d, #8ab82a);
            box-shadow: 0 4px 12px rgba(150, 201, 61, 0.4);
        }
        
        .stop-btn {
            background: linear-gradient(to right, #ff416c, #ff4b2b);
            color: white;
        }
        
        .stop-btn:hover {
            background: linear-gradient(to right, #e0355e, #e34223);
            box-shadow: 0 4px 12px rgba(255, 75, 43, 0.4);
        }
        
        .status-container {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .status-label {
            font-size: 13px;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        
        .status-value {
            font-weight: bold;
            font-size: 16px;
        }
        
        .running {
            color: #96c93d;
        }
        
        .stopped {
            color: #ff9a9e;
        }
        
        .last-action {
            font-size: 13px;
            opacity: 0.8;
            margin-top: 5px;
        }
        
        .timer-display {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            font-size: 22px;
            letter-spacing: 2px;
        }
        
        .hand-icon {
            position: absolute;
            top: -30px;
            right: 20px;
            font-size: 48px;
            color: #4CAF50;
            transform: rotate(-20deg);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: rotate(-20deg) scale(1); }
            50% { transform: rotate(-20deg) scale(1.1); }
            100% { transform: rotate(-20deg) scale(1); }
        }
        
        .highlight {
            animation: highlight 0.8s ease;
        }
        
        @keyframes highlight {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
        
        .pulse-notice {
            font-size: 12px;
            margin-top: 8px;
            color: #ffeb3b;
            text-align: center;
        }
        
        .pulse-mode .hand-icon {
            animation: pulseFast 0.8s infinite;
        }
        
        @keyframes pulseFast {
            0% { transform: rotate(-20deg) scale(1); }
            50% { transform: rotate(-20deg) scale(1.2); }
            100% { transform: rotate(-20deg) scale(1); }
        }
    `);
    
    // 创建控制面板
    function createControlPanel() {
        // 面板容器
        const panel = document.createElement('div');
        panel.id = 'auto-hand-raise-panel';
        
        // 脉冲模式指示器
        const pulseIndicator = document.createElement('div');
        pulseIndicator.className = 'pulse-indicator';
        panel.appendChild(pulseIndicator);
        
        // 添加举手图标
        const handIcon = document.createElement('div');
        handIcon.className = 'hand-icon';
        handIcon.innerHTML = '✋';
        panel.appendChild(handIcon);
        
        // 面板头部
        const header = document.createElement('div');
        header.className = 'panel-header';
        
        const title = document.createElement('div');
        title.className = 'panel-title';
        title.innerHTML = '<i>⏱️</i> 脉冲举手';
        
        const controls = document.createElement('div');
        controls.className = 'panel-controls';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'minimize-btn';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = '最小化面板';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = '关闭面板';
        
        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        panel.appendChild(header);
        
        // 面板内容区域
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        // 时间间隔控制
        const intervalGroup = document.createElement('div');
        intervalGroup.className = 'control-group';
        
        const intervalLabel = document.createElement('label');
        intervalLabel.className = 'control-label';
        intervalLabel.innerHTML = '<i>⚡</i> 举手间隔（秒）';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        const inputIcon = document.createElement('div');
        inputIcon.className = 'input-icon';
        inputIcon.innerHTML = '⏱️';
        
        const intervalInput = document.createElement('input');
        intervalInput.type = 'number';
        intervalInput.className = 'interval-input';
        intervalInput.id = 'hand-raise-interval';
        intervalInput.min = '0.8';
        intervalInput.max = '600';
        intervalInput.step = '0.1';
        intervalInput.value = '0.8';
        
        inputContainer.appendChild(inputIcon);
        inputContainer.appendChild(intervalInput);
        
        intervalGroup.appendChild(intervalLabel);
        intervalGroup.appendChild(inputContainer);
        
        // 脉冲模式提示
        const pulseNotice = document.createElement('div');
        pulseNotice.className = 'pulse-notice';
        pulseNotice.textContent = '脉冲模式已启用（最小间隔0.8秒）';
        intervalGroup.appendChild(pulseNotice);
        
        content.appendChild(intervalGroup);
        
        // 按钮控制
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-container';
        
        const startBtn = document.createElement('button');
        startBtn.className = 'control-btn start-btn';
        startBtn.id = 'start-hand-raise';
        startBtn.innerHTML = '<i>▶️</i> 开始';
        
        const stopBtn = document.createElement('button');
        stopBtn.className = 'control-btn stop-btn';
        stopBtn.id = 'stop-hand-raise';
        stopBtn.innerHTML = '<i>⏹️</i> 停止';
        stopBtn.disabled = true;
        
        buttonGroup.appendChild(startBtn);
        buttonGroup.appendChild(stopBtn);
        content.appendChild(buttonGroup);
        
        // 状态显示
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container';
        
        const statusLabel = document.createElement('div');
        statusLabel.className = 'status-label';
        statusLabel.textContent = '当前状态';
        
        const statusValue = document.createElement('div');
        statusValue.id = 'hand-raise-status';
        statusValue.className = 'status-value stopped';
        statusValue.textContent = '已停止';
        
        const lastAction = document.createElement('div');
        lastAction.id = 'last-action-time';
        lastAction.className = 'last-action';
        lastAction.textContent = '上次操作: 从未';
        
        statusContainer.appendChild(statusLabel);
        statusContainer.appendChild(statusValue);
        statusContainer.appendChild(lastAction);
        content.appendChild(statusContainer);
        
        // 计时器显示
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer-display';
        timerDisplay.id = 'hand-raise-timer';
        timerDisplay.textContent = '00.00';
        content.appendChild(timerDisplay);
        
        panel.appendChild(content);
        
        // 添加到页面
        document.body.appendChild(panel);
        
        // 添加事件监听器
        minimizeBtn.addEventListener('click', () => {
            panel.classList.toggle('panel-minimized');
            minimizeBtn.innerHTML = panel.classList.contains('panel-minimized') ? '+' : '−';
        });
        
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }
    
    // 查找举手按钮（支持"举手"和"取消举手"状态）
    function findRaiseHandButton() {
        // 使用提供的选择器查找按钮
        const buttons = document.querySelectorAll('span.leftNav-item__bottom');
        for (const button of buttons) {
            if (button.textContent.trim() === '举手' || button.textContent.trim() === '取消举手') {
                return button;
            }
        }
        
        // 备用选择器
        const fallbackSelectors = [
            'div[title="举手"], div[title="取消举手"]',
            'button:contains("举手"), button:contains("取消举手")',
            'span:contains("举手"), span:contains("取消举手")'
        ];
        
        for (const selector of fallbackSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                if (el.textContent.trim() === '举手' || el.textContent.trim() === '取消举手') {
                    return el;
                }
            }
        }
        
        return null;
    }
    
    // 模拟点击举手按钮
    function clickRaiseHandButton() {
        const button = findRaiseHandButton();
        if (button) {
            // 添加视觉反馈
            button.classList.add('highlight');
            setTimeout(() => {
                button.classList.remove('highlight');
            }, 800);
            
            // 触发点击事件
            button.click();
            
            // 更新上次操作时间
            const now = new Date();
            document.getElementById('last-action-time').textContent = 
                `上次操作: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            return true;
        }
        return false;
    }
    
    // 主函数
    function main() {
        createControlPanel();
        
        let timer = null;
        let countdown = 0;
        const startBtn = document.getElementById('start-hand-raise');
        const stopBtn = document.getElementById('stop-hand-raise');
        const intervalInput = document.getElementById('hand-raise-interval');
        const statusValue = document.getElementById('hand-raise-status');
        const timerDisplay = document.getElementById('hand-raise-timer');
        const controlPanel = document.getElementById('auto-hand-raise-panel');
        
        // 更新计时器显示
        function updateTimerDisplay() {
            timerDisplay.textContent = countdown.toFixed(2);
        }
        
        // 开始按钮点击事件
        startBtn.addEventListener('click', () => {
            const interval = parseFloat(intervalInput.value);
            
            if (isNaN(interval) || interval < 0.8) {
                alert('时间间隔不能小于0.8秒');
                return;
            }
            
            // 检查按钮是否存在
            if (!findRaiseHandButton()) {
                alert('未找到举手按钮，请确保在互动课堂中');
                return;
            }
            
            // 立即执行一次点击
            const clicked = clickRaiseHandButton();
            if (!clicked) {
                alert('无法点击举手按钮');
                return;
            }
            
            // 设置定时器
            countdown = interval;
            updateTimerDisplay();
            
            // 启用脉冲模式UI
            if (interval < 2) {
                controlPanel.classList.add('pulse-mode');
            }
            
            timer = setInterval(() => {
                const success = clickRaiseHandButton();
                if (!success) {
                    clearInterval(timer);
                    statusValue.textContent = '错误: 举手按钮消失';
                    statusValue.className = 'status-value stopped';
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                    controlPanel.classList.remove('pulse-mode');
                    return;
                }
                
                countdown = interval;
                updateTimerDisplay();
            }, interval * 1000);
            
            // 设置倒计时更新
            const countdownTimer = setInterval(() => {
                if (countdown > 0) {
                    countdown -= 0.01;
                    if (countdown < 0) countdown = 0;
                    updateTimerDisplay();
                }
            }, 10);
            
            // 更新UI状态
            statusValue.textContent = '运行中';
            statusValue.className = 'status-value running';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // 存储计时器以便停止
            timer.countdownTimer = countdownTimer;
        });
        
        // 停止按钮点击事件
        stopBtn.addEventListener('click', () => {
            if (timer) {
                clearInterval(timer);
                clearInterval(timer.countdownTimer);
                timer = null;
            }
            
            statusValue.textContent = '已停止';
            statusValue.className = 'status-value stopped';
            timerDisplay.textContent = '00.00';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            controlPanel.classList.remove('pulse-mode');
        });
    }
    
    // 等待DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
