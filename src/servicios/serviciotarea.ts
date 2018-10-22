import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TareaModelo } from './TareaModelo';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
// import { AngularFireAuthModule } from '@angular/fire/auth';
import {AngularFirestoreCollection, AngularFirestore} from 'angularfire2/firestore'

/*
  Generated class for the ServiciotareaProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServiciotareaProvider {

  //Me creo un array de tareas vacío
  public tareas: TareaModelo[] = [];

  public coleccion: AngularFirestoreCollection<TareaModelo>;
  //El observador es el que va a traer toda la información de la base de datos
  public observador: TareaModelo[];

  constructor(public http: HttpClient, private storage: Storage, public afd:AngularFirestore) {
    
    this.coleccion = this.afd.collection('tareas');
    this.coleccion.snapshotChanges().subscribe(listaTareas => {
      this.observador = listaTareas.map(item =>{
        return{
          descripcion: item.payload.doc.data().descripcion,
          importante: item.payload.doc.data().importante,
          realizado: item.payload.doc.data().realizado,
          id: item.payload.doc.id        
        }
      });
    });
    //Desde el constructor voy a llamar a una función
    
    this.dameLista();

  }
  
  //Coger lo que está almacenado
  public dameLista(){
    //Cuando el storage esté listo hacemos algo
    this.storage.ready().then(()=>{
      this.storage.get('tareas').then(data =>{
          //inicializo una variable local vacía sobre la que trabajar
          let tareaLocal:TareaModelo[]=[];
          if(data){
            for(let tarea of data){
              tareaLocal.push(new TareaModelo(tarea.descripcion, tarea.realizado, tarea.importante));
            }
          }
          this.tareas = tareaLocal;
      });
    });
  }

  public salvarLocal(){
    this.storage.ready().then(()=>{
      this.storage.set('tareas', this.tareas);
    });
  }
  public addTarea(tarea:TareaModelo){
    this.tareas.push(tarea);
    this.afd.collection('tareas')
    .add({descripcion: tarea.descripcion, realizado: tarea.realizado, importante: tarea.importante})
    .then();
  }

  //Para borrar usamos el id
  public borrado(tarea){
    let index = this.tareas.indexOf(tarea);
    this.tareas.splice(index, 1);
    //console.log(tarea.id);
    this.afd.doc(`tareas/${tarea.id}`).delete().then();
  }

  

}
