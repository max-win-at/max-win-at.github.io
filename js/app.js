/**
 * MaxWin About Page - Alpine.js Components
 * MVVM ViewModel for contact functionality
 */

function contactApp() {
    return {
        // State (Model)
        isModalOpen: false,
        isSent: false,
        isModalOpenedFromCli: false,
        isSubmitting: false,
        hasError: false,
        statusMessage: '',
        form: {
            email: '',
            message: ''
        },

        // Lifecycle
        init() {
            this.checkSentStatus();
        },

        // Methods (ViewModel actions)
        checkSentStatus() {
            if (sessionStorage.getItem('maxwin_contact_sent')) {
                this.isSent = true;
            }
        },

        openModal(fromCli = false) {
            if (this.isSent) return;
            this.isModalOpenedFromCli = fromCli;
            this.isModalOpen = true;
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            this.isModalOpen = false;
            this.isModalOpenedFromCli = false;
            document.body.style.overflow = 'auto';
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
                        this.closeModal();
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
        }
    };
}
