// XTT Ltd. Co. Portal Interactions

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyEl = document.body;
    const logoImgEl = document.getElementById('logo-img');
    const logoImgFooterEl = document.getElementById('logo-img-footer');

    // Read and apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        bodyEl.classList.remove('light-theme');
        bodyEl.classList.add('dark-theme');
        if (logoImgEl) logoImgEl.src = "images/SimpleLogoSmall_light.png";
        if (logoImgFooterEl) logoImgFooterEl.src = "images/SimpleLogoSmall_light.png";
    } else {
        bodyEl.classList.remove('dark-theme');
        bodyEl.classList.add('light-theme');
        if (logoImgEl) logoImgEl.src = "images/SimpleLogoSmall.png";
        if (logoImgFooterEl) logoImgFooterEl.src = "images/SimpleLogoSmall.png";
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (bodyEl.classList.contains('dark-theme')) {
                bodyEl.classList.remove('dark-theme');
                bodyEl.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
                if (logoImgEl) logoImgEl.src = "images/SimpleLogoSmall.png";
                if (logoImgFooterEl) logoImgFooterEl.src = "images/SimpleLogoSmall.png";
            } else {
                bodyEl.classList.remove('light-theme');
                bodyEl.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                if (logoImgEl) logoImgEl.src = "images/SimpleLogoSmall_light.png";
                if (logoImgFooterEl) logoImgFooterEl.src = "images/SimpleLogoSmall_light.png";
            }
        });
    }

    // --- Mobile & Touch Dropdown Toggles ---
    const dropdowns = document.querySelectorAll('.nav-item-dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                dropdowns.forEach(d => d.classList.remove('active'));
                
                if (!isActive) {
                    dropdown.classList.add('active');
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('active'));
    });

    // --- Interactive Cost Calculator ---
    const planSelect = document.getElementById('plan-select');
    const userRange = document.getElementById('user-count-range');
    const userCountVal = document.getElementById('user-count-val');
    const addConsultingCheckbox = document.getElementById('add-consulting');
    const consultingHoursContainer = document.getElementById('consulting-hours-container');
    const consultingHoursInput = document.getElementById('consulting-hours');

    // Outputs (Common)
    const clientMonthlyOut = document.getElementById('client-monthly-out');
    const clientSetupOut = document.getElementById('client-setup-out');
    const clientConsultingOut = document.getElementById('client-consulting-out');

    // Outputs (Public Page Only: index.html)
    const clientTotalMonthlyOut = document.getElementById('client-total-monthly-out');
    const clientSavingsOut = document.getElementById('client-savings-out');

    // Outputs (Internal Partner Page Only: demo.html)
    const popRevenueOut = document.getElementById('pop-revenue-out');
    const popCostOut = document.getElementById('pop-cost-out');
    const popBandwidthOut = document.getElementById('pop-bandwidth-out');
    const popProfitOut = document.getElementById('pop-profit-out');
    const userMarginOut = document.getElementById('user-margin-out');

    const updateCalculator = () => {
        if (!planSelect || !userRange) return;

        const selectedOption = planSelect.options[planSelect.selectedIndex];
        const planPrice = parseFloat(selectedOption.getAttribute('data-price'));
        const planSetup = parseFloat(selectedOption.getAttribute('data-setup'));
        const userCount = parseInt(userRange.value);
        if (userCountVal) userCountVal.textContent = userCount;

        // Check if consulting is added
        let consultingCost = 0;
        if (addConsultingCheckbox && addConsultingCheckbox.checked) {
            if (consultingHoursContainer) consultingHoursContainer.classList.remove('hidden');
            const hours = parseInt(consultingHoursInput.value) || 0;
            consultingCost = hours * 200.00;
        } else {
            if (consultingHoursContainer) consultingHoursContainer.classList.add('hidden');
        }

        // Common Outputs
        const clientMonthly = planPrice;
        const clientSetup = planSetup; // Exclude consulting from the hardware setup itself, show it separately!

        if (clientMonthlyOut) clientMonthlyOut.textContent = `$${clientMonthly.toFixed(2)}`;
        if (clientSetupOut) clientSetupOut.textContent = `$${clientSetup.toFixed(2)}`;
        if (clientConsultingOut) clientConsultingOut.textContent = `$${consultingCost.toFixed(2)}`;

        // Page-Specific Calculations

        // 1. PUBLIC INDEX CALCULATIONS (Savings / ROI)
        if (clientTotalMonthlyOut && clientSavingsOut) {
            const clientTotalMonthly = userCount * planPrice;
            // Downtime savings: average company experiences 4.2 hours downtime per user/site.
            // XTT dual-WAN / SASE targets < 0.1 hours. Net uptime recovery = 4.1 hours/mo.
            // Estimated labor/productivity recovery of $75/hr per user/site.
            const uptimeSavings = userCount * 4.1 * 75.00;

            clientTotalMonthlyOut.textContent = `$${clientTotalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            clientSavingsOut.textContent = `$${uptimeSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        // 2. PARTNER DEMO CALCULATIONS (Internal Costs & Net Margins)
        if (popProfitOut && userMarginOut) {
            const popRevenue = (userCount * planPrice);
            const popFixedCost = 155.00; // Dedicated server ($65) + IP leasing ($90)
            const popBandwidthCost = userCount * 1.00; // Estimated $1/user bandwidth commit
            const totalPopCost = popFixedCost + popBandwidthCost;
            
            // Partner demo includes the consulting fee directly in net profit calculations!
            const popProfit = popRevenue + consultingCost - totalPopCost;
            
            let grossMarginPercent = 0;
            if (popRevenue > 0) {
                grossMarginPercent = (popProfit / (popRevenue + consultingCost)) * 100;
            }

            if (popRevenueOut) popRevenueOut.textContent = `$${popRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (popCostOut) popCostOut.textContent = `$${popFixedCost.toFixed(2)}`;
            if (popBandwidthOut) popBandwidthOut.textContent = `$${popBandwidthCost.toFixed(2)}`;
            popProfitOut.textContent = `$${popProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            userMarginOut.textContent = `${grossMarginPercent.toFixed(1)}%`;

            // Adjust color highlights
            if (popProfit < 0) {
                popProfitOut.className = 'value highlight-cost';
                userMarginOut.className = 'value highlight-cost';
            } else {
                popProfitOut.className = 'value highlight-profit';
                userMarginOut.className = 'value highlight-profit';
            }
        }
    };

    if (planSelect) planSelect.addEventListener('change', updateCalculator);
    if (userRange) userRange.addEventListener('input', updateCalculator);
    if (addConsultingCheckbox) addConsultingCheckbox.addEventListener('change', updateCalculator);
    if (consultingHoursInput) consultingHoursInput.addEventListener('input', updateCalculator);

    // Initial trigger
    updateCalculator();

    // --- Interactive Network Topology Selector ---
    const mapTabs = document.querySelectorAll('.map-tab');
    const topologyDisplay = document.getElementById('topology-display');

    const renderTopology = (mapType) => {
        if (!topologyDisplay) return;
        topologyDisplay.innerHTML = ''; // Clear

        if (mapType === 'cgnat') {
            topologyDisplay.innerHTML = `
                <div class="topo-node glass" style="border-color: var(--text-muted)">
                    <strong>Home Office</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">CPE hAP ax lite</div>
                    <div style="font-size: 0.75rem; color: #ef4444;">Behind CGNAT</div>
                </div>
                <div class="topo-link">
                    <span>WireGuard Tunnel</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-gold)">
                    <strong>Atlanta PoP Node</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">XTT Core Datacenter</div>
                    <div style="font-size: 0.75rem; color: var(--brand-gold);">MikroTik CHR (BGP Routing)</div>
                </div>
                <div class="topo-link">
                    <span>Inject Clean IP</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-teal)">
                    <strong>Public Internet</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Announced IP Address</div>
                    <div style="font-size: 0.75rem; color: var(--brand-teal);">Port Forwarding Active</div>
                </div>
            `;
        } else if (mapType === 'rural') {
            topologyDisplay.innerHTML = `
                <div class="topo-node glass" style="border-color: var(--text-muted)">
                    <strong>Remote Worksites</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">CPE Chateau LTE6</div>
                    <div style="font-size: 0.75rem; color: var(--brand-teal);">Starlink + LTE/5G</div>
                </div>
                <div class="topo-link">
                    <span>Bonded VPN Transit</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-gold)">
                    <strong>Atlanta PoP Node</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">XTT Core Datacenter</div>
                    <div style="font-size: 0.75rem; color: var(--brand-gold);">MikroTik CHR (BGP Routing)</div>
                </div>
                <div class="topo-link">
                    <span>Static Route</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-teal)">
                    <strong>HQ / Web Access</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Announced BGP IP Block</div>
                    <div style="font-size: 0.75rem; color: var(--brand-teal);">Reliable Failover</div>
                </div>
            `;
        } else if (mapType === 'sdwan') {
            topologyDisplay.innerHTML = `
                <div class="topo-node glass" style="border-color: var(--text-muted)">
                    <strong>Enterprise Branch</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">FortiGate 40F/60F</div>
                    <div style="font-size: 0.75rem; color: var(--brand-teal);">Active-Active WAN</div>
                </div>
                <div class="topo-link">
                    <span>IPSec VPN SASE Tunnels</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-gold)">
                    <strong>Atlanta Cloud PoP</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">SASE Cloud Firewall</div>
                    <div style="font-size: 0.75rem; color: var(--brand-gold);">NGFW / ZTNA Engine</div>
                </div>
                <div class="topo-link">
                    <span>Filtered Access</span>
                    <div class="topo-arrow"></div>
                </div>
                <div class="topo-node glass" style="border-color: var(--brand-teal)">
                    <strong>HQ & SaaS Apps</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Office365 / Cloud / Data</div>
                    <div style="font-size: 0.75rem; color: var(--brand-teal);">Fully Secured Transit</div>
                </div>
            `;
        }
    };

    mapTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            mapTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mapType = tab.getAttribute('data-map');
            renderTopology(mapType);
        });
    });

    // Render default network map (cgnat)
    renderTopology('cgnat');

    // --- Contact Form Submission Handler ---
    const leadForm = document.getElementById('lead-form');
    const successMsg = document.getElementById('form-success-msg');

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const company = document.getElementById('contact-company').value;
            const email = document.getElementById('contact-email').value;
            const phone = document.getElementById('contact-phone').value;
            const msg = document.getElementById('contact-msg').value;

            if (name && company && email && phone && msg) {
                if (successMsg) successMsg.classList.remove('hidden');
                leadForm.reset();
                
                setTimeout(() => {
                    if (successMsg) successMsg.classList.add('hidden');
                }, 5000);
            }
        });
    }
});
