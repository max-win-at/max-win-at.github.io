/**
 * MaxWin About Page - Alpine.js Components
 * MVVM ViewModel for contact functionality
 */

function contactApp() {
    return {
        // State (Model)
        isModalOpen: false,
        isSent: false,
        isSentOnLoad: false,  // True only if already sent when page loaded
        isModalOpenedFromCli: false,
        isSubmitting: false,
        hasError: false,
        statusMessage: '',
        form: {
            email: '',
            message: ''
        },

        // Boot Animation State
        bootPhase: 0,  // 0=initial, 1=typing neofetch, 2=neofetch shown, 3=typing contact, 4=splash loading, 5=all shown
        typedCommand1: '',
        typedCommand2: '',
        showCursor1: true,
        showCursor2: false,
        bootAnimationStarted: false,
        splashLoading: false,
        splashIcon: '⏳',

        // Contact Animation State
        contactAnimating: false,
        typedCommand3: '',
        showCursor3: false,
        contactSplashVisible: false,
        contactSplashIcon: '⏳',

        // Lifecycle
        init() {
            this.checkSentStatus();
            if (!this.bootAnimationStarted) {
                this.bootAnimationStarted = true;
                this.startBootAnimation();
            }
        },

        // Methods (ViewModel actions)
        checkSentStatus() {
            if (sessionStorage.getItem('maxwin_contact_sent')) {
                this.isSent = true;
                this.isSentOnLoad = true;  // Mark that it was already sent on load
            }
        },

        async openModal(fromCli = false) {
            if (this.isSent || this.contactAnimating) return;
            this.isModalOpenedFromCli = fromCli;

            if (fromCli) {
                // Animate typing 'contact max-win 3'
                this.contactAnimating = true;
                this.showCursor3 = true;
                this.typedCommand3 = '';

                await this.typeText('contact max-win 3', (char) => {
                    this.typedCommand3 += char;
                }, 80);

                await this.sleep(200);
                this.showCursor3 = false;

                // Show contact splash with loading
                this.contactSplashVisible = true;
                this.contactSplashIcon = '⏳';

                // Animate hourglass
                const hourglasses = ['⏳', '⌛'];
                let idx = 0;
                const startTime = Date.now();
                while (Date.now() - startTime < 800) {
                    this.contactSplashIcon = hourglasses[idx % 2];
                    idx++;
                    await this.sleep(150);
                }
                this.contactSplashIcon = '✓';
                await this.sleep(300);

                this.contactAnimating = false;
            }

            this.isModalOpen = true;
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            this.isModalOpen = false;
            this.isModalOpenedFromCli = false;
            document.body.style.overflow = 'auto';

            // Reset all animation states and restart boot sequence
            this.bootPhase = 0;
            this.typedCommand1 = '';
            this.typedCommand2 = '';
            this.typedCommand3 = '';
            this.showCursor1 = true;
            this.showCursor2 = false;
            this.showCursor3 = false;
            this.splashLoading = false;
            this.splashIcon = '\u23f3';
            this.contactAnimating = false;
            this.contactSplashVisible = false;
            this.contactSplashIcon = '\u23f3';
            this.bootAnimationStarted = false;

            // Restart the boot animation
            this.$nextTick(() => {
                this.bootAnimationStarted = true;
                this.startBootAnimation();
            });
        },

        async submitForm(formEl) {
            this.isSubmitting = true;
            this.hasError = false;
            this.statusMessage = '';

            const formData = new FormData(formEl);

            try {
                const response = await fetch(formEl.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    sessionStorage.setItem('maxwin_contact_sent', 'true');
                    this.statusMessage = 'Success! Message dispatched.';
                    this.hasError = false;

                    setTimeout(() => {
                        // Close modal without resetting (successful send)
                        this.isModalOpen = false;
                        document.body.style.overflow = 'auto';
                        this.isSent = true;
                    }, 1500);
                } else {
                    throw new Error();
                }
            } catch (err) {
                this.statusMessage = 'Transmission Error. Try again.';
                this.hasError = true;
            } finally {
                this.isSubmitting = false;
            }
        },

        // Boot Animation Methods
        async startBootAnimation() {
            const typingSpeed = 80;
            const pauseAfterCommand = 300;
            const pauseBeforeNextCommand = 600;

            // Phase 1: Type 'neofetch'
            this.bootPhase = 1;
            await this.typeText('neofetch', (char) => {
                this.typedCommand1 += char;
            }, typingSpeed);

            // Phase 2: Show neofetch output
            await this.sleep(pauseAfterCommand);
            this.showCursor1 = false;
            this.bootPhase = 2;

            // Short pause before next command
            await this.sleep(pauseBeforeNextCommand);
            this.showCursor2 = true;

            // Phase 3: Type 'contact max-win'
            this.bootPhase = 3;
            await this.typeText('contact max-win', (char) => {
                this.typedCommand2 += char;
            }, typingSpeed);

            // Phase 4: Show splash with loading animation
            await this.sleep(pauseAfterCommand);
            this.showCursor2 = false;
            this.bootPhase = 4;
            this.splashLoading = true;

            // Animate hourglass for a bit
            const hourglasses = ['⏳', '⌛'];
            let hourglassIndex = 0;
            const loadingDuration = 1200;
            const toggleInterval = 200;
            const startTime = Date.now();

            while (Date.now() - startTime < loadingDuration) {
                this.splashIcon = hourglasses[hourglassIndex % 2];
                hourglassIndex++;
                await this.sleep(toggleInterval);
            }

            // Show check and buttons
            this.splashLoading = false;
            this.splashIcon = '✓';
            await this.sleep(200);
            this.bootPhase = 5;
        },

        async typeText(text, onChar, speed) {
            for (let char of text) {
                onChar(char);
                await this.sleep(speed + Math.random() * 40);
            }
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };
}
