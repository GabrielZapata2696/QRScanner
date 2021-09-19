import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';

import { Storage } from '@ionic/storage-angular';


@Injectable({
  providedIn: 'root'
})
export class DataLocalService {


  guardados: Registro[] = [];


  constructor(
    private storage: Storage
  ) {
    this.storage.create();
    this.cargarStorage();
  }

  async cargarStorage() {
    this.guardados = await this.storage.get('registros') || [];
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();
    this.guardados.unshift(new Registro(format, text));
    this.storage.set('registros', this.guardados);
  }




}
