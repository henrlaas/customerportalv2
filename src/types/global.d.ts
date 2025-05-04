
interface PlayfulUI {
  initTabs: () => void;
  toggleClass: (element: HTMLElement, className: string) => void;
  showToast: (message: string, type?: string, duration?: number) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

interface Window {
  playfulUI?: PlayfulUI;
}
