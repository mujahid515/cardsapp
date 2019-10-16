import { Component, OnInit } from '@angular/core';
import { FbService } from '../fb.service';
import { take } from 'rxjs/operators';
import { Game, App, User } from '../interfaces';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  privateGameSwitch: boolean = false;
  publicGameSwitch: boolean = false;
  privateGameCode: string = '';
  currentUser: User;
  games;

  constructor(public fb: FbService) { }

  ngOnInit() {
    this.getPublicGames();
    this.fb.isUserLoggedIn().then((resp) => {
      if(resp) {
        this.fb.getUser(resp);
        this.fb.user.pipe(take(1)).subscribe((userData) => {
          this.currentUser = userData;
        });
      }
    });
  }

  getPublicGames() {
    this.fb.getAppURL().then((appData: [App]) => {
      this.fb.getColQ3('games', 'app', appData[0].aid, 'active', false, 'openTo', 'Public').then((gamesData) => {
        this.games = gamesData;
      });
    });
  }

  joinPrivateGame() {
    this.privateGameSwitch = true;
    this.publicGameSwitch = false;
  }

  joinPublicGame() {
    this.publicGameSwitch = true;
    this.privateGameSwitch = false;
    if(this.games.length < 1) {
      this.getPublicGames();
    }
  }

  goToGame(gameCode: string) {
    this.fb.getGame(gameCode, 'gameBS').then((gameData: Game) => {
      var playerAlreadyExist = gameData.players.filter(x => (x.uid === this.currentUser.uid));
      if(gameData.players[0].uid != this.currentUser.uid && playerAlreadyExist.length == 0) {
        //add player to game players list
        var newPlayer = {
          active: false,
          firstName: this.currentUser.firstName,
          host: false,
          lastName: this.currentUser.lastName,
          score: 0,
          uid: this.currentUser.uid
        }
        gameData.players.push(newPlayer);
        this.fb.setDocMerge('games', gameData.gid, gameData);
        //navigate to awaiting page
        this.fb.goToPage('awaiting');
      } else {
        this.fb.goToPage('awaiting');
      }
    })
  }

}
