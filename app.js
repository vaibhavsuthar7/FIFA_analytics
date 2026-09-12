// Global State
let allPlayers = [];
let filteredPlayers = [];
let chartScatter = null;
let chartPositions = null;
let chartValues = null;
let chartAgeBuckets = null;
let modalRadarChart = null;

let currentSort = { column: 'overall', direction: 'desc' };

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupNavigation();
    setupFilters();
    setupSorting();
    renderAll();
});

// Load JSON dataset
async function loadData() {
    try {
        let response = await fetch('cleaned_data/players_data.json');
        if (!response.ok) {
            response = await fetch('players_data.json');
        }
        allPlayers = await response.json();
        filteredPlayers = [...allPlayers];
        populateClubFilter();
    } catch (err) {
        console.error("Error loading players data:", err);
    }
}

// Setup Navigation Tabs
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Close Modal Button
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('player-modal').addEventListener('click', (e) => {
        if (e.target.id === 'player-modal') closeModal();
    });
}

// Populate Club Dropdown
function populateClubFilter() {
    const clubSelect = document.getElementById('filter-club');
    const clubs = [...new Set(allPlayers.map(p => p.club_name))].sort();
    
    clubs.forEach(club => {
        const opt = document.createElement('option');
        opt.value = club;
        opt.textContent = club;
        clubSelect.appendChild(opt);
    });
}

// Filter Event Listeners
function setupFilters() {
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-position').addEventListener('change', applyFilters);
    document.getElementById('filter-age').addEventListener('change', applyFilters);
    document.getElementById('filter-club').addEventListener('change', applyFilters);
    document.getElementById('filter-gems-toggle').addEventListener('change', applyFilters);

    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-position').value = 'ALL';
        document.getElementById('filter-age').value = 'ALL';
        document.getElementById('filter-club').value = 'ALL';
        document.getElementById('filter-gems-toggle').checked = false;
        applyFilters();
    });
}

// Main Filter Logic
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const pos = document.getElementById('filter-position').value;
    const ageBucket = document.getElementById('filter-age').value;
    const club = document.getElementById('filter-club').value;
    const gemsOnly = document.getElementById('filter-gems-toggle').checked;

    filteredPlayers = allPlayers.filter(p => {
        const matchesSearch = !searchTerm || 
            p.short_name.toLowerCase().includes(searchTerm) ||
            p.club_name.toLowerCase().includes(searchTerm) ||
            p.nationality_name.toLowerCase().includes(searchTerm);

        const matchesPos = pos === 'ALL' || p.position_group === pos;
        const matchesAge = ageBucket === 'ALL' || p.age_bucket === ageBucket;
        const matchesClub = club === 'ALL' || p.club_name === club;
        const matchesGem = !gemsOnly || p.hidden_gem_flag === 'Hidden Gem';

        return matchesSearch && matchesPos && matchesAge && matchesClub && matchesGem;
    });

    renderAll();
}

// Render All Components
function renderAll() {
    updateKPIs();
    renderTable();
    renderGemsGrid();
    renderMatrix();
    renderCharts();
}

// Update KPI Cards
function updateKPIs() {
    document.getElementById('kpi-total-players').textContent = filteredPlayers.length;
    document.getElementById('table-showing-count').textContent = filteredPlayers.length;
    
    if (filteredPlayers.length > 0) {
        const avgRating = filteredPlayers.reduce((acc, p) => acc + p.overall, 0) / filteredPlayers.length;
        const avgPotential = filteredPlayers.reduce((acc, p) => acc + p.potential, 0) / filteredPlayers.length;
        const gemsCount = filteredPlayers.filter(p => p.hidden_gem_flag === 'Hidden Gem').length;
        const avgValue = filteredPlayers.reduce((acc, p) => acc + p.value_million, 0) / filteredPlayers.length;

        document.getElementById('kpi-avg-rating').textContent = avgRating.toFixed(1);
        document.getElementById('kpi-avg-potential').textContent = avgPotential.toFixed(1);
        document.getElementById('kpi-hidden-gems').textContent = gemsCount;
        document.getElementById('gems-count-badge').textContent = gemsCount;
        document.getElementById('kpi-avg-value').textContent = `€${avgValue.toFixed(1)}M`;
    } else {
        document.getElementById('kpi-avg-rating').textContent = '0.0';
        document.getElementById('kpi-avg-potential').textContent = '0.0';
        document.getElementById('kpi-hidden-gems').textContent = '0';
        document.getElementById('gems-count-badge').textContent = '0';
        document.getElementById('kpi-avg-value').textContent = '€0M';
    }
}

// Setup Table Column Sorting
function setupSorting() {
    document.querySelectorAll('.scout-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-sort');
            if (currentSort.column === col) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = col;
                currentSort.direction = 'desc';
            }
            renderTable();
        });
    });
}

// Render Scouting Table
function renderTable() {
    const tbody = document.getElementById('player-table-body');
    tbody.innerHTML = '';

    // Sort Players
    const sorted = [...filteredPlayers].sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];
        if (typeof valA === 'string') {
            return currentSort.direction === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        }
        return currentSort.direction === 'asc' ? valA - valB : valB - valA;
    });

    sorted.slice(0, 100).forEach(p => {
        const tr = document.createElement('tr');
        const isGem = p.hidden_gem_flag === 'Hidden Gem';

        tr.innerHTML = `
            <td><strong>${p.short_name}</strong></td>
            <td><span class="badge pos-badge">${p.primary_position}</span></td>
            <td>${p.club_name}</td>
            <td>${p.age}</td>
            <td><strong>${p.overall}</strong></td>
            <td><strong>${p.potential}</strong></td>
            <td><span class="badge growth-badge">+${p.growth_potential}</span></td>
            <td>€${p.value_million.toFixed(1)}M</td>
            <td>${p.value_for_money}</td>
            <td>${isGem ? '<span class="badge gem-badge"><i class="fa-solid fa-gem"></i> Hidden Gem</span>' : '<span style="color:#6B7280;">Regular</span>'}</td>
            <td><button class="view-btn" onclick="openPlayerModal(${p.sofifa_id})"><i class="fa-solid fa-eye"></i> Scout</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Hidden Gems Grid
function renderGemsGrid() {
    const grid = document.getElementById('gems-grid');
    grid.innerHTML = '';

    const gems = filteredPlayers.filter(p => p.hidden_gem_flag === 'Hidden Gem');

    if (gems.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: span 3; text-align: center; padding: 40px;">No Hidden Gems match current filters.</p>`;
        return;
    }

    gems.slice(0, 24).forEach(p => {
        const card = document.createElement('div');
        card.className = 'gem-card';
        card.innerHTML = `
            <div class="gem-card-top">
                <div>
                    <h3 class="gem-name">${p.short_name}</h3>
                    <p class="gem-club">${p.club_name} • ${p.nationality_name}</p>
                </div>
                <span class="badge gem-badge"><i class="fa-solid fa-gem"></i></span>
            </div>
            
            <div class="gem-ratings">
                <div class="gem-rating-item">
                    <span>Overall</span>
                    <h4 style="color: #60A5FA;">${p.overall}</h4>
                </div>
                <div class="gem-rating-item">
                    <span>Potential</span>
                    <h4 style="color: #10B981;">${p.potential}</h4>
                </div>
                <div class="gem-rating-item">
                    <span>Growth</span>
                    <h4 style="color: #F59E0B;">+${p.growth_potential}</h4>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span style="font-size: 13px; color: var(--text-muted);">Val: <strong>€${p.value_million.toFixed(1)}M</strong></span>
                <button class="view-btn" onclick="openPlayerModal(${p.sofifa_id})">Full Scout</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render Talent Matrix Lists
function renderMatrix() {
    const topRated = [...filteredPlayers].sort((a, b) => b.overall - a.overall).slice(0, 10);
    const topPotential = [...filteredPlayers].sort((a, b) => b.potential - a.potential).slice(0, 10);
    const topValue = [...filteredPlayers].sort((a, b) => b.value_for_money - a.value_for_money).slice(0, 10);

    renderList('top-rated-list', topRated, 'overall', 'Rating');
    renderList('top-potential-list', topPotential, 'potential', 'Potential');
    renderList('top-value-list', topValue, 'value_for_money', 'Score');
}

function renderList(elementId, players, key, label) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    players.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'top-list-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="rank-badge">${index + 1}</span>
                <div>
                    <strong style="color: #fff; font-size: 14px;">${p.short_name}</strong>
                    <p style="font-size: 12px; color: var(--text-muted);">${p.club_name} (${p.primary_position})</p>
                </div>
            </div>
            <strong style="color: var(--accent-green); font-size: 15px;">${p[key]}</strong>
        `;
        container.appendChild(item);
    });
}

// Render Chart.js Visualizations
function renderCharts() {
    renderScatterChart();
    renderPositionsChart();
    renderValuesChart();
    renderAgeBucketsChart();
}

// 1. Scatter Chart: Overall vs Potential
function renderScatterChart() {
    const ctx = document.getElementById('chart-scatter').getContext('2d');
    if (chartScatter) chartScatter.destroy();

    const dataPoints = filteredPlayers.map(p => ({
        x: p.overall,
        y: p.potential,
        player: p
    }));

    chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Regular Targets',
                data: dataPoints.filter(d => d.player.hidden_gem_flag !== 'Hidden Gem'),
                backgroundColor: 'rgba(120, 54, 107, 0.85)',
                pointRadius: 6,
                pointHoverRadius: 9
            },
            {
                label: 'Hidden Gems',
                data: dataPoints.filter(d => d.player.hidden_gem_flag === 'Hidden Gem'),
                backgroundColor: 'rgba(255, 183, 3, 0.95)',
                pointRadius: 7,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#FFF3E6', font: { family: 'Outfit', weight: '600' } } },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const p = ctx.raw.player;
                            return `${p.short_name} (${p.club_name}) - OVR: ${p.overall}, POT: ${p.potential}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Current Overall Rating', color: '#D1B5C6' },
                    grid: { color: 'rgba(255, 243, 230, 0.08)' },
                    ticks: { color: '#D1B5C6' }
                },
                y: {
                    title: { display: true, text: 'Projected Potential Rating', color: '#D1B5C6' },
                    grid: { color: 'rgba(255, 243, 230, 0.08)' },
                    ticks: { color: '#D1B5C6' }
                }
            }
        }
    });
}

// 2. Position Doughnut Chart
function renderPositionsChart() {
    const ctx = document.getElementById('chart-positions').getContext('2d');
    if (chartPositions) chartPositions.destroy();

    const counts = { Attacker: 0, Midfielder: 0, Defender: 0, Goalkeeper: 0 };
    filteredPlayers.forEach(p => {
        if (counts[p.position_group] !== undefined) counts[p.position_group]++;
    });

    chartPositions = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#78366B', '#54274B', '#FFB703', '#E07A5F'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#FFF3E6', font: { family: 'Outfit', weight: '600' } } }
            }
        }
    });
}

// 3. Position Values Bar Chart
function renderValuesChart() {
    const ctx = document.getElementById('chart-values').getContext('2d');
    if (chartValues) chartValues.destroy();

    const groups = ['Attacker', 'Midfielder', 'Defender', 'Goalkeeper'];
    const avgValues = groups.map(g => {
        const groupPlayers = filteredPlayers.filter(p => p.position_group === g);
        if (groupPlayers.length === 0) return 0;
        return (groupPlayers.reduce((acc, p) => acc + p.value_million, 0) / groupPlayers.length).toFixed(1);
    });

    chartValues = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: groups,
            datasets: [{
                label: 'Avg Market Value (€M)',
                data: avgValues,
                backgroundColor: 'rgba(120, 54, 107, 0.85)',
                borderColor: '#FFF3E6',
                borderWidth: 1,
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#D1B5C6' } },
                y: { grid: { color: 'rgba(255, 243, 230, 0.08)' }, ticks: { color: '#D1B5C6' } }
            }
        }
    });
}

// 4. Age Buckets Chart
function renderAgeBucketsChart() {
    const ctx = document.getElementById('chart-age-buckets').getContext('2d');
    if (chartAgeBuckets) chartAgeBuckets.destroy();

    const counts = { 'U21': 0, '21-25': 0, '26-30': 0, '30+': 0 };
    filteredPlayers.forEach(p => {
        if (counts[p.age_bucket] !== undefined) counts[p.age_bucket]++;
    });

    chartAgeBuckets = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#FFB703', '#78366B', '#54274B', '#381932'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#FFF3E6', font: { family: 'Outfit', weight: '600' } } }
            }
        }
    });
}

// Open Player Modal & Radar Chart
function openPlayerModal(sofifaId) {
    const player = allPlayers.find(p => p.sofifa_id === sofifaId);
    if (!player) return;

    document.getElementById('modal-player-name').textContent = player.short_name;
    document.getElementById('modal-player-club').textContent = player.club_name;
    document.getElementById('modal-player-nat').textContent = player.nationality_name;
    document.getElementById('modal-pos-badge').textContent = player.primary_position;

    const gemBadge = document.getElementById('modal-gem-badge');
    if (player.hidden_gem_flag === 'Hidden Gem') {
        gemBadge.style.display = 'inline-flex';
    } else {
        gemBadge.style.display = 'none';
    }

    document.getElementById('modal-stat-age').textContent = player.age;
    document.getElementById('modal-stat-overall').textContent = player.overall;
    document.getElementById('modal-stat-potential').textContent = player.potential;
    document.getElementById('modal-stat-growth').textContent = `+${player.growth_potential}`;
    document.getElementById('modal-stat-value').textContent = `€${player.value_million.toFixed(1)}M`;
    document.getElementById('modal-stat-wage').textContent = `€${(player.wage_eur / 1000).toFixed(0)}K`;

    // Render Radar Chart
    const ctx = document.getElementById('modal-radar-chart').getContext('2d');
    if (modalRadarChart) modalRadarChart.destroy();

    modalRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physicality'],
            datasets: [{
                label: player.short_name,
                data: [player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physic],
                backgroundColor: 'rgba(120, 54, 107, 0.4)',
                borderColor: '#FFF3E6',
                pointBackgroundColor: '#FFF3E6',
                pointBorderColor: '#78366B',
                pointHoverBackgroundColor: '#FFF3E6',
                pointHoverBorderColor: '#78366B'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 243, 230, 0.15)' },
                    grid: { color: 'rgba(255, 243, 230, 0.15)' },
                    pointLabels: { color: '#FFF3E6', font: { size: 12, family: 'Outfit', weight: '600' } },
                    ticks: { color: '#D1B5C6', backdropColor: 'transparent' },
                    suggestedMin: 30,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    document.getElementById('player-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('player-modal').classList.remove('active');
}

