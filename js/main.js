// 頁面加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 檢查當前頁面
    const currentPage = window.location.pathname.split('/').pop();
    
    // 底部導航按鈕
    const navItems = document.querySelectorAll('.nav-item');
    
    // 為每個導航項目添加點擊事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // 如果不是當前頁面則導航到相應頁面
            if (!this.classList.contains('active')) {
                navigateToPage(page);
                
                // 添加過渡效果
                const contentFrame = document.getElementById('content-frame');
                if (contentFrame) {
                    contentFrame.style.opacity = '0.5';
                    setTimeout(() => {
                        contentFrame.style.opacity = '1';
                    }, 300);
                }
                
                // 如果是SOS頁面，添加特殊過渡效果
                if (page === 'sos') {
                    const navItem = document.querySelector('.nav-item[data-page="sos"]');
                    navItem.classList.add('pulse');
                    setTimeout(() => {
                        navItem.classList.remove('pulse');
                    }, 1000);
                }
            }
        });
    });
    
    // 導航到指定頁面
    function navigateToPage(page) {
        const contentFrame = document.getElementById('content-frame');
        if (contentFrame) {
            contentFrame.src = `pages/${page}.html`;
            
            // 更新活動狀態
            navItems.forEach(item => {
                if (item.getAttribute('data-page') === page) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // 滾動到頁面頂部
            contentFrame.onload = function() {
                try {
                    const frameBody = contentFrame.contentWindow.document.body;
                    const scrollableElement = frameBody.querySelector('.scrollable-content, [class*="-container"]');
                    if (scrollableElement) {
                        scrollableElement.scrollTop = 0;
                    }
                } catch (e) {
                    console.log('無法訪問iframe內容：', e);
                }
            };
        }
    }
    
    // 更新狀態欄時間
    function updateStatusBarTime() {
        const timeElement = document.querySelector('.status-bar .time');
        if (timeElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }
    
    // 初始化時更新時間並設置定時更新
    updateStatusBarTime();
    setInterval(updateStatusBarTime, 60000); // 每分鐘更新一次
    
    // 處理標籤切換功能（如在profile頁面中的標籤）
    document.addEventListener('click', function(e) {
        // 委託事件處理，以支持iframe內的元素
        if (e.target && e.target.closest('.tab')) {
            const tabElement = e.target.closest('.tab');
            const tabContainer = tabElement.closest('.tab-container');
            
            if (tabContainer) {
                const tabs = tabContainer.querySelectorAll('.tab');
                const tabName = tabElement.getAttribute('data-tab');
                const contentContainer = document.querySelector('.content-tab.active')?.parentElement;
                
                if (contentContainer) {
                    // 移除所有標籤和內容的active類
                    tabs.forEach(tab => tab.classList.remove('active'));
                    contentContainer.querySelectorAll('.content-tab').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // 添加當前標籤和內容的active類
                    tabElement.classList.add('active');
                    document.getElementById(`${tabName}-tab`)?.classList.add('active');
                }
            }
        }
    });
    
    // 初始化SOS頁面的自動倒數計時
    function initSosCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            let hours = 8;
            let minutes = 0;
            let seconds = 0;
            
            setInterval(function() {
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                    if (minutes < 0) {
                        minutes = 59;
                        hours--;
                        if (hours < 0) {
                            // 倒計時結束，觸發SOS
                            const sosButton = document.getElementById('sos-button');
                            if (sosButton) {
                                sosButton.click();
                            }
                            return;
                        }
                    }
                }
                
                countdownElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }
    
    // 添加主題顏色根據系統深色/淺色模式切換
    function setColorScheme() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const phoneContainer = document.querySelector('.phone-container');
        
        if (darkModeMediaQuery.matches) {
            phoneContainer.classList.add('dark-mode');
        } else {
            phoneContainer.classList.remove('dark-mode');
        }
    }
    
    // 初始設置顏色方案
    setColorScheme();
    
    // 監聽系統顏色方案變化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setColorScheme);
    
    // 各頁面加載完成後的特定初始化
    document.getElementById('content-frame')?.addEventListener('load', function() {
        try {
            const framePage = this.contentWindow.location.pathname.split('/').pop();
            
            // 根據頁面執行特定初始化
            if (framePage === 'sos.html') {
                try {
                    const frameWindow = this.contentWindow;
                    const sosButton = frameWindow.document.getElementById('sos-button');
                    const countdownElement = frameWindow.document.getElementById('countdown');
                    
                    if (sosButton && countdownElement) {
                        // 初始化倒計時
                        let hours = 8;
                        let minutes = 0;
                        let seconds = 0;
                        
                        const timer = setInterval(function() {
                            seconds--;
                            if (seconds < 0) {
                                seconds = 59;
                                minutes--;
                                if (minutes < 0) {
                                    minutes = 59;
                                    hours--;
                                    if (hours < 0) {
                                        clearInterval(timer);
                                        sosButton.click();
                                        return;
                                    }
                                }
                            }
                            
                            countdownElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        }, 1000);
                    }
                } catch (e) {
                    console.log('無法初始化SOS倒計時：', e);
                }
            }
        } catch (e) {
            console.log('iframe載入錯誤：', e);
        }
    });
    
    // 添加CSS動畫到框架外部
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); }
        }
        
        .nav-item.pulse {
            animation: pulse 0.5s ease-in-out;
        }
        
        #content-frame {
            transition: opacity 0.3s ease;
        }
        
        .phone-container.dark-mode {
            border-color: #333;
        }
    `;
    document.head.appendChild(styleElement);
}); 