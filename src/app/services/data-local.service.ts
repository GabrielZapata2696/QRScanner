import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';

import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';


@Injectable({
  providedIn: 'root'
})
export class DataLocalService {


  guardados: Registro[] = [];


  constructor(
    private storage: Storage,
    private navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer


  ) {
    this.storage.create();
    this.cargarStorage();
  }

  async cargarStorage() {
    this.guardados = await this.storage.get('registros') || [];
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();
    const nuevoRegistro = new Registro(format, text);

    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);

    this.abrirRegistro(nuevoRegistro);

  }


  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {

      case 'http':
        this.inAppBrowser.create(registro.text, '_system');
        break;

      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/map/${registro.text}`)
        break;

      default:
        break;
    }
  }

  enviarCorreo() {
    const tempArr = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    tempArr.push(titulos);

    this.guardados.forEach(registro => {
      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
      tempArr.push(linea);
    });
    this.generarArchivoFisico(tempArr.join(''));

  }


  generarArchivoFisico(text: string) {
    console.log(this.file.externalDataDirectory + 'www/assets/registros_qrscanner.csv')
    this.file.checkFile(this.file.externalDataDirectory, 'www/assets/registros_qrscanner.csv')
      .then(existe => {
        console.log(this.file.externalDataDirectory + 'www/assets/registros_qrscanner.csv')
        console.log(existe)

        return this.escribirArchivo(text);
      })
      .catch(err => {
        return this.file.createFile(this.file.externalDataDirectory, 'www/assets/registros_qrscanner.csv', false)
          .then(creado => {
            console.log('entra a catch');
            this.escribirArchivo(text);
          })
          .catch(err2 => {
            console.log('No se pudo crear el archivo');
          });

      });
  }


  async escribirArchivo(text: string) {
    await this.file.writeExistingFile(this.file.externalDataDirectory, 'www/assets/registros_qrscanner.csv', text);

    const archivo = `${this.file.externalDataDirectory} www/assets/registros_qrscanner.csv`;

    const email = {
      to: 'sr.gabrielzm@gmail.com',
      attachments: [
        archivo
      ],
      subject: 'Backup QRScanner',
      body: 'Aquí encontrará el backup de los registros escaneados con la aplicación QRScanner',
      isHtml: true
    };

    // Send a text message using default options
    this.emailComposer.open(email);

  }



}
