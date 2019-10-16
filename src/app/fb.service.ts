import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { User, Card, Game, App } from './interfaces';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FbService implements OnInit {

  public appURL: string = "";

  users: Observable<any[]>;
  cards: Observable<any[]>;
  games: BehaviorSubject<any[]>;
  apps: Observable<any[]>;

  gameBS: BehaviorSubject<any[]>; //used for live games

  private userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;

  private cardDoc: AngularFirestoreDocument<Card>;
  card: Observable<Card>;

  private gameDoc: AngularFirestoreDocument<Game>;
  game: Observable<Game>;

  private appDoc: AngularFirestoreDocument<App>;
  app: Observable<App>;
  appData: Array<App>;

  constructor(private db: AngularFirestore, public afAuth: AngularFireAuth, public router: Router) {}

  ngOnInit() {
    
  }

  //Auth management

  createUser(email, password, firstName, lastName) {
    var prom = new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      }).then((data) => {
        if(data !== undefined) {
          var obj = {
            uid: data['user']['uid'],
            appsData: [{ appName: this.appData[0].aid, totalScore: 0 }],
            enrolledVia: { aid: this.appData[0].aid, title: this.appData[0].title },
            firstName: firstName,
            lastName: lastName,
            email: email
          }
          this.db.collection('users').doc(data['user']['uid']).set(obj)
          .then(() => {
            console.log("Document successfully written!");
            var resp = this.login(email, password);
            if(resp) {
              this.getUser(data['user']['uid']);
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch((error) => {
              console.error("Error writing document: ", error);
              resolve(false);
          });
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  login(email, password) {
    var prom = new Promise((resolve, reject) => {
      //this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
      this.afAuth.auth.signInWithEmailAndPassword(email, password).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        resolve(false);
      }).then((data) => {
        if(data !== undefined) {
          this.getUser(data['user']['uid']);
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  isUserLoggedIn() {
    var prom = new Promise((resolve, reject) => {
      this.afAuth.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(false);
        }
      });
    })
    return prom;
  }

  //Gets app URL

  getAppURL() {
    var prom = new Promise((resolve, reject) => {
      this.appURL = window.location.hostname;
      this.getColQ('apps', 'url', this.appURL).then((appData: [App]) => {
        this.appData = appData;
        resolve(appData);
      }).catch((error) => {
          console.error("Error getting URL: ", error);
          resolve(error);
      });
    });
    return prom;
  }

  goToPage(url) {
    this.router.navigate([url]);
  }

  //Gets collections. requires observables to be created: users, cards, games, apps

  getCol(col) {
    this[col] = this.db.collection(col).valueChanges();
  }

  //Gets documents in colecion via == query. requires observables to be created: users, cards, games, apps

  getColQ(col, query, value) {
    this[col] = this.db.collection(col, ref => ref.where(query, '==', value)).valueChanges();
    var prom = new Promise((resolve, reject) => {
      this[col].pipe(take(1)).subscribe((data) => {
        if(data) {
          resolve(data);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  getColQ3(col, query1, value1, query2, value2, query3, value3) {
    this[col] = this.db.collection(col, ref => ref.where(query1, '==', value1).where(query2, '==', value2).where(query3, '==', value3)).valueChanges();
    var prom = new Promise((resolve, reject) => {
      this[col].pipe(take(1)).subscribe((data) => {
        if(data) {
          resolve(data);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  //Gets documents

  getUser(uid) {
    this.userDoc = this.db.doc<User>(`users/${uid}`);
    this.user = this.userDoc.valueChanges();
  }

  getCard(cid) {
    this.cardDoc = this.db.doc<Card>(`cards/${cid}`);
    this.card = this.cardDoc.valueChanges();
  }

  getGame(gid, gameBS) {
    var prom = new Promise((resolve, reject) => {
      this[gameBS] = this.db.collection('games', ref => ref.where('gid', '==', gid)).valueChanges();
      this.gameDoc = this.db.doc<Game>(`games/${gid}`);
      this.game = this.gameDoc.valueChanges();
      this.game.pipe(take(1)).subscribe((gameData) => {
        if(gameData) {
          resolve(gameData);
        } else {
          resolve(false);
        }
      });
    })
    return prom;
  }

  getApp(aid) {
    this.appDoc = this.db.doc<App>(`apps/${aid}`);
    this.app = this.appDoc.valueChanges();
  }

  //Gets behaviour subjects

  getGameBS(gid, bs) {
    this[bs] = this.db.collection('games', ref => ref.where('gid', '==', gid)).valueChanges();
    var prom = new Promise((resolve, reject) => {
      this.gameBS.pipe(take(1)).subscribe((data) => {
        if(data) {
          resolve(data);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  //add document and return promise with generated doc id
  addDoc(col, obj) {
    var prom = new Promise((resolve, reject) => {
      this.db.collection(col).add(obj)
      .then((docRef) => {
          resolve(docRef.id);
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
          resolve(error);
      });
    });
    return prom;
  }
  
  //Set a document (destructive) 

  setDoc(col, id, obj) {
    this.db.collection(col).doc(id).set(obj)
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }

  //Set a document with merge (destructive)

  setDocMerge(col, id, obj) {
    this.db.collection(col).doc(id).set(obj, { merge: true })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }

  arrayUpdate(col, id, field, oldObj, newObj) {
    this.db.collection(col).doc(id).update({ [field]: firebase.firestore.FieldValue.arrayRemove(oldObj)})
    .then(() => {
        console.log("Old object in array removed!");
        this.db.collection(col).doc(id).update({ [field]: firebase.firestore.FieldValue.arrayUnion(newObj)})
        .then(() => {
            console.log("New object added to array!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
  }
  
  //Update a document (non-destructive)

  updateDoc(col, id, obj) {
    this.db.collection(col).doc(id).update(obj)
    .then(() => {
        console.log("Document successfully updated!");
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
  }

  //Delete a document

  deleteDoc(col, docId) {
    this.db.collection(col).doc(docId).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
  }

  //alerts
  fireSwal(title, text, type) {
    Swal.fire({
      title: title,
      text: text,
      type: type
    })
  }
}
