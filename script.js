AOS.init({ once: true, offset: 100 });

document.addEventListener('DOMContentLoaded', function () {
    // --- 首頁探索按鈕邏輯 ---
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            // 1. 導覽列滑入
            document.querySelector('.navbar').classList.add('visible');
            
            // 2. 解鎖網頁滾動
            document.body.classList.remove('locked');
            
            // 3. 觸發首頁放大淡出動畫
            const hero = document.getElementById('hero');
            hero.classList.add('hero-fade-out');
            
            // 4. 動畫結束後隱藏首頁區塊，避免影響操作
            setTimeout(() => {
                hero.style.display = 'none';
            }, 1200);
        });
    }

    // --- 處理導覽列「首頁」連結點擊 ---
    // 因為首頁區塊在探索後會被隱藏，點擊首頁時直接平滑滾動到最上方
    const homeLink = document.querySelector('.nav-links a[href="#hero"]');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 綜合評估與總結：雷達圖初始化 ---
    const radarCtx = document.getElementById('pkRadarChart');
    if (radarCtx) {
        new Chart(radarCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['發展潛力', '生活機能', '房價親民度', '交通便利', '歷史人文', '教育資源'],
                datasets: [
                    {
                        label: '臺中市 北屯區',
                        data: [95, 90, 50, 90, 75, 88],
                        backgroundColor: 'rgba(198, 112, 83, 0.2)',
                        borderColor: '#c67053',
                        pointBackgroundColor: '#c67053',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#c67053',
                        borderWidth: 2
                    },
                    {
                        label: '新竹縣 竹東鎮',
                        data: [80, 75, 85, 70, 85, 82],
                        backgroundColor: 'rgba(92, 119, 107, 0.2)',
                        borderColor: '#5c776b',
                        pointBackgroundColor: '#5c776b',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#5c776b',
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
                            display: false,
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
    }
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
            { id: 'b1', name: '大坑風景區', lat: 24.1834, lng: 120.7323, tag: '自然景點', desc: '擁有「台中後花園」美稱，多條不同難度的登山步道，是週末踏青的首選。', imgs: ['img/beitun/b1.jpg', 'https://images.unsplash.com/photo-1543165365-07232ed12fad?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571401834381-80bbbaae2ea1?q=80&w=600&auto=format&fit=crop'] },
            { id: 'b2', name: '洲際棒球場', lat: 24.1999, lng: 120.6853, tag: '大型地標', desc: '台灣指標性的棒球場地，帶動了周邊十一期重劃區的商業與房市發展。', img: 'img/beitun/b2.jpg' },
            { id: 'b3', name: '捷運中清站', lat: 24.1741, lng: 120.6657, tag: '交通節點', desc: '台中捷運綠線重要站點，大幅提升了北屯區前往市區與高鐵站的通勤效率。', imgs: ['img/beitun/b301.jpg', 'img/beitun/b302.jpg', 'img/beitun/b303.jpg'] },
            { id: 'b4', name: '漢神百貨', lat: 24.1866, lng: 120.6835, tag: '購物商場', desc: '位於洲際棒球場旁的超大型購物中心，帶來強大的商業動能。', img: 'img/beitun/b4.jpg' },
            { id: 'b5', name: '中央公園', lat: 24.1856, lng: 120.6558, tag: '大型公園', desc: '水湳經貿園區內的超大型綠地，有台中之肺的美稱。', imgs: ['img/beitun/b501.jpg', 'img/beitun/b502.jpg', 'img/beitun/b503.jpg', 'img/beitun/b504.jpg', 'img/beitun/b505.jpg', 'img/beitun/b506.jpg', 'img/beitun/b507.jpg', 'img/beitun/b508.jpg'] },
            { id: 'b6', name: '水湳生態公園', lat: 24.1888, lng: 120.6588, tag: '自然綠地', desc: '結合生態保育與休閒娛樂的優質綠地空間。', img: 'img/beitun/b6.jpg' },
            { id: 'b7', name: '炸滋滋ZiZi', lat: 24.1853, lng: 120.6863, tag: '在地美食', desc: '台中市北屯區崇德十路二段205號。酥脆美味的炸物選擇，深受在地居民喜愛。', img: 'img/beitun/b7.jpg' }
        ],
        routes: {
            mrt_green: {
                color: '#34c759',
                path: [
                    [24.189, 120.710], // 北屯總站
                    [24.184, 120.706], // 舊社
                    [24.181, 120.703], // 松竹
                    [24.172, 120.695], // 四維國小
                    [24.173, 120.685], // 文心崇德
                    [24.174, 120.665], // 文心中清
                    [24.171, 120.655], // 文華高中
                    [24.167, 120.648], // 文心櫻花
                    [24.163, 120.647]  // 市政府
                ],
                dashArray: '10, 10',
                stations: [
                    { name: "捷運 北屯總站", lat: 24.189, lng: 120.710 },
                    { name: "捷運 舊社站", lat: 24.184, lng: 120.706 },
                    { name: "捷運 松竹站", lat: 24.181, lng: 120.703 },
                    { name: "捷運 四維國小站", lat: 24.172, lng: 120.695 },
                    { name: "捷運 文心崇德站", lat: 24.173, lng: 120.685 },
                    { name: "捷運 文華高中站", lat: 24.171, lng: 120.655 },
                    { name: "捷運 文心櫻花站", lat: 24.167, lng: 120.648 },
                    { name: "捷運 市政府站 (轉乘點)", lat: 24.163, lng: 120.647 }
                ]
            },
            brt_blue: {
                color: '#0066cc',
                path: [
                    [24.137, 120.686], // 台中火車站
                    [24.155, 120.663], // 科博館
                    [24.163, 120.647], // 市政府
                    [24.165, 120.643], // 新光/遠百
                    [24.168, 120.638], // 秋紅谷
                    [24.179, 120.613], // 澄清醫院
                    [24.181, 120.603], // 榮總/東海大學
                    [24.226, 120.579]  // 靜宜大學
                ],
                stations: [
                    { name: "BRT 台中火車站", lat: 24.137, lng: 120.686 },
                    { name: "BRT 科博館站", lat: 24.155, lng: 120.663 },
                    { name: "BRT 市政府站 (轉乘點)", lat: 24.163, lng: 120.647 },
                    { name: "BRT 新光/遠百站", lat: 24.165, lng: 120.643 },
                    { name: "BRT 秋紅谷站", lat: 24.168, lng: 120.638 },
                    { name: "BRT 澄清醫院站", lat: 24.179, lng: 120.613 },
                    { name: "BRT 榮總/東海大學站", lat: 24.181, lng: 120.603 },
                    { name: "BRT 靜宜大學站", lat: 24.226, lng: 120.579 }
                ]
            }
        }
    },
    zhudong: {
        center: [24.737, 121.094], // 竹東鎮大約的中心點
        zoom: 14,
        locations: [
            { id: 'z1', name: '竹東中央市場', lat: 24.7351, lng: 121.0913, tag: '在地美食', desc: '全台最大的客家傳統市場之一，蘊含豐富的客家米食與濃濃的在地人情味。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Traditional+Market' },
            { id: 'z2', name: '蕭如松藝術園區', lat: 24.7380, lng: 121.0905, tag: '歷史文化', desc: '保留完整的日式建築群，紀念台灣水彩畫大師蕭如松，是文青打卡熱點。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Art+Park' },
            { id: 'z3', name: '竹東火車站', lat: 24.7402, lng: 121.0935, tag: '交通節點', desc: '台鐵內灣線最大的車站，過去曾是林業與水泥業的轉運重鎮。', img: 'https://via.placeholder.com/400x250/d5eed1/34c759?text=Train+Station' }
        ],
        routes: {
            train_neiwan: {
                color: '#0066cc',
                path: [
                    [24.806, 121.040], // 六家
                    [24.780, 121.031], // 竹中
                    [24.767, 121.066], // 上員
                    [24.747, 121.082], // 榮華
                    [24.740, 121.093], // 竹東
                    [24.717, 121.118], // 橫山
                    [24.711, 121.139], // 九讚頭
                    [24.717, 121.144], // 合興
                    [24.715, 121.161], // 富貴
                    [24.707, 121.182]  // 內灣
                ],
                dashArray: '10, 10',
                stations: [
                    { name: "台鐵 六家站", lat: 24.806, lng: 121.040 },
                    { name: "台鐵 竹中站", lat: 24.780, lng: 121.031 },
                    { name: "台鐵 上員站", lat: 24.767, lng: 121.066 },
                    { name: "台鐵 榮華站", lat: 24.747, lng: 121.082 },
                    { name: "台鐵 竹東站", lat: 24.740, lng: 121.093 },
                    { name: "台鐵 橫山站", lat: 24.717, lng: 121.118 },
                    { name: "台鐵 九讚頭站", lat: 24.711, lng: 121.139 },
                    { name: "台鐵 合興站", lat: 24.717, lng: 121.144 },
                    { name: "台鐵 富貴站", lat: 24.715, lng: 121.161 },
                    { name: "台鐵 內灣站", lat: 24.707, lng: 121.182 }
                ]
            },
            bus_5608: {
                color: '#ff9500',
                path: [
                    [24.801, 120.971], // 新竹站
                    [24.801, 120.993], // 馬偕醫院
                    [24.795, 120.996], // 清華大學
                    [24.788, 121.000], // 陽明交大
                    [24.779, 121.026], // 科學園區
                    [24.767, 121.043], // 工研院東門
                    [24.740, 121.093], // 竹東火車站
                    [24.728, 121.100]  // 下公館
                ],
                stations: [
                    { name: "5608 新竹站", lat: 24.801, lng: 120.971 },
                    { name: "5608 馬偕醫院", lat: 24.801, lng: 120.993 },
                    { name: "5608 清華大學", lat: 24.795, lng: 120.996 },
                    { name: "5608 陽明交大", lat: 24.788, lng: 121.000 },
                    { name: "5608 科學園區", lat: 24.779, lng: 121.026 },
                    { name: "5608 工研院東門", lat: 24.767, lng: 121.043 },
                    { name: "5608 竹東火車站", lat: 24.740, lng: 121.093 },
                    { name: "5608 下公館", lat: 24.728, lng: 121.100 }
                ]
            }
        }
    }
};

let map; // 宣告全域地圖變數
let markersLayer; // 用來管理大型地標的群組
let routeNodesLayer; // 用來管理路線小節點的群組

// 初始化地圖 (在畫面載入後執行)
document.addEventListener('DOMContentLoaded', function () {
    // --- 地圖初始化 ---
    // 設定初始中心點為北屯
    map = L.map('interactive-map').setView(mapData.beitun.center, mapData.beitun.zoom);

    // 引入較豐富質感的底圖 (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    routeNodesLayer = L.layerGroup().addTo(map);

    // 預設載入北屯的地標
    renderMarkers('beitun');
});

// 繪製地標函數
function renderMarkers(regionKey) {
    markersLayer.clearLayers(); // 清除舊地標
    const data = mapData[regionKey];
    const markerColor = regionKey === 'beitun' ? '#0066cc' : '#34c759';

    // 建立自訂圖標 (帶有動畫波紋效果)
    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin" style="background-color: ${markerColor}; border-color: #fff;"></div><div class="marker-pulse" style="background-color: ${markerColor}"></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40]
    });

    data.locations.forEach(loc => {
        // 建立標記點並使用自訂圖標
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(markersLayer);
        // 設定常駐文字標籤
        marker.bindTooltip(loc.name, {
            permanent: true,
            direction: 'bottom',
            className: 'landmark-label',
            offset: [0, 5]
        });
        marker.on('click', function () {
            updateInfoPanel(loc);
        });
    });
}

let activeRouteLayer = null;

// 切換地區函數 (綁定在 Tabs 上)
function switchRegion(regionKey, eventObj) {
    // 1. 更新按鈕樣式
    document.querySelectorAll('#food-place .map-tab').forEach(btn => btn.classList.remove('active'));

    const e = eventObj || window.event;
    if (e && e.target) {
        e.target.classList.add('active');
    }

    // 2. 切換交通選單
    document.getElementById('beitun-transport').style.display = regionKey === 'beitun' ? 'block' : 'none';
    document.getElementById('zhudong-transport').style.display = regionKey === 'zhudong' ? 'block' : 'none';

    // 返回並清除路線
    closeInfoPanel();
    clearRoutes();

    // 3. 地圖移動
    const newCenter = mapData[regionKey].center;
    const newZoom = mapData[regionKey].zoom;
    map.flyTo(newCenter, newZoom, {
        animate: true,
        duration: 1.5
    });

    // 4. 重繪地標
    setTimeout(() => {
        renderMarkers(regionKey);
    }, 500);
}

// 畫出交通路線
function drawRoute(routeId) {
    clearRoutes(); // 先清除舊路線

    // 更新按鈕樣式
    document.querySelectorAll('.transport-btn').forEach(btn => btn.classList.remove('active-route'));
    const clickedBtn = event.currentTarget || event.target.closest('.transport-btn');
    if (clickedBtn && !clickedBtn.classList.contains('clear-btn')) {
        clickedBtn.classList.add('active-route');
    }

    let routeData = null;
    if (mapData.beitun.routes && mapData.beitun.routes[routeId]) {
        routeData = mapData.beitun.routes[routeId];
    } else if (mapData.zhudong.routes && mapData.zhudong.routes[routeId]) {
        routeData = mapData.zhudong.routes[routeId];
    }

    if (routeData) {
        // 隱藏詳細資訊面板
        document.getElementById('info-data').style.display = 'none';

        activeRouteLayer = L.polyline(routeData.path, {
            color: routeData.color,
            weight: 5,
            opacity: 0.8,
            dashArray: routeData.dashArray || ''
        }).addTo(map);

        // 繪製沿線小站點
        if (routeData.stations) {
            routeData.stations.forEach(st => {
                const node = L.circleMarker([st.lat, st.lng], {
                    radius: 6,
                    fillColor: '#ffffff',
                    color: routeData.color,
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(routeNodesLayer);
                
                // 綁定極簡文字氣泡
                node.bindTooltip(st.name, {
                    direction: 'top',
                    offset: [0, -5],
                    className: 'route-node-tooltip',
                    permanent: false,
                    sticky: true
                });
            });
        }

        map.fitBounds(activeRouteLayer.getBounds(), { padding: [50, 50], animate: true, duration: 1 });
    }
}

function clearRoutes() {
    if (activeRouteLayer) {
        map.removeLayer(activeRouteLayer);
        activeRouteLayer = null;
    }
    if (typeof routeNodesLayer !== 'undefined') {
        routeNodesLayer.clearLayers();
    }
    document.querySelectorAll('.transport-btn').forEach(btn => btn.classList.remove('active-route'));
}

// 關閉資訊面板，顯示交通選單
function closeInfoPanel() {
    document.getElementById('info-data').style.display = 'none';
    document.getElementById('transport-menu').style.display = 'block';

    // 取消標記的地圖點擊氣泡
    map.closePopup();
}

let currentImages = [];
let currentImageIndex = 0;

// 更新右側資訊面板 (點擊地標時)
function updateInfoPanel(locationData) {
    // 隱藏交通選單，顯示資料
    document.getElementById('transport-menu').style.display = 'none';
    const dataState = document.getElementById('info-data');

    dataState.style.display = 'flex';

    // 重新觸發 CSS 動畫
    dataState.classList.remove('fade-in-slide');
    void dataState.offsetWidth;
    dataState.classList.add('fade-in-slide');

    // 支援單張與多張圖片
    if (locationData.imgs && Array.isArray(locationData.imgs) && locationData.imgs.length > 0) {
        currentImages = locationData.imgs;
    } else if (locationData.img) {
        // 防止使用者誤將陣列寫在 img 屬性中
        if (Array.isArray(locationData.img)) {
            currentImages = locationData.img;
        } else {
            currentImages = [locationData.img];
        }
    } else {
        currentImages = [];
    }

    currentImageIndex = 0;
    renderCarousel();

    // 填入資料
    document.getElementById('panel-tag').textContent = locationData.tag;
    document.getElementById('panel-title').textContent = locationData.name;
    document.getElementById('panel-desc').textContent = locationData.desc;
}

function renderCarousel() {
    const imgContainer = document.getElementById('panel-img');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicators = document.getElementById('panel-indicators');

    if (currentImages.length > 0) {
        imgContainer.style.backgroundImage = `url('${currentImages[currentImageIndex]}')`;
    }

    if (currentImages.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        indicators.style.display = 'flex';

        indicators.innerHTML = currentImages.map((_, index) =>
            `<div class="indicator-dot ${index === currentImageIndex ? 'active' : ''}" onclick="goToImage(${index}, event)"></div>`
        ).join('');
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        indicators.style.display = 'none';
    }
}

function prevImage(e) {
    if (e) e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    renderCarousel();
}

function nextImage(e) {
    if (e) e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    renderCarousel();
}

function goToImage(index, e) {
    if (e) e.stopPropagation();
    currentImageIndex = index;
    renderCarousel();
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