AOS.init({ once: true, offset: 100 });

document.addEventListener('DOMContentLoaded', function () {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#1d1d1f', font: { size: 13, family: "'Noto Sans TC', sans-serif" } } }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#e5e5ea' },
                ticks: { color: '#86868b' },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#86868b' },
                border: { display: false }
            }
        }
    };

    new Chart(document.getElementById('populationChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['人口數 (萬)'],
            datasets: [
                { label: '北屯區', data: [30.5], backgroundColor: '#0066cc', borderRadius: 6 },
                { label: '竹東鎮', data: [9.7], backgroundColor: '#34c759', borderRadius: 6 }
            ]
        },
        options: commonOptions
    });

    new Chart(document.getElementById('villagesChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['行政里數 (個)'],
            datasets: [
                { label: '北屯區', data: [42], backgroundColor: '#0066cc', borderRadius: 6 },
                { label: '竹東鎮', data: [25], backgroundColor: '#34c759', borderRadius: 6 }
            ]
        },
        options: commonOptions
    });

    new Chart(document.getElementById('priceChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['房價中位數 (萬/坪)'],
            datasets: [
                { label: '北屯區', data: [45], backgroundColor: '#0066cc', borderRadius: 6 },
                { label: '竹東鎮', data: [30], backgroundColor: '#34c759', borderRadius: 6 }
            ]
        },
        options: commonOptions
    });

    // --- 雷達圖初始化 (綜合 PK 總結) ---
    new Chart(document.getElementById('pkRadarChart').getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['發展潛力', '生活機能', '房價親民度', '交通便利', '歷史人文', '教育資源'],
            datasets: [
                {
                    label: '臺中市 北屯區',
                    data: [95, 90, 50, 90, 75, 88],
                    backgroundColor: 'rgba(0, 102, 204, 0.2)',
                    borderColor: '#0066cc',
                    pointBackgroundColor: '#0066cc',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#0066cc',
                    borderWidth: 2
                },
                {
                    label: '新竹縣 竹東鎮',
                    data: [80, 75, 85, 70, 85, 82],
                    backgroundColor: 'rgba(52, 199, 89, 0.2)',
                    borderColor: '#34c759',
                    pointBackgroundColor: '#34c759',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#34c759',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    pointLabels: {
                        font: { size: 13, family: "'Noto Sans TC', sans-serif", weight: 'bold' },
                        color: '#1d1d1f'
                    },
                    ticks: {
                        display: false, // 隱藏數值標籤，讓圖表更乾淨
                        min: 0,
                        max: 100
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#1d1d1f', font: { size: 13, family: "'Noto Sans TC', sans-serif" }, padding: 20 }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1d1d1f',
                    bodyColor: '#1d1d1f',
                    borderColor: '#e5e5ea',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 5
                }
            }
        }
    });
});

/* =========================================
   互動式地圖與面板邏輯 (Leaflet.js)
   ========================================= */

// 1. 定義地圖資料庫 (北屯與竹東的座標與景點資料)
const mapData = {
    beitun: {
        center: [24.175, 120.680], // 北屯區大約的中心點
        zoom: 13,
        locations: [
            { id: 'b1', name: '大坑風景區', lat: 24.1834, lng: 120.7323, tag: '自然景點', desc: '擁有「台中後花園」美稱，多條不同難度的登山步道，是週末踏青的首選。', img: 'https://via.placeholder.com/400x250/d0e1f9/0066cc?text=Dakeng' },
            { id: 'b2', name: '洲際棒球場', lat: 24.1999, lng: 120.6853, tag: '大型地標', desc: '台灣指標性的棒球場地，帶動了周邊十一期重劃區的商業與房市發展。', img: 'https://via.placeholder.com/400x250/d0e1f9/0066cc?text=Baseball+Stadium' },
            { id: 'b3', name: '捷運松竹站', lat: 24.1804, lng: 120.7027, tag: '交通節點', desc: '台鐵與台中捷運共構站，大幅提升了北屯區前往市區與高鐵站的通勤效率。', img: 'https://via.placeholder.com/400x250/d0e1f9/0066cc?text=MRT+Station' }
        ]
    },
    zhudong: {
        center: [24.737, 121.094], // 竹東鎮大約的中心點
        zoom: 14,
        locations: [
            { id: 'z1', name: '竹東中央市場', lat: 24.7351, lng: 121.0913, tag: '在地美食', desc: '全台最大的客家傳統市場之一，蘊含豐富的客家米食與濃濃的在地人情味。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Traditional+Market' },
            { id: 'z2', name: '蕭如松藝術園區', lat: 24.7380, lng: 121.0905, tag: '歷史文化', desc: '保留完整的日式建築群，紀念台灣水彩畫大師蕭如松，是文青打卡熱點。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Art+Park' },
            { id: 'z3', name: '竹東火車站', lat: 24.7402, lng: 121.0935, tag: '交通節點', desc: '台鐵內灣線最大的車站，過去曾是林業與水泥業的轉運重鎮。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Train+Station' }
        ]
    }
};

let map; // 宣告全域地圖變數
let markersLayer; // 用來管理地標的群組

// 初始化地圖 (在畫面載入後執行)
document.addEventListener('DOMContentLoaded', function () {
    // ... 保留原本 Chart.js 的初始化程式碼 ...

    // --- 地圖初始化 ---
    // 設定初始中心點為北屯
    map = L.map('interactive-map').setView(mapData.beitun.center, mapData.beitun.zoom);

    // 引入極簡風格底圖 (CartoDB Positron，比傳統 Google Map 更有質感)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // 預設載入北屯的地標
    renderMarkers('beitun');
});

// 繪製地標函數
function renderMarkers(regionKey) {
    markersLayer.clearLayers(); // 清除舊地標
    const data = mapData[regionKey];

    data.locations.forEach(loc => {
        // 建立標記點
        const marker = L.marker([loc.lat, loc.lng]).addTo(markersLayer);
        // 設定點擊地標時，顯示小提示，並觸發右側面板更新
        marker.bindPopup(loc.name);
        marker.on('click', function () {
            updateInfoPanel(loc);
        });
    });
}

// 切換地區函數 (綁定在 Tabs 上)
function switchRegion(regionKey, eventObj) {
    // 1. 更新按鈕樣式
    document.querySelectorAll('#food-place .map-tab').forEach(btn => btn.classList.remove('active'));
    
    // 如果從 HTML 傳入了 event 則使用它，否則相容原本的寫法 (不推薦，但預防錯誤)
    const e = eventObj || window.event;
    if (e && e.target) {
        e.target.classList.add('active');
    }

    // 2. 地圖以「平滑飛行(flyTo)」的方式移動到新地區
    const newCenter = mapData[regionKey].center;
    const newZoom = mapData[regionKey].zoom;
    map.flyTo(newCenter, newZoom, {
        animate: true,
        duration: 1.5 // 飛行時間 1.5 秒
    });

    // 3. 延遲一下再重新繪製地標，配合飛行視覺
    setTimeout(() => {
        renderMarkers(regionKey);
    }, 500);

    // 4. 重置右側資訊面板為空狀態
    document.getElementById('info-empty').style.display = 'flex';
    document.getElementById('info-data').style.display = 'none';
}

// 更新右側資訊面板
function updateInfoPanel(locationData) {
    // 隱藏空狀態，顯示資料
    const emptyState = document.getElementById('info-empty');
    const dataState = document.getElementById('info-data');

    emptyState.style.display = 'none';
    dataState.style.display = 'flex';

    // 重新觸發 CSS 動畫 (移除再加入 class)
    dataState.classList.remove('fade-in-slide');
    void dataState.offsetWidth; // 觸發瀏覽器重繪 (Reflow)，這是一個實用的 JS 動畫小技巧
    dataState.classList.add('fade-in-slide');

    // 填入資料
    document.getElementById('panel-img').style.backgroundImage = `url('${locationData.img}')`;
    document.getElementById('panel-tag').textContent = locationData.tag;
    document.getElementById('panel-title').textContent = locationData.name;
    document.getElementById('panel-desc').textContent = locationData.desc;
}

// 切換歷史地區函數
function switchHistory(regionKey, eventObj) {
    // 1. 更新按鈕樣式
    document.querySelectorAll('#history .history-tab').forEach(btn => btn.classList.remove('active'));
    const e = eventObj || window.event;
    if (e && e.target) {
        e.target.classList.add('active');
    }

    // 2. 切換內容顯示
    document.querySelectorAll('.history-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const activeContent = document.getElementById('history-' + regionKey);
    activeContent.style.display = 'block';
    
    // 重新觸發動畫
    void activeContent.offsetWidth;
    activeContent.classList.add('active');
}

const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

const topBtn = document.getElementById("backToTop");
window.onscroll = function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}