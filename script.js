// 1. 初始化 AOS 動畫套件
AOS.init({
    once: true, // 動畫只會觸發一次，避免上下滾動時眼睛疲勞
    offset: 100 // 提早 100px 觸發動畫
});

// 2. 初始化 Chart.js (基本數據圖表)
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('pkChart').getContext('2d');
    const pkChart = new Chart(ctx, {
        type: 'bar', // 長條圖
        data: {
            labels: ['人口數 (萬)', '房價中位數 (萬/坪)', '高中升學率 (%)'],
            datasets: [
                {
                    label: '北屯區',
                    data: [30.5, 45, 88], // 這裡請替換成你們查到的真實數據
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    label: '竹東鎮',
                    data: [9.7, 30, 82],  // 這裡請替換成你們查到的真實數據
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});

// 3. 美食地點的分類篩選功能
function filterSelection(category) {
    const items = document.getElementsByClassName('grid-item');
    const buttons = document.getElementsByClassName('filter-btn');

    // 更新按鈕樣式
    for (let btn of buttons) {
        btn.classList.remove('active');
    }
    event.target.classList.add('active');

    // 顯示或隱藏卡片
    for (let i = 0; i < items.length; i++) {
        if (category === 'all') {
            items[i].style.display = 'block';
        } else {
            if (items[i].classList.contains(category)) {
                items[i].style.display = 'block';
            } else {
                items[i].style.display = 'none';
            }
        }
    }
}

// 4. 回到頂端按鈕邏輯
const topBtn = document.getElementById("backToTop");

window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}