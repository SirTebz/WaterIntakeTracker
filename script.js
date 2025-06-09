class WaterTracker {
    constructor() {
        this.dailyGoal = 2000;
        this.currentAmount = 0;
        this.log = [];
        this.reminderInterval = null;

        this.elements = {
            currentAmount: document.getElementById('currentAmount'),
            progressRing: document.querySelector('.progress-ring'),
            waterLog: document.getElementById('waterLog'),
            customAmount: document.getElementById('customAmount'),
            reminderSwitch: document.getElementById('reminderSwitch'),
            reminderIntervalSelect: document.getElementById('reminderInterval'),
            waterLevel: document.getElementById('waterLevel')
        };

        this.init();
    }

    init() {
        this.requestNotificationPermission();
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateProgress();
    }

    requestNotificationPermission() {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.water-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.addWater(amount);
            });
        });

        document.getElementById('addCustom').addEventListener('click', () => {
            const amount = parseInt(this.elements.customAmount.value);
            if (amount > 0) {
                this.addWater(amount);
                this.elements.customAmount.value = '';
            }
        });

        document.getElementById('resetDay').addEventListener('click', () => {
            this.resetDay();
        });

        this.elements.reminderSwitch.addEventListener('change', () => {
            this.toggleReminders();
        });

        this.elements.reminderIntervalSelect.addEventListener('change', () => {
            if (this.elements.reminderSwitch.checked) {
                this.toggleReminders();
                this.toggleReminders();
            }
        });
    }

    addWater(amount) {
        const previousAmount = this.currentAmount;
        this.currentAmount += amount;
        const timestamp = new Date().toLocaleTimeString();
        this.log.unshift(`${amount}ml at ${timestamp}`);

        const glassHeight = 250;
        const startHeight = (previousAmount / this.dailyGoal) * glassHeight;
        const finalHeight = (this.currentAmount / this.dailyGoal) * glassHeight;

        this.elements.waterLevel.style.setProperty('--start-height', `${Math.min(startHeight, glassHeight)}px`);
        this.elements.waterLevel.style.setProperty('--final-height', `${Math.min(finalHeight, glassHeight)}px`);

        this.elements.waterLevel.classList.remove('filling');
        void this.elements.waterLevel.offsetWidth;
        this.elements.waterLevel.classList.add('filling');

        this.updateProgress();
        this.updateLog();
        this.saveToLocalStorage();
    }

    updateProgress() {
        this.elements.currentAmount.textContent = this.currentAmount;

        const circumference = 2 * Math.PI * 90;
        const progress = Math.min(this.currentAmount / this.dailyGoal, 1);
        const offset = circumference * (1 - progress);
        this.elements.progressRing.style.strokeDasharray = circumference;
        this.elements.progressRing.style.strokeDashoffset = offset;

        const glassHeight = 250;
        const waterHeight = (this.currentAmount / this.dailyGoal) * glassHeight;
        this.elements.waterLevel.style.height = `${Math.min(waterHeight, glassHeight)}px`;
    }

    updateLog() {
        this.elements.waterLog.innerHTML = this.log
            .map(entry => `<li>${entry}</li>`)
            .join('');
    }

    resetDay() {
        this.currentAmount = 0;
        this.log = [];
        this.updateProgress();
        this.updateLog();
        this.saveToLocalStorage();
        this.elements.waterLevel.style.height = '0px';
    }

    toggleReminders() {
        if (this.elements.reminderSwitch.checked) {
            if (this.reminderInterval) clearInterval(this.reminderInterval);
            const interval = parseInt(this.elements.reminderIntervalSelect.value) * 60 * 1000;
            this.reminderInterval = setInterval(() => {
                if (Notification.permission === 'granted') {
                    new Notification('Time to Hydrate!', {
                        body: 'Drink some water to stay healthy!',
                        icon: 'https://cdn-icons-png.flaticon.com/512/824/824748.png'
                    });
                }
            }, interval);
        } else {
            if (this.reminderInterval) {
                clearInterval(this.reminderInterval);
                this.reminderInterval = null;
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('waterTracker', JSON.stringify({
            currentAmount: this.currentAmount,
            log: this.log,
            date: new Date().toDateString()
        }));
    }

    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('waterTracker'));
        if (data && data.date === new Date().toDateString()) {
            this.currentAmount = data.currentAmount;
            this.log = data.log;
            this.updateProgress();
            this.updateLog();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WaterTracker();
});