// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// State Management
const state = {
    currentScreen: 'ageVerification',
    code: '',
    codeTimer: null,
    codeTimerSeconds: 120,
};

// Screen Navigation
const screens = {
    ageVerification: 'ageVerificationScreen',
    codeInput: 'codeInputScreen',
    password: 'passwordScreen',
    success: 'successScreen',
};

// Screen Transition
function showScreen(screenName) {
    const allScreens = document.querySelectorAll('.screen');
    const targetScreen = document.getElementById(screens[screenName]);

    if (!targetScreen) return;

    allScreens.forEach(screen => {
        if (screen.id === screens[screenName]) {
            screen.classList.remove('prev');
            screen.classList.add('active');
        } else if (screen.classList.contains('active')) {
            screen.classList.remove('active');
            screen.classList.add('prev');
        } else {
            screen.classList.remove('active', 'prev');
        }
    });

    state.currentScreen = screenName;
}

// ==================== AGE VERIFICATION SCREEN ====================
const confirmAgeBtn = document.getElementById('confirmAgeBtn');

confirmAgeBtn.addEventListener('click', () => {
    console.log('Age verification confirmed');
    showScreen('codeInput');
    startCodeTimer();
});

// ==================== CODE INPUT SCREEN ====================
const keypadBtns = document.querySelectorAll('.keypad-btn');
const deleteBtn = document.getElementById('deleteBtn');
const submitCodeBtn = document.getElementById('submitCodeBtn');
const codeBoxes = document.querySelectorAll('.code-box');
const codeTimer = document.getElementById('codeTimer');

// Keypad Number Input
keypadBtns.forEach(btn => {
    if (btn !== deleteBtn) {
        btn.addEventListener('click', (e) => {
            const key = e.target.getAttribute('data-key');
            if (state.code.length < 5) {
                state.code += key;
                updateCodeDisplay();
                
                // Auto-submit when 5 digits entered
                if (state.code.length === 5) {
                    setTimeout(() => {
                        submitCode();
                    }, 300);
                }
            }
        });
    }
});

// Delete Button
deleteBtn.addEventListener('click', () => {
    if (state.code.length > 0) {
        state.code = state.code.slice(0, -1);
        updateCodeDisplay();
    }
});

// Update Code Display
function updateCodeDisplay() {
    codeBoxes.forEach((box, index) => {
        if (index < state.code.length) {
            box.textContent = state.code[index];
            box.classList.add('filled');
        } else {
            box.textContent = '';
            box.classList.remove('filled');
        }
    });

    // Enable/Disable Submit Button
    submitCodeBtn.disabled = state.code.length !== 5;
}

// Code Timer
function startCodeTimer() {
    state.codeTimerSeconds = 120;
    updateTimerDisplay();

    state.codeTimer = setInterval(() => {
        state.codeTimerSeconds--;

        if (state.codeTimerSeconds <= 0) {
            clearInterval(state.codeTimer);
            codeTimer.textContent = 'Code expired. Request a new one.';
            codeTimer.style.color = '#e74c3c';
            submitCodeBtn.disabled = true;
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.codeTimerSeconds / 60);
    const seconds = state.codeTimerSeconds % 60;
    codeTimer.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
    codeTimer.style.color = state.codeTimerSeconds <= 30 ? '#e74c3c' : '#999';
}

// Submit Code
submitCodeBtn.addEventListener('click', submitCode);

function submitCode() {
    if (state.code.length !== 5) return;

    console.log('Code submitted:', state.code);
    
    // Simulate code verification
    if (state.code === '12345') {
        console.log('Valid code entered');
        clearInterval(state.codeTimer);
        showScreen('password');
    } else {
        // Show error
        codeTimer.textContent = 'Incorrect code. Please try again.';
        codeTimer.style.color = '#e74c3c';
        resetCodeInput();
    }
}

function resetCodeInput() {
    state.code = '';
    updateCodeDisplay();
}

// ==================== PASSWORD SCREEN ====================
const passwordInput = document.getElementById('passwordInput');
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
const passwordError = document.getElementById('passwordError');

verifyPasswordBtn.addEventListener('click', verifyPassword);

// Allow Enter key to submit
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyPassword();
    }
});

function verifyPassword() {
    const password = passwordInput.value.trim();

    if (!password) {
        passwordError.textContent = 'Please enter your password';
        return;
    }

    console.log('Password submitted');
    
    // Simulate password verification
    if (password === 'password123') {
        console.log('Valid password entered');
        passwordError.textContent = '';
        showScreen('success');
    } else {
        passwordError.textContent = 'Incorrect password. Please try again.';
        passwordInput.value = '';
    }
}

// Clear error on input
passwordInput.addEventListener('input', () => {
    if (passwordError.textContent) {
        passwordError.textContent = '';
    }
});

// ==================== SUCCESS SCREEN ====================
const restartBtn = document.getElementById('restartBtn');

restartBtn.addEventListener('click', restartApp);

function restartApp() {
    console.log('Restarting application');
    state.code = '';
    passwordInput.value = '';
    passwordError.textContent = '';
    clearInterval(state.codeTimer);
    showScreen('ageVerification');
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    console.log('Mini App Initialized');
    
    // Set Telegram app title
    if (tg) {
        tg.setHeaderColor('#667eea');
    }
});

// Handle visibility changes to pause timer
document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.codeTimer) {
        clearInterval(state.codeTimer);
    } else if (!document.hidden && state.currentScreen === 'codeInput' && !state.codeTimer) {
        startCodeTimer();
    }
});