AOS.init({ once: true, offset: 100 });

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('pkChart').getContext('2d');
    
    const pkChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['人口數 (萬)', '房價中位數 (萬/坪)', '高中升學率 (%)'],
            datasets: [
                {
                    label: '北屯區',
                    data: [30.5, 45, 88], 
                    backgroundColor: '#0066cc', // 經典大廠藍
                    borderRadius: 6,
                    borderSkipped: false
                },
                {
                    label: '竹東鎮',
                    data: [9.7, 30, 82],  
                    backgroundColor: '#34c759', // 經典大廠綠
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#1d1d1f', font: { size: 13, family: "'Noto Sans TC', sans-serif" } } }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: '#e5e5ea' }, 
                    ticks: { color: '#86868b' },
                    border: { display: false } // 隱藏軸線，更顯乾淨
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#86868b' },
                    border: { display: false }
                }
            }
        }
    });
});

function filterSelection(category) {
    const items = document.getElementsByClassName('grid-item');
    const buttons = document.getElementsByClassName('filter-btn');

    for (let btn of buttons) { btn.classList.remove('active'); }
    event.target.classList.add('active');

    for (let i = 0; i < items.length; i++) {
        if (category === 'all' || items[i].classList.contains(category)) {
            items[i].style.display = 'block';
            items[i].style.animation = 'fadeIn 0.4s ease forwards';
        } else {
            items[i].style.display = 'none';
        }
    }
}

const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

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