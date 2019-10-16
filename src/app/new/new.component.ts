import { Component, OnInit } from '@angular/core';
import { FbService } from '../fb.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Game } from '../interfaces';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  newGameForm: FormGroup;
  submitted = false;
  categories = [];
  winningScoresList = [10, 20, 50, 100, 200, 500, 1000];
  openToList = ['Public', 'Private'];
  appDetails;

  constructor(private fb: FbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newGameForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      winningScore: ['', Validators.required],
      openTo: ['', Validators.required]
    });
    this.fb.getAppURL().then((appData) => {
      this.appDetails = appData[0];
      this.categories = appData[0].categories;
    });    
  }

  // convenience getter for easy access to form fields
  get f() { return this.newGameForm.controls; }

  createGame() {
    this.submitted = true;
    if(this.newGameForm.valid) {
      var prom = new Promise((resolve, reject) => {
        this.fb.isUserLoggedIn().then((resp) => {
          if(resp) {
            this.fb.getUser(resp);
            this.fb.user.pipe(take(1)).subscribe((userData) => {
              var obj = {
                active: false,
                app: this.appDetails.aid,
                category: this.f.category.value,
                gid: '',
                openTo: this.f.openTo.value,
                players: [{ active: true, uid: userData.uid, firstName: userData.firstName, lastName: userData.lastName, host: true, score: 0 }],
                winner: '',
                winningScore: this.f.winningScore.value
              }
              resolve(obj);
            });
          } else {
            resolve(false);
          }
        });
      });
      prom.then((promObj: Game) => {
        this.fb.addDoc('games', promObj).then((docID: string) => {
          if(docID) {
            promObj.gid = docID;
            this.fb.setDoc('games', docID, promObj);
            this.fb.getGame(docID, 'gameBS');
            this.fb.fireSwal('Success!', 'Your game has been created.', 'success');
            this.fb.goToPage('awaiting');
          } else {
            console.error('Game was not created: ', docID);
          }
        })
      })
    }
  }
}
