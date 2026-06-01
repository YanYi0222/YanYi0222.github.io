document.addEventListener('DOMContentLoaded', function () {
    // 初始化 AOS (必須在 AOS 庫載入後才執行)
    if (typeof AOS !== 'undefined') {
        AOS.init({ once: true, offset: 100 });
    }
    // --- 首頁探索按鈕邏輯 ---
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function () {
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
        homeLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 綜合評估與總結：雷達圖初始化 ---
    const radarCtx = document.getElementById('pkRadarChart');
    if (radarCtx) {
        window.radarChart = new Chart(radarCtx.getContext('2d'), {
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
            { id: 'b1', name: '台中國際會展中心', lat: 24.193854821224797, lng: 120.65219684877691, tag: '展覽中心', desc: '臺中國際會展中心位於水湳經貿園區，以「大樹之門」為設計概念，融合自然光影與現代工藝。作為中部首座國際級會展平台，不僅擁有超過兩千個展覽攤位與萬人會議空間，更獲鑽石級綠建築認證，將大幅帶動中部產業鏈升級與國際接軌。', imgs: ['img/beitun/b101.jpg', 'img/beitun/b102.jpg'] },
            { id: 'b2', name: '洲際棒球場', lat: 24.1999, lng: 120.6853, tag: '大型地標', desc: '台灣指標性的棒球場地，帶動了周邊十一期重劃區的商業與房市發展。', img: ['img/beitun/b201.jpg', 'img/beitun/b202.jpg', 'img/beitun/b203.jpg', 'img/beitun/b204.jpg'] },
            { id: 'b3', name: '捷運中清站', lat: 24.1741, lng: 120.6657, tag: '交通節點', desc: '台中捷運綠線重要站點，大幅提升了北屯區前往市區與高鐵站的通勤效率。', imgs: ['img/beitun/b301.jpg', 'img/beitun/b302.jpg', 'img/beitun/b303.jpg'] },
            { id: 'b4', name: '漢神百貨', lat: 24.198348286926937, lng: 120.68634018979301, tag: '購物商場', desc: '位於洲際棒球場旁的超大型購物中心，帶來強大的商業動能。', img: ['img/beitun/b401.jpg', 'img/beitun/b402.jpg', 'img/beitun/b403.jpg', 'img/beitun/b404.jpg'] },
            { id: 'b5', name: '中央公園', lat: 24.185799802200865, lng: 120.65356404998934, tag: '大型公園', desc: '水湳經貿園區內的超大型綠地，有台中之肺的美稱。', imgs: ['img/beitun/b501.jpg', 'img/beitun/b502.jpg', 'img/beitun/b503.jpg', 'img/beitun/b504.jpg', 'img/beitun/b505.jpg', 'img/beitun/b506.jpg', 'img/beitun/b507.jpg', 'img/beitun/b508.jpg'] },
            { id: 'b6', name: '水湳生態公園', lat: 24.179791115304695, lng: 120.67938730698643, tag: '自然綠地', desc: '結合生態保育與休閒娛樂的優質綠地空間。', imgs: ['img/beitun/b601.jpg', 'img/beitun/b602.jpg', 'img/beitun/b603.jpg', 'img/beitun/b604.jpg'] },
            { id: 'b7', name: '炸滋滋ZiZi', lat: 24.190644552470438, lng: 120.67849690698664, tag: '在地美食', desc: '台中市北屯區崇德十路二段205號。酥脆美味的炸物選擇，深受在地居民喜愛。', img: ['img/beitun/b701.jpg', 'img/beitun/b702.jpg'] }
            { id: 'b8', name: '漆-蛋餅', lat: 24.178230519354297, lng: 120.66763545856806, tag: '在地美食', desc: '傳承自苗栗銅鑼 40 年老店「銅鑼蛋餅」，目前由第三代在台中經營。有別於一般的粉漿蛋餅，他們堅持使用手工手揉的「古早味蔥餅皮」，吃起來厚實、帶有 Q 度和明顯的麵粉香氣。', imgs: ['img/beitun/b801.jpg'] }
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
                    [24.801, 120.971], // 新竹
                    [24.809, 120.983], // 北新竹
                    [24.808, 121.002], // 千甲
                    [24.793, 121.017], // 新莊
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
                    { name: "台鐵 新竹站", lat: 24.801, lng: 120.971 },
                    { name: "台鐵 北新竹站", lat: 24.809, lng: 120.983 },
                    { name: "台鐵 千甲站", lat: 24.808, lng: 121.002 },
                    { name: "台鐵 新莊站", lat: 24.793, lng: 121.017 },
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
let currentTileLayer; // 管理目前的底圖圖層

// 初始化地圖 (在畫面載入後執行)
document.addEventListener('DOMContentLoaded', function () {
    // --- 地圖初始化 ---
    // 設定初始中心點為北屯
    map = L.map('interactive-map').setView(mapData.beitun.center, mapData.beitun.zoom);

    // 引入較豐富質感的底圖 (CartoDB Voyager)
    currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
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

/* =========================================
   互動投票邏輯 (Poll Logic)
   ========================================= */
function handleVote(choice) {
    // 隱藏選項，顯示結果
    document.getElementById('pollOptions').style.display = 'none';
    const resultsDiv = document.getElementById('pollResults');
    resultsDiv.style.display = 'block';

    // 重新觸發動畫
    resultsDiv.style.animation = 'none';
    void resultsDiv.offsetWidth;
    resultsDiv.style.animation = 'fadeInSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

    // 模擬動態數據載入 (稍微給使用者選擇的項目加權)
    let beitunTarget = 55;
    let zhudongTarget = 45;

    if (choice === 'zhudong') {
        beitunTarget = 42;
        zhudongTarget = 58;
    } else {
        beitunTarget = 68;
        zhudongTarget = 32;
    }

    // 重置進度條
    const beitunBar = document.getElementById('poll-beitun-bar');
    const zhudongBar = document.getElementById('poll-zhudong-bar');
    const beitunText = document.getElementById('poll-beitun-percent');
    const zhudongText = document.getElementById('poll-zhudong-percent');

    beitunBar.style.width = '0%';
    zhudongBar.style.width = '0%';
    beitunText.textContent = '0%';
    zhudongText.textContent = '0%';

    // 延遲一點點時間後開始跑條
    setTimeout(() => {
        beitunBar.style.width = beitunTarget + '%';
        zhudongBar.style.width = zhudongTarget + '%';

        // 數字跑動動畫
        animateValue(beitunText, 0, beitunTarget, 1500);
        animateValue(zhudongText, 0, zhudongTarget, 1500);
    }, 100);
}

function resetVote() {
    document.getElementById('pollResults').style.display = 'none';
    document.getElementById('pollOptions').style.display = 'flex';
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        // 使用 easeOutExpo 的數學公式讓數字跳動更自然
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + '%';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end + '%';
        }
    };
    window.requestAnimationFrame(step);
}

/* =========================================
   日夜切換邏輯 (Day/Night Theme)
   ========================================= */
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');

    // 切換按鈕圖示
    const moon = document.querySelector('.moon-icon');
    const sun = document.querySelector('.sun-icon');

    if (moon && sun) {
        if (isDark) {
            moon.style.display = 'none';
            sun.style.display = 'inline';
        } else {
            moon.style.display = 'inline';
            sun.style.display = 'none';
        }
    }

    // 切換 Leaflet 地圖底圖
    if (map && currentTileLayer) {
        map.removeLayer(currentTileLayer);

        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        currentTileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap contributors & CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // 將地標圖層提到最上層
        if (markersLayer) markersLayer.bringToFront();
        if (routeNodesLayer) routeNodesLayer.bringToFront();
    }

    // 適配 Chart.js 雷達圖
    if (window.radarChart) {
        const textColor = isDark ? '#f5f5f7' : '#1d1d1f';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

        window.radarChart.options.scales.r.angleLines.color = gridColor;
        window.radarChart.options.scales.r.grid.color = gridColor;
        window.radarChart.options.scales.r.pointLabels.color = textColor;
        window.radarChart.options.plugins.legend.labels.color = textColor;
        window.radarChart.update();
    }

    // 重新渲染 Lucide icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/* =========================================
   生活型態推薦邏輯 (Persona Selector)
   ========================================= */
const personaData = {
    family: {
        winner: '竹東鎮',
        winnerClass: 'winner-zhudong',
        title: '大空間與竹科通勤的最佳解',
        desc: '對於重視育兒空間的小家庭來說，竹東能以相對親民的預算買到寬敞的大四房或透天厝。不僅孩子有充裕的活動空間，開車前往竹科也能避開市區塞車車潮，省下時間陪伴家人。'
    },
    dink: {
        winner: '北屯區',
        winnerClass: 'winner-beitun',
        title: '極致便利的都會時尚生活',
        desc: '不需考慮大家庭空間，頂客族更適合北屯的機能爆發力。下樓就有捷運、大型商場(漢神/巨蛋)，週末可以隨時去文青咖啡廳或高檔餐廳約會，享受充滿活力與潮流的都會節奏。'
    },
    retire: {
        winner: '竹東鎮',
        winnerClass: 'winner-zhudong',
        title: '濃郁人情味與自然慢活步調',
        desc: '退休生活需要的是良好的自然環境與醫療資源。竹東擁有全台最大的客家傳統市場，每天都能採買新鮮食材；周邊有榮總新竹分院等醫療資源，且隨時能前往大山背等自然步道健行，慢活節奏無可取代。'
    }
};

function selectPersona(type) {
    // 移除所有 active
    document.querySelectorAll('.persona-card').forEach(card => card.classList.remove('active'));
    // 為點擊或對應的卡片加上 active
    const targetCard = document.querySelector(`.persona-card[onclick*="selectPersona('${type}')"]`);
    if (targetCard) {
        targetCard.classList.add('active');
    }

    const data = personaData[type];
    const resultDiv = document.getElementById('personaResult');

    // 動畫重置
    resultDiv.style.animation = 'none';
    void resultDiv.offsetWidth;
    resultDiv.style.animation = 'fadeInSlide 0.6s ease';

    resultDiv.innerHTML = `
        <div class="persona-winner ${data.winnerClass}">
            <i data-lucide="award" style="display:inline-block; vertical-align:text-bottom; width:20px; height:20px;"></i> 推薦：${data.winner}
        </div>
        <h3 class="persona-result-title serif-title">${data.title}</h3>
        <p class="persona-result-desc">${data.desc}</p>
    `;

    // 重新渲染 Lucide icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 預設載入第一個
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('personaResult')) {
        selectPersona('family');
    }

    // 初始化 Lucide 圖示
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/* =========================================
   通勤時間視覺化邏輯 (Commute Visualizer)
   ========================================= */
const commuteData = {
    hsinchu: {
        beitun: { drive: 75, transit: 95 }, // 開車約75分，大眾(高鐵轉台鐵)約95分
        zhudong: { drive: 15, transit: 35 } // 快速道路15分，大眾(公車5608)約35分
    },
    taichung: {
        beitun: { drive: 20, transit: 15 }, // 開車20分，捷運(文心中清->市政府)15分
        zhudong: { drive: 80, transit: 100 }
    },
    hsr: {
        beitun: { drive: 25, transit: 25 }, // 到台中高鐵
        zhudong: { drive: 20, transit: 25 } // 到新竹高鐵(六家)
    }
};

function updateCommute() {
    const dest = document.getElementById('commuteDest').value;
    if (!dest) return;

    const data = commuteData[dest];

    // 最大時間設定為 120 分鐘，為了讓進度條比例好看
    const maxTime = 120;

    const elements = [
        { id: 'beitun-drive', val: data.beitun.drive },
        { id: 'beitun-transit', val: data.beitun.transit },
        { id: 'zhudong-drive', val: data.zhudong.drive },
        { id: 'zhudong-transit', val: data.zhudong.transit }
    ];

    elements.forEach(el => {
        const bar = document.getElementById(`bar-${el.id}`);
        const text = document.getElementById(`time-${el.id}`);

        let percentage = (el.val / maxTime) * 100;
        if (percentage > 100) percentage = 100;

        bar.style.width = '0%'; // reset
        text.textContent = '-- 分鐘';

        setTimeout(() => {
            bar.style.width = percentage + '%';
            animateTime(text, 0, el.val, 1200);
        }, 50);
    });
}

function animateTime(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + ' 分鐘';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end + ' 分鐘';
        }
    };
    window.requestAnimationFrame(step);
}

// 終極防護：確保在所有資源與腳本都載入完畢後，強制執行一次 Lucide 圖示渲染
// 以防任何其他腳本錯誤中斷了 DOMContentLoaded 的執行
window.addEventListener('load', function () {
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {
        console.error("Lucide icons rendering error:", e);
    }
});