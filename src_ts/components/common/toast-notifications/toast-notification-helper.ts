import {EtoolsToast} from './etools-toast';
import './etools-toast'; // element loaded (if not, etools-toast will not render)
import {GenericObject} from '../../../types/globals';
import {AppShell} from '../../app-shell/app-shell';

/**
 * Toasts notification messages queue utility class
 */
export class ToastNotificationHelper {
  private readonly _toast: EtoolsToast;
  private _toastQueue: GenericObject[] = [];
  private TOAST_EL_ID = 'toastNotificationQueueEl';
  private appShellEl!: AppShell;

  constructor(appShellEl: AppShell) {
    this.appShellEl = appShellEl;
    const toast = document.querySelector(this.TOAST_EL_ID) as EtoolsToast;
    this._toast = toast ? toast : this.createToastNotificationElement();
  }

  public addToastNotificationListeners() {
    this.queueToast = this.queueToast.bind(this);
    document.body.addEventListener('toast', this.queueToast);
  }

  public removeToastNotificationListeners() {
    document.body.removeEventListener('toast', this.queueToast);
    if (this._toast) {
      this._toast.removeEventListener('toast-confirm', this._toggleToast);
      this._toast.removeEventListener('toast-closed', this.dequeueToast);
    }
  }

  public queueToast(event: GenericObject) {
    event.stopPropagation();
    const detail = event.detail;

    if (!this._toastQueue.length) {
      this._toastQueue.push(detail);
      const toastProperties: GenericObject = this._toast.prepareToastAndGetShowProperties(detail);
      this._showToast(toastProperties);
    } else {
      const alreadyInQueue = this._toastQueue.filter((toastDetail: GenericObject) => {
        return JSON.stringify(toastDetail) === JSON.stringify(detail);
      });
      if (alreadyInQueue.length === 0) {
        this._toastQueue.push(detail);
      } // else already in the queue
    }
  }

  public createToastNotificationElement() {
    const toast = document.createElement('etools-toast') as EtoolsToast;
    toast.setAttribute('id', this.TOAST_EL_ID);
    this._toggleToast = this._toggleToast.bind(this);
    toast.addEventListener('toast-confirm', this._toggleToast);
    document.querySelector('body')!.appendChild(toast);
    this._toastAfterRenderSetup(toast);
    return toast;
  }

  protected _toastAfterRenderSetup(toast: EtoolsToast) {
    if (toast) {
      // alter message wrapper css
      setTimeout(() => {
        if (toast.toastLabelEl) {
          toast.toastLabelEl.style.whiteSpace = 'pre-wrap';
        }
      }, 0);
    }
    // add close listener
    this.dequeueToast = this.dequeueToast.bind(this);
    toast.addEventListener('toast-closed', this.dequeueToast);
  }

  public dequeueToast() {
    this._toastQueue.shift();
    if (this._toastQueue.length) {
      const toastProperties: GenericObject = this._toast.prepareToastAndGetShowProperties(this._toastQueue[0]);
      this._showToast(toastProperties);
    }
  }

  protected _toggleToast() {
    if (this._toast) {
      this._toast.toggle();
    }
  }

  protected _showToast(toastProperties: GenericObject) {
    this.appShellEl.currentToastMessage = toastProperties.text;
    this._toast.show(toastProperties);
  }
}
