import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy {
  result: string | undefined | null = null;
  scanActive = false;

  constructor(private alertController: AlertController) {}

  ngAfterViewInit(): void {
    BarcodeScanner.prepare();
  }

  async startScanner() {
    const allowed = await this.checkPermission();
    if(allowed) {
      this.scanActive = true;

      const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.UPC_A, SupportedFormat.UPC_E, SupportedFormat.UPC_EAN_EXTENSION, SupportedFormat.CODE_39, SupportedFormat.CODE_128, SupportedFormat.CODE_39_MOD_43, SupportedFormat.CODE_93]});
      if (result.hasContent) {
        this.result = result.content;
        this.scanActive = false;
      }
    }
  }

  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        resolve(true)
      } else if (status.denied) {
        const alert= await this.alertController.create({
          header: 'No permission',
          message: 'Please allow camera access in your settings',
          buttons: [{
            text: 'No',
            role: 'cancel'
          }, {
            text: 'Open Settings',
            handler: () => {
              resolve(false);
              BarcodeScanner.openAppSettings();
            }
          }]
        });

        await alert.present();
      } else {
        resolve(false);
      }
    })
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  ngOnDestroy(): void {
    BarcodeScanner.stopScan();
  }

}
