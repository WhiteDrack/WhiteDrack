// Calculator definitions with their respective functions
const calculators = [
    { id: "bmi", name: "BMI Calculator", category: "Body Health", icon: "fas fa-calculator", color: "bg-medical-green" },
    { id: "body-fat", name: "Body Fat Calculator", category: "Body Health", icon: "fas fa-percentage", color: "bg-trust-blue" },
    { id: "bmr", name: "BMR Calculator", category: "Body Health", icon: "fas fa-fire", color: "bg-warning-orange" },
    { id: "body-shape", name: "Body Shape Calculator", category: "Body Health", icon: "fas fa-user", color: "bg-purple" },
    { id: "calorie-burn", name: "Calorie Burn Calculator", category: "Nutrition", icon: "fas fa-fire", color: "bg-red" },
    { id: "macro", name: "Macro Calculator", category: "Nutrition", icon: "fas fa-chart-pie", color: "bg-green" },
    { id: "water-intake", name: "Water Intake Calculator", category: "Nutrition", icon: "fas fa-tint", color: "bg-blue" },
    { id: "heart-rate", name: "Heart Rate Calculator", category: "Fitness", icon: "fas fa-heart", color: "bg-red" },
    { id: "vo2-max", name: "VO2 Max Calculator", category: "Fitness", icon: "fas fa-wind", color: "bg-indigo" },
    { id: "sleep", name: "Sleep Calculator", category: "Wellness", icon: "fas fa-moon", color: "bg-indigo" },
    { id: "blood-pressure", name: "Blood Pressure Guide", category: "Wellness", icon: "fas fa-stethoscope", color: "bg-pink" },
    { id: "pregnancy", name: "Pregnancy Calculator", category: "Special", icon: "fas fa-baby", color: "bg-pink" },
    { id: "ideal-weight", name: "Ideal Weight Calculator", category: "Special", icon: "fas fa-weight", color: "bg-teal" },
    { id: "ovulation", name: "Ovulation Calculator", category: "Women's Health", icon: "fas fa-calendar-check", color: "bg-rose" }
];

let selectedCalculator = '';

// DOM Elements
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeSidebar = document.getElementById('close-sidebar');
const calculatorList = document.getElementById('calculator-list');
const calculatorGrid = document.getElementById('calculator-grid');
const welcomeScreen = document.getElementById('welcome-screen');
const calculatorContainer = document.getElementById('calculator-container');
const selectedCalculatorInfo = document.getElementById('selected-calculator-info');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeGrid();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    menuBtn.addEventListener('click', openSidebar);
    closeSidebar.addEventListener('click', closeSidebarMenu);
    sidebarOverlay.addEventListener('click', closeSidebarMenu);
    
    // Add touch event listeners for better mobile experience
    menuBtn.addEventListener('touchstart', handleTouchStart, { passive: true });
    closeSidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Prevent body scroll when sidebar is open on mobile
    document.addEventListener('touchmove', preventBodyScroll, { passive: false });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Touch event handlers for better mobile feedback
function handleTouchStart(e) {
    e.currentTarget.style.transform = 'scale(0.98)';
    setTimeout(() => {
        e.currentTarget.style.transform = '';
    }, 150);
}

// Prevent body scroll when sidebar is open
function preventBodyScroll(e) {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target)) {
        e.preventDefault();
    }
}

// Keyboard navigation support
function handleKeyboardNavigation(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebarMenu();
    }
}

// Initialize sidebar with calculator list
function initializeSidebar() {
    calculatorList.innerHTML = '';
    calculators.forEach(calc => {
        const button = document.createElement('button');
        button.className = 'calculator-btn';
        button.dataset.calculator = calc.id;
        button.innerHTML = `
            <i class="${calc.icon} calculator-btn-icon"></i>
            <div class="calculator-btn-text">
                <span class="calculator-name">${calc.name}</span>
                <span class="calculator-category">${calc.category}</span>
            </div>
        `;
        button.addEventListener('click', () => selectCalculator(calc.id));
        calculatorList.appendChild(button);
    });
}

// Initialize calculator grid for welcome screen
function initializeGrid() {
    calculatorGrid.innerHTML = '';
    calculators.forEach(calc => {
        const button = document.createElement('button');
        button.className = 'grid-calculator-btn';
        button.innerHTML = `
            <i class="${calc.icon}"></i>
            <span>${calc.name.replace(' Calculator', '').replace(' Guide', '')}</span>
        `;
        button.addEventListener('click', () => selectCalculator(calc.id));
        calculatorGrid.appendChild(button);
    });
}

// Open sidebar
function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close sidebar
function closeSidebarMenu() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Select and display calculator
function selectCalculator(calculatorId) {
    selectedCalculator = calculatorId;
    const calc = calculators.find(c => c.id === calculatorId);
    
    // Update header info
    selectedCalculatorInfo.textContent = `${calc.category} • ${calc.name}`;
    selectedCalculatorInfo.classList.remove('hidden');
    
    // Update sidebar active state
    document.querySelectorAll('.calculator-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.calculator === calculatorId) {
            btn.classList.add('active');
        }
    });
    
    // Show calculator container and hide welcome screen
    welcomeScreen.classList.add('hidden');
    calculatorContainer.classList.remove('hidden');
    
    // Load the specific calculator
    loadCalculator(calculatorId);
    
    // Close sidebar
    closeSidebarMenu();
}

// Load specific calculator HTML
function loadCalculator(calculatorId) {
    const calc = calculators.find(c => c.id === calculatorId);
    let calculatorHTML = '';
    
    switch(calculatorId) {
        case 'bmi':
            calculatorHTML = createBMICalculator(calc);
            break;
        case 'body-fat':
            calculatorHTML = createBodyFatCalculator(calc);
            break;
        case 'bmr':
            calculatorHTML = createBMRCalculator(calc);
            break;
        case 'body-shape':
            calculatorHTML = createBodyShapeCalculator(calc);
            break;
        case 'calorie-burn':
            calculatorHTML = createCalorieBurnCalculator(calc);
            break;
        case 'macro':
            calculatorHTML = createMacroCalculator(calc);
            break;
        case 'water-intake':
            calculatorHTML = createWaterIntakeCalculator(calc);
            break;
        case 'heart-rate':
            calculatorHTML = createHeartRateCalculator(calc);
            break;
        case 'vo2-max':
            calculatorHTML = createVO2MaxCalculator(calc);
            break;
        case 'sleep':
            calculatorHTML = createSleepCalculator(calc);
            break;
        case 'blood-pressure':
            calculatorHTML = createBloodPressureGuide(calc);
            break;
        case 'pregnancy':
            calculatorHTML = createPregnancyCalculator(calc);
            break;
        case 'ideal-weight':
            calculatorHTML = createIdealWeightCalculator(calc);
            break;
        case 'ovulation':
            calculatorHTML = createOvulationCalculator(calc);
            break;
        default:
            calculatorHTML = '<div class="card"><div class="card-content">Calculator not found</div></div>';
    }
    
    calculatorContainer.innerHTML = calculatorHTML;
    setupCalculatorEvents(calculatorId);
}

// BMI Calculator
function createBMICalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Check healthy weight status</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bmi-height" class="label">Height (cm)</label>
                        <input type="number" id="bmi-height" class="input" placeholder="170">
                        <div class="error-message hidden" id="bmi-height-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bmi-weight" class="label">Weight (kg)</label>
                        <input type="number" id="bmi-weight" class="input" placeholder="70">
                        <div class="error-message hidden" id="bmi-weight-error"></div>
                    </div>
                </div>
                
                <button type="button" class="btn" onclick="calculateBMI()">Calculate BMI</button>
                
                <div id="bmi-result" class="result hidden">
                    <div class="result-value" id="bmi-value"></div>
                    <div class="result-label">Your BMI</div>
                    <div class="result-status" id="bmi-status"></div>
                </div>
            </div>
        </div>
    `;
}

// Body Fat Calculator
function createBodyFatCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Approximate body fat percentage</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bf-gender" class="label">Gender</label>
                        <select id="bf-gender" class="select">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <div class="error-message hidden" id="bf-gender-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bf-age" class="label">Age</label>
                        <input type="number" id="bf-age" class="input" placeholder="30">
                        <div class="error-message hidden" id="bf-age-error"></div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bf-waist" class="label">Waist (cm)</label>
                        <input type="number" id="bf-waist" class="input" placeholder="85">
                        <div class="error-message hidden" id="bf-waist-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bf-neck" class="label">Neck (cm)</label>
                        <input type="number" id="bf-neck" class="input" placeholder="38">
                        <div class="error-message hidden" id="bf-neck-error"></div>
                    </div>
                </div>
                
                <div class="form-group" id="bf-hip-group" style="display: none;">
                    <label for="bf-hip" class="label">Hip (cm) - Optional for females</label>
                    <input type="number" id="bf-hip" class="input" placeholder="95">
                </div>
                
                <button type="button" class="btn" onclick="calculateBodyFat()">Calculate Body Fat</button>
                
                <div id="bf-result" class="result hidden">
                    <div class="result-value" id="bf-value"></div>
                    <div class="result-label">Body Fat Percentage</div>
                    <div class="result-status status-normal" id="bf-category"></div>
                </div>
            </div>
        </div>
    `;
}

// BMR Calculator
function createBMRCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Basal Metabolic Rate</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bmr-gender" class="label">Gender</label>
                        <select id="bmr-gender" class="select">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <div class="error-message hidden" id="bmr-gender-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bmr-age" class="label">Age</label>
                        <input type="number" id="bmr-age" class="input" placeholder="30">
                        <div class="error-message hidden" id="bmr-age-error"></div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bmr-height" class="label">Height (cm)</label>
                        <input type="number" id="bmr-height" class="input" placeholder="170">
                        <div class="error-message hidden" id="bmr-height-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bmr-weight" class="label">Weight (kg)</label>
                        <input type="number" id="bmr-weight" class="input" placeholder="70">
                        <div class="error-message hidden" id="bmr-weight-error"></div>
                    </div>
                </div>
                
                <button type="button" class="btn" onclick="calculateBMR()">Calculate BMR</button>
                
                <div id="bmr-result" class="result hidden">
                    <div class="result-value" id="bmr-value"></div>
                    <div class="result-label">Calories per day</div>
                    <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">
                        Calories needed to maintain basic body functions
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Continue with more calculator functions...
function createBodyShapeCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Based on waist-to-hip ratio</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="bs-gender" class="label">Gender</label>
                    <select id="bs-gender" class="select">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <div class="error-message hidden" id="bs-gender-error"></div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bs-waist" class="label">Waist (cm)</label>
                        <input type="number" id="bs-waist" class="input" placeholder="85">
                        <div class="error-message hidden" id="bs-waist-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="bs-hip" class="label">Hip (cm)</label>
                        <input type="number" id="bs-hip" class="input" placeholder="95">
                        <div class="error-message hidden" id="bs-hip-error"></div>
                    </div>
                </div>
                
                <button type="button" class="btn" onclick="calculateBodyShape()">Calculate Body Shape</button>
                
                <div id="bs-result" class="result hidden">
                    <div class="result-value" id="bs-ratio"></div>
                    <div class="result-label">Waist-to-Hip Ratio</div>
                    <div class="result-status" style="background: #9c27b0;" id="bs-shape"></div>
                </div>
            </div>
        </div>
    `;
}

// Add remaining calculator creation functions and calculation logic...

// Calculator logic functions
function calculateBMI() {
    const height = parseFloat(document.getElementById('bmi-height').value);
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    
    // Clear previous errors
    clearErrors(['bmi-height', 'bmi-weight']);
    
    let hasErrors = false;
    
    if (!height || height <= 0) {
        showError('bmi-height', 'Please enter a valid height');
        hasErrors = true;
    }
    
    if (!weight || weight <= 0) {
        showError('bmi-weight', 'Please enter a valid weight');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let status = '';
    let statusClass = '';
    
    if (bmi < 18.5) {
        status = 'Underweight';
        statusClass = 'status-underweight';
    } else if (bmi < 25) {
        status = 'Normal Weight';
        statusClass = 'status-normal';
    } else if (bmi < 30) {
        status = 'Overweight';
        statusClass = 'status-overweight';
    } else {
        status = 'Obese';
        statusClass = 'status-obese';
    }
    
    document.getElementById('bmi-value').textContent = bmi.toFixed(1);
    const statusElement = document.getElementById('bmi-status');
    statusElement.textContent = status;
    statusElement.className = `result-status ${statusClass}`;
    document.getElementById('bmi-result').classList.remove('hidden');
}

function calculateBodyFat() {
    const gender = document.getElementById('bf-gender').value;
    const age = parseFloat(document.getElementById('bf-age').value);
    const waist = parseFloat(document.getElementById('bf-waist').value);
    const neck = parseFloat(document.getElementById('bf-neck').value);
    const hip = parseFloat(document.getElementById('bf-hip').value) || 0;
    
    clearErrors(['bf-gender', 'bf-age', 'bf-waist', 'bf-neck']);
    
    let hasErrors = false;
    
    if (!gender) {
        showError('bf-gender', 'Please select gender');
        hasErrors = true;
    }
    if (!age || age <= 0) {
        showError('bf-age', 'Please enter a valid age');
        hasErrors = true;
    }
    if (!waist || waist <= 0) {
        showError('bf-waist', 'Please enter a valid waist measurement');
        hasErrors = true;
    }
    if (!neck || neck <= 0) {
        showError('bf-neck', 'Please enter a valid neck measurement');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    let bodyFat;
    if (gender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(175)) - 450;
    } else {
        const hipValue = hip || waist + 10;
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hipValue - neck) + 0.22100 * Math.log10(165)) - 450;
    }
    
    let category = '';
    if (gender === 'male') {
        if (bodyFat < 6) category = 'Essential Fat';
        else if (bodyFat < 14) category = 'Athletic';
        else if (bodyFat < 18) category = 'Fitness';
        else if (bodyFat < 25) category = 'Average';
        else category = 'Obese';
    } else {
        if (bodyFat < 14) category = 'Essential Fat';
        else if (bodyFat < 21) category = 'Athletic';
        else if (bodyFat < 25) category = 'Fitness';
        else if (bodyFat < 32) category = 'Average';
        else category = 'Obese';
    }
    
    document.getElementById('bf-value').textContent = Math.abs(bodyFat).toFixed(1) + '%';
    document.getElementById('bf-category').textContent = category;
    document.getElementById('bf-result').classList.remove('hidden');
}

function calculateBMR() {
    const gender = document.getElementById('bmr-gender').value;
    const age = parseFloat(document.getElementById('bmr-age').value);
    const height = parseFloat(document.getElementById('bmr-height').value);
    const weight = parseFloat(document.getElementById('bmr-weight').value);
    
    clearErrors(['bmr-gender', 'bmr-age', 'bmr-height', 'bmr-weight']);
    
    let hasErrors = false;
    
    if (!gender) {
        showError('bmr-gender', 'Please select gender');
        hasErrors = true;
    }
    if (!age || age <= 0) {
        showError('bmr-age', 'Please enter a valid age');
        hasErrors = true;
    }
    if (!height || height <= 0) {
        showError('bmr-height', 'Please enter a valid height');
        hasErrors = true;
    }
    if (!weight || weight <= 0) {
        showError('bmr-weight', 'Please enter a valid weight');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    document.getElementById('bmr-value').textContent = Math.round(bmr).toLocaleString();
    document.getElementById('bmr-result').classList.remove('hidden');
}

function calculateBodyShape() {
    const gender = document.getElementById('bs-gender').value;
    const waist = parseFloat(document.getElementById('bs-waist').value);
    const hip = parseFloat(document.getElementById('bs-hip').value);
    
    clearErrors(['bs-gender', 'bs-waist', 'bs-hip']);
    
    let hasErrors = false;
    
    if (!gender) {
        showError('bs-gender', 'Please select gender');
        hasErrors = true;
    }
    if (!waist || waist <= 0) {
        showError('bs-waist', 'Please enter a valid waist measurement');
        hasErrors = true;
    }
    if (!hip || hip <= 0) {
        showError('bs-hip', 'Please enter a valid hip measurement');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    const ratio = waist / hip;
    let shape = '';
    
    if (gender === 'female') {
        if (ratio < 0.8) shape = 'Pear Shape';
        else if (ratio < 0.85) shape = 'Hourglass';
        else shape = 'Apple Shape';
    } else {
        if (ratio < 0.85) shape = 'Lower Body';
        else if (ratio < 0.9) shape = 'Balanced';
        else shape = 'Upper Body';
    }
    
    document.getElementById('bs-ratio').textContent = ratio.toFixed(2);
    document.getElementById('bs-shape').textContent = shape;
    document.getElementById('bs-result').classList.remove('hidden');
}

// Helper functions
function setupCalculatorEvents(calculatorId) {
    // Setup specific events for each calculator
    if (calculatorId === 'body-fat') {
        const genderSelect = document.getElementById('bf-gender');
        const hipGroup = document.getElementById('bf-hip-group');
        
        genderSelect.addEventListener('change', function() {
            if (this.value === 'female') {
                hipGroup.style.display = 'block';
            } else {
                hipGroup.style.display = 'none';
            }
        });
    }
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function clearErrors(fieldIds) {
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        
        if (field) field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    });
}

// Calorie Burn Calculator Logic
function calculateCalorieBurn() {
    const activityLevel = document.getElementById('cb-activity').value;
    
    clearErrors(['cb-activity']);
    
    if (!activityLevel) {
        showError('cb-activity', 'Please select activity level');
        return;
    }
    
    const averageBMR = 1800; // Using average BMR
    let multiplier = 1.2; // Sedentary
    
    switch (activityLevel) {
        case 'light': multiplier = 1.375; break;
        case 'moderate': multiplier = 1.55; break;
        case 'active': multiplier = 1.725; break;
        case 'extra': multiplier = 1.9; break;
    }
    
    const maintain = averageBMR * multiplier;
    const lose = maintain - 500;
    const gain = maintain + 500;
    
    document.getElementById('cb-maintain').textContent = Math.round(maintain).toLocaleString();
    document.getElementById('cb-lose').textContent = Math.round(lose).toLocaleString();
    document.getElementById('cb-gain').textContent = Math.round(gain).toLocaleString();
    document.getElementById('cb-result').classList.remove('hidden');
}

// Macro Calculator Logic
function calculateMacros() {
    const calories = parseFloat(document.getElementById('macro-calories').value);
    const goal = document.getElementById('macro-goal').value;
    
    clearErrors(['macro-calories', 'macro-goal']);
    
    let hasErrors = false;
    
    if (!calories || calories <= 0) {
        showError('macro-calories', 'Please enter valid daily calories');
        hasErrors = true;
    }
    if (!goal) {
        showError('macro-goal', 'Please select diet goal');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    let proteinRatio = 0.25;
    let carbRatio = 0.50;
    let fatRatio = 0.25;
    
    switch (goal) {
        case 'low-carb':
            proteinRatio = 0.30;
            carbRatio = 0.30;
            fatRatio = 0.40;
            break;
        case 'high-protein':
            proteinRatio = 0.35;
            carbRatio = 0.40;
            fatRatio = 0.25;
            break;
        case 'ketogenic':
            proteinRatio = 0.25;
            carbRatio = 0.05;
            fatRatio = 0.70;
            break;
    }
    
    const proteinCalories = calories * proteinRatio;
    const carbCalories = calories * carbRatio;
    const fatCalories = calories * fatRatio;
    
    document.getElementById('macro-protein').textContent = `${Math.round(proteinCalories / 4)}g (${Math.round(proteinRatio * 100)}%)`;
    document.getElementById('macro-carbs').textContent = `${Math.round(carbCalories / 4)}g (${Math.round(carbRatio * 100)}%)`;
    document.getElementById('macro-fat').textContent = `${Math.round(fatCalories / 9)}g (${Math.round(fatRatio * 100)}%)`;
    document.getElementById('macro-result').classList.remove('hidden');
}

// Water Intake Calculator Logic
function calculateWaterIntake() {
    const weight = parseFloat(document.getElementById('water-weight').value);
    const activityLevel = document.getElementById('water-activity').value;
    
    clearErrors(['water-weight', 'water-activity']);
    
    let hasErrors = false;
    
    if (!weight || weight <= 0) {
        showError('water-weight', 'Please enter a valid weight');
        hasErrors = true;
    }
    if (!activityLevel) {
        showError('water-activity', 'Please select activity level');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    let baseIntake = weight * 0.033; // Base: 33ml per kg
    
    switch (activityLevel) {
        case 'moderate': baseIntake *= 1.2; break;
        case 'high': baseIntake *= 1.4; break;
    }
    
    const cups = baseIntake * 4.22675; // Convert liters to cups
    const bottles = baseIntake / 0.5; // 500ml bottles
    
    document.getElementById('water-liters').textContent = baseIntake.toFixed(1) + ' L';
    document.getElementById('water-cups').textContent = Math.round(cups) + ' cups';
    document.getElementById('water-bottles').textContent = bottles.toFixed(1) + ' bottles';
    document.getElementById('water-result').classList.remove('hidden');
}

// Heart Rate Calculator Logic
function calculateHeartRate() {
    const age = parseFloat(document.getElementById('hr-age').value);
    const restingHR = parseFloat(document.getElementById('hr-resting').value) || null;
    
    clearErrors(['hr-age']);
    
    if (!age || age <= 0) {
        showError('hr-age', 'Please enter a valid age');
        return;
    }
    
    const maxHR = 220 - age;
    const fatBurnMin = Math.round(maxHR * 0.6);
    const fatBurnMax = Math.round(maxHR * 0.7);
    const cardioMin = Math.round(maxHR * 0.7);
    const cardioMax = Math.round(maxHR * 0.85);
    const peakMin = Math.round(maxHR * 0.85);
    const peakMax = Math.round(maxHR * 0.95);
    
    document.getElementById('hr-max').textContent = maxHR + ' bpm';
    document.getElementById('hr-fatburn').textContent = `${fatBurnMin}-${fatBurnMax} bpm`;
    document.getElementById('hr-cardio').textContent = `${cardioMin}-${cardioMax} bpm`;
    document.getElementById('hr-peak').textContent = `${peakMin}-${peakMax} bpm`;
    document.getElementById('hr-result').classList.remove('hidden');
}

// VO2 Max Calculator Logic
function calculateVO2Max() {
    const gender = document.getElementById('vo2-gender').value;
    const age = parseFloat(document.getElementById('vo2-age').value);
    const runTime = parseFloat(document.getElementById('vo2-runtime').value);
    
    clearErrors(['vo2-gender', 'vo2-age', 'vo2-runtime']);
    
    let hasErrors = false;
    
    if (!gender) {
        showError('vo2-gender', 'Please select gender');
        hasErrors = true;
    }
    if (!age || age <= 0) {
        showError('vo2-age', 'Please enter a valid age');
        hasErrors = true;
    }
    if (!runTime || runTime <= 0) {
        showError('vo2-runtime', 'Please enter a valid run time');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    const vo2Max = 15.3 * (1.5 / runTime); // Simplified calculation
    
    let category = '';
    if (gender === 'male') {
        if (vo2Max < 25) category = 'Poor';
        else if (vo2Max < 35) category = 'Below Average';
        else if (vo2Max < 45) category = 'Average';
        else if (vo2Max < 55) category = 'Good';
        else category = 'Excellent';
    } else {
        if (vo2Max < 20) category = 'Poor';
        else if (vo2Max < 30) category = 'Below Average';
        else if (vo2Max < 40) category = 'Average';
        else if (vo2Max < 50) category = 'Good';
        else category = 'Excellent';
    }
    
    document.getElementById('vo2-value').textContent = vo2Max.toFixed(1);
    document.getElementById('vo2-category').textContent = category;
    document.getElementById('vo2-result').classList.remove('hidden');
}

// Sleep Calculator Logic
function calculateSleepNow() {
    const now = new Date();
    const sleepTimes = [];
    const sleepDurations = [7.5, 9]; // Recommended sleep cycles
    
    for (const duration of sleepDurations) {
        const wakeTime = new Date(now.getTime() + (duration * 60 * 60 * 1000));
        const wakeTimeString = wakeTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        sleepTimes.push(`${wakeTimeString} (${duration}h)`);
    }
    
    document.getElementById('sleep-title').textContent = 'Recommended Wake Times';
    const timesContainer = document.getElementById('sleep-times');
    timesContainer.innerHTML = '';
    sleepTimes.forEach((time, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between;';
        div.innerHTML = `<span>Sleep Cycle ${index + 1}:</span><span style="font-weight: 500;">${time}</span>`;
        timesContainer.appendChild(div);
    });
    
    document.getElementById('wake-time-input').classList.add('hidden');
    document.getElementById('sleep-result').classList.remove('hidden');
}

function showWakeTimeInput() {
    document.getElementById('wake-time-input').classList.remove('hidden');
    document.getElementById('sleep-result').classList.add('hidden');
}

function calculateSleepTimes() {
    const wakeTime = document.getElementById('sleep-waketime').value;
    
    clearErrors(['sleep-waketime']);
    
    if (!wakeTime) {
        showError('sleep-waketime', 'Please enter wake up time');
        return;
    }
    
    const wakeDate = new Date(`2024-01-01T${wakeTime}:00`);
    const sleepTimes = [];
    const sleepDurations = [5, 6, 7.5, 9];
    
    for (const duration of sleepDurations) {
        const sleepTime = new Date(wakeDate.getTime() - (duration * 60 * 60 * 1000));
        const sleepTimeString = sleepTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        sleepTimes.push(`${sleepTimeString} (${duration}h)`);
    }
    
    document.getElementById('sleep-title').textContent = 'Recommended Bedtimes';
    const timesContainer = document.getElementById('sleep-times');
    timesContainer.innerHTML = '';
    sleepTimes.forEach((time, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between;';
        div.innerHTML = `<span>Sleep Cycle ${index + 1}:</span><span style="font-weight: 500;">${time}</span>`;
        timesContainer.appendChild(div);
    });
    
    document.getElementById('sleep-result').classList.remove('hidden');
}

// Pregnancy Calculator Logic
function calculatePregnancy() {
    const lastPeriod = document.getElementById('preg-lmp').value;
    
    clearErrors(['preg-lmp']);
    
    if (!lastPeriod) {
        showError('preg-lmp', 'Please enter last menstrual period date');
        return;
    }
    
    const lmp = new Date(lastPeriod);
    const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000)); // 280 days from LMP
    
    const today = new Date();
    const weeksPregnant = Math.floor((today.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    let trimester = 1;
    if (weeksPregnant >= 28) trimester = 3;
    else if (weeksPregnant >= 14) trimester = 2;
    
    document.getElementById('preg-duedate').textContent = dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('preg-weeks').textContent = Math.max(0, weeksPregnant);
    document.getElementById('preg-trimester').textContent = trimester;
    document.getElementById('preg-result').classList.remove('hidden');
}

// Ideal Weight Calculator Logic
function calculateIdealWeight() {
    const gender = document.getElementById('iw-gender').value;
    const age = parseFloat(document.getElementById('iw-age').value);
    const height = parseFloat(document.getElementById('iw-height').value);
    
    clearErrors(['iw-gender', 'iw-age', 'iw-height']);
    
    let hasErrors = false;
    
    if (!gender) {
        showError('iw-gender', 'Please select gender');
        hasErrors = true;
    }
    if (!age || age <= 0) {
        showError('iw-age', 'Please enter a valid age');
        hasErrors = true;
    }
    if (!height || height <= 0) {
        showError('iw-height', 'Please enter a valid height');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    const heightInInches = height / 2.54;
    
    let robinson, miller, devine;
    
    if (gender === 'male') {
        robinson = 52 + 1.9 * (heightInInches - 60);
        miller = 56.2 + 1.41 * (heightInInches - 60);
        devine = 50 + 2.3 * (heightInInches - 60);
    } else {
        robinson = 49 + 1.7 * (heightInInches - 60);
        miller = 53.1 + 1.36 * (heightInInches - 60);
        devine = 45.5 + 2.3 * (heightInInches - 60);
    }
    
    const average = (robinson + miller + devine) / 3;
    const rangeMin = average - 5;
    const rangeMax = average + 5;
    
    document.getElementById('iw-range').textContent = `${Math.round(rangeMin)} - ${Math.round(rangeMax)} kg`;
    document.getElementById('iw-robinson').textContent = `${Math.round(robinson)} kg`;
    document.getElementById('iw-miller').textContent = `${Math.round(miller)} kg`;
    document.getElementById('iw-devine').textContent = `${Math.round(devine)} kg`;
    document.getElementById('iw-result').classList.remove('hidden');
}

// Ovulation Calculator Logic
function calculateOvulation() {
    const lastMenstrual = document.getElementById('ov-lmp').value;
    const cycleLength = parseFloat(document.getElementById('ov-cycle').value);
    
    clearErrors(['ov-lmp', 'ov-cycle']);
    
    let hasErrors = false;
    
    if (!lastMenstrual) {
        showError('ov-lmp', 'Please enter last menstrual period date');
        hasErrors = true;
    }
    if (!cycleLength || cycleLength <= 0) {
        showError('ov-cycle', 'Please enter a valid cycle length');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    const lmp = new Date(lastMenstrual);
    const ovulationDate = new Date(lmp.getTime() + ((cycleLength - 14) * 24 * 60 * 60 * 1000));
    const fertileStart = new Date(ovulationDate.getTime() - (5 * 24 * 60 * 60 * 1000));
    const fertileEnd = new Date(ovulationDate.getTime() + (1 * 24 * 60 * 60 * 1000));
    const nextPeriod = new Date(lmp.getTime() + (cycleLength * 24 * 60 * 60 * 1000));
    const bestStart = new Date(ovulationDate.getTime() - (24 * 60 * 60 * 1000));
    
    document.getElementById('ov-date').textContent = ovulationDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('ov-fertile').textContent = `${fertileStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${fertileEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    document.getElementById('ov-best').textContent = `${bestStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${ovulationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    document.getElementById('ov-period').textContent = nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('ov-result').classList.remove('hidden');
}

// Calorie Burn Calculator
function createCalorieBurnCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Daily calorie expenditure</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="cb-activity" class="label">Activity Level</label>
                    <select id="cb-activity" class="select">
                        <option value="">Select Activity Level</option>
                        <option value="sedentary">Sedentary (little/no exercise)</option>
                        <option value="light">Light (1-3 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="extra">Extra Active (2x/day, intense)</option>
                    </select>
                    <div class="error-message hidden" id="cb-activity-error"></div>
                </div>
                
                <button type="button" class="btn" onclick="calculateCalorieBurn()">Calculate Daily Calories</button>
                
                <div id="cb-result" class="result hidden">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
                        <div>
                            <div class="result-value" id="cb-maintain"></div>
                            <div class="result-label">Maintain Weight</div>
                        </div>
                        <div>
                            <div class="result-value" id="cb-lose"></div>
                            <div class="result-label">Lose Weight</div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <div class="result-value" id="cb-gain"></div>
                        <div class="result-label">Gain Weight</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Macro Calculator
function createMacroCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Protein, Carb, Fat breakdown</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="macro-calories" class="label">Daily Calories</label>
                    <input type="number" id="macro-calories" class="input" placeholder="2000">
                    <div class="error-message hidden" id="macro-calories-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="macro-goal" class="label">Diet Goal</label>
                    <select id="macro-goal" class="select">
                        <option value="">Select Goal</option>
                        <option value="balanced">Balanced Diet</option>
                        <option value="low-carb">Low Carb</option>
                        <option value="high-protein">High Protein</option>
                        <option value="ketogenic">Ketogenic</option>
                    </select>
                    <div class="error-message hidden" id="macro-goal-error"></div>
                </div>
                
                <button type="button" class="btn" onclick="calculateMacros()">Calculate Macros</button>
                
                <div id="macro-result" class="result hidden">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Protein</span>
                            <span id="macro-protein"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Carbs</span>
                            <span id="macro-carbs"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Fat</span>
                            <span id="macro-fat"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Water Intake Calculator
function createWaterIntakeCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Daily water requirements</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="water-weight" class="label">Weight (kg)</label>
                        <input type="number" id="water-weight" class="input" placeholder="70">
                        <div class="error-message hidden" id="water-weight-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="water-activity" class="label">Activity Level</label>
                        <select id="water-activity" class="select">
                            <option value="">Activity Level</option>
                            <option value="low">Low (desk job)</option>
                            <option value="moderate">Moderate (light exercise)</option>
                            <option value="high">High (intense exercise)</option>
                        </select>
                        <div class="error-message hidden" id="water-activity-error"></div>
                    </div>
                </div>
                
                <button type="button" class="btn" onclick="calculateWaterIntake()">Calculate Water Needs</button>
                
                <div id="water-result" class="result hidden">
                    <div class="result-value" id="water-liters"></div>
                    <div class="result-label">Recommended daily intake</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center;">
                            <div style="font-weight: 600;" id="water-cups"></div>
                            <div style="font-size: 0.75rem; color: #6b7280;">8oz glasses</div>
                        </div>
                        <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center;">
                            <div style="font-weight: 600;" id="water-bottles"></div>
                            <div style="font-size: 0.75rem; color: #6b7280;">500ml bottles</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Heart Rate Calculator
function createHeartRateCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Max & target heart rate</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="hr-age" class="label">Age</label>
                    <input type="number" id="hr-age" class="input" placeholder="30">
                    <div class="error-message hidden" id="hr-age-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="hr-resting" class="label">Resting Heart Rate (optional)</label>
                    <input type="number" id="hr-resting" class="input" placeholder="60">
                </div>
                
                <button type="button" class="btn" onclick="calculateHeartRate()">Calculate Heart Rate Zones</button>
                
                <div id="hr-result" class="result hidden">
                    <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Max Heart Rate</span>
                            <span id="hr-max"></span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; background: #dcfce7; padding: 0.5rem; border-radius: 0.375rem;">
                            <span style="font-size: 0.75rem; color: #166534;">Fat Burn (60-70%)</span>
                            <span style="font-size: 0.875rem; font-weight: 500;" id="hr-fatburn"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; background: #fef3c7; padding: 0.5rem; border-radius: 0.375rem;">
                            <span style="font-size: 0.75rem; color: #92400e;">Cardio (70-85%)</span>
                            <span style="font-size: 0.875rem; font-weight: 500;" id="hr-cardio"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; background: #fee2e2; padding: 0.5rem; border-radius: 0.375rem;">
                            <span style="font-size: 0.75rem; color: #991b1b;">Peak (85-95%)</span>
                            <span style="font-size: 0.875rem; font-weight: 500;" id="hr-peak"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// VO2 Max Calculator
function createVO2MaxCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Cardiovascular fitness level</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="vo2-gender" class="label">Gender</label>
                        <select id="vo2-gender" class="select">
                            <option value="">Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <div class="error-message hidden" id="vo2-gender-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="vo2-age" class="label">Age</label>
                        <input type="number" id="vo2-age" class="input" placeholder="30">
                        <div class="error-message hidden" id="vo2-age-error"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="vo2-runtime" class="label">1.5 Mile Run Time (minutes)</label>
                    <input type="number" step="0.1" id="vo2-runtime" class="input" placeholder="12.5">
                    <div class="error-message hidden" id="vo2-runtime-error"></div>
                </div>
                
                <button type="button" class="btn" onclick="calculateVO2Max()">Calculate VO2 Max</button>
                
                <div id="vo2-result" class="result hidden">
                    <div class="result-value" id="vo2-value"></div>
                    <div class="result-label">ml/kg/min</div>
                    <div class="result-status status-normal" id="vo2-category"></div>
                </div>
            </div>
        </div>
    `;
}

// Sleep Calculator
function createSleepCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Optimal sleep & wake times</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <button type="button" class="btn" style="flex: 1; margin: 0;" onclick="calculateSleepNow()">Sleep Now</button>
                    <button type="button" class="btn" style="flex: 1; margin: 0; background: white; color: #2e7d32; border: 1px solid #2e7d32;" onclick="showWakeTimeInput()">Wake at Time</button>
                </div>
                
                <div id="wake-time-input" class="form-group hidden">
                    <label for="sleep-waketime" class="label">Wake Up Time</label>
                    <input type="time" id="sleep-waketime" class="input">
                    <div class="error-message hidden" id="sleep-waketime-error"></div>
                    <button type="button" class="btn" onclick="calculateSleepTimes()">Calculate Sleep Times</button>
                </div>
                
                <div id="sleep-result" class="result hidden">
                    <div style="background: #eef2ff; padding: 1rem; border-radius: 0.5rem;">
                        <div style="font-size: 1.125rem; font-weight: 600; color: #3730a3; margin-bottom: 0.5rem;" id="sleep-title"></div>
                        <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.875rem;" id="sleep-times">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Blood Pressure Guide
function createBloodPressureGuide(calc) {
    const bpRanges = [
        { category: "Normal", systolic: "< 120", diastolic: "< 80", color: "#10b981", borderColor: "#a7f3d0" },
        { category: "Elevated", systolic: "120-129", diastolic: "< 80", color: "#f59e0b", borderColor: "#fde68a" },
        { category: "Stage 1 High", systolic: "130-139", diastolic: "80-89", color: "#f97316", borderColor: "#fed7aa" },
        { category: "Stage 2 High", systolic: "≥ 140", diastolic: "≥ 90", color: "#ef4444", borderColor: "#fecaca" }
    ];
    
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Reference guide only</p>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; color: #92400e; font-size: 0.875rem;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
                        This is for reference only. Use a proper BP monitor for accurate readings.
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${bpRanges.map(range => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid ${range.borderColor}; border-radius: 0.5rem;">
                            <div>
                                <div style="font-weight: 500; color: ${range.color};">${range.category}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Systolic / Diastolic</div>
                            </div>
                            <div style="font-size: 0.875rem; font-weight: 500;">${range.systolic} / ${range.diastolic}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 1rem; padding: 0.75rem; background: #dbeafe; border: 1px solid #60a5fa; border-radius: 0.5rem;">
                    <div style="font-size: 0.875rem; color: #1e40af;">
                        <strong>Note:</strong> Blood pressure readings can vary throughout the day. 
                        Take multiple readings and consult with a healthcare professional for accurate assessment.
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Pregnancy Calculator
function createPregnancyCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Based on last menstrual period</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="preg-lmp" class="label">Last Menstrual Period</label>
                    <input type="date" id="preg-lmp" class="input">
                    <div class="error-message hidden" id="preg-lmp-error"></div>
                </div>
                
                <button type="button" class="btn" onclick="calculatePregnancy()">Calculate Due Date</button>
                
                <div id="preg-result" class="result hidden">
                    <div style="background: #fce7f3; padding: 1rem; border-radius: 0.5rem; text-align: center; margin-bottom: 0.75rem;">
                        <div style="font-size: 1.125rem; font-weight: 600; color: #be185d; margin-bottom: 0.25rem;">Estimated Due Date</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #831843;" id="preg-duedate"></div>
                        <div style="font-size: 0.875rem; color: #be185d; margin-top: 0.5rem;">40 weeks from LMP</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; text-align: center;">
                        <div style="padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
                            <div style="font-size: 1.125rem; font-weight: 600;" id="preg-weeks"></div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Weeks Pregnant</div>
                        </div>
                        <div style="padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
                            <div style="font-size: 1.125rem; font-weight: 600;" id="preg-trimester"></div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Trimester</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Ideal Weight Calculator
function createIdealWeightCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Based on height, age & gender</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="iw-gender" class="label">Gender</label>
                        <select id="iw-gender" class="select">
                            <option value="">Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <div class="error-message hidden" id="iw-gender-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="iw-age" class="label">Age</label>
                        <input type="number" id="iw-age" class="input" placeholder="30">
                        <div class="error-message hidden" id="iw-age-error"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="iw-height" class="label">Height (cm)</label>
                    <input type="number" id="iw-height" class="input" placeholder="170">
                    <div class="error-message hidden" id="iw-height-error"></div>
                </div>
                
                <button type="button" class="btn" onclick="calculateIdealWeight()">Calculate Ideal Weight</button>
                
                <div id="iw-result" class="result hidden">
                    <div style="background: #f0fdfa; padding: 1rem; border-radius: 0.5rem; text-align: center; margin-bottom: 0.75rem;">
                        <div style="font-size: 1.125rem; font-weight: 600; color: #0f766e; margin-bottom: 0.25rem;">Ideal Weight Range</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #134e4a;" id="iw-range"></div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Robinson Formula:</span>
                            <span style="font-weight: 500;" id="iw-robinson"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Miller Formula:</span>
                            <span style="font-weight: 500;" id="iw-miller"></span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Devine Formula:</span>
                            <span style="font-weight: 500;" id="iw-devine"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Ovulation Calculator
function createOvulationCalculator(calc) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon ${calc.color}">
                        <i class="${calc.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${calc.name}</h3>
                        <p class="card-description">Predict fertile window and ovulation</p>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="ov-lmp" class="label">Last Menstrual Period</label>
                        <input type="date" id="ov-lmp" class="input">
                        <div class="error-message hidden" id="ov-lmp-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="ov-cycle" class="label">Cycle Length (days)</label>
                        <input type="number" id="ov-cycle" class="input" placeholder="28" value="28">
                        <div class="error-message hidden" id="ov-cycle-error"></div>
                    </div>
                </div>
                
                <button type="button" class="btn" onclick="calculateOvulation()">Calculate Ovulation</button>
                
                <div id="ov-result" class="result hidden">
                    <div style="background: #fdf2f8; padding: 1rem; border-radius: 0.5rem;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <div style="font-size: 1.125rem; font-weight: 600; color: #be185d; margin-bottom: 0.25rem;">Next Ovulation</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #831843;" id="ov-date"></div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #fce7f3; border-radius: 0.375rem;">
                                <span style="color: #be185d;">Fertile Window</span>
                                <span style="font-weight: 500;" id="ov-fertile"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #dcfce7; border-radius: 0.375rem;">
                                <span style="color: #166534;">Best Days</span>
                                <span style="font-weight: 500;" id="ov-best"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #dbeafe; border-radius: 0.375rem;">
                                <span style="color: #1d4ed8;">Next Period</span>
                                <span style="font-weight: 500;" id="ov-period"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
