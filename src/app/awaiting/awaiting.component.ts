import { Component, OnInit } from '@angular/core';
import { FbService } from '../fb.service';
import { take } from 'rxjs/operators';
import { User, Game } from '../interfaces';

@Component({
  selector: 'app-awaiting',
  templateUrl: './awaiting.component.html',
  styleUrls: ['./awaiting.component.css']
})
export class AwaitingComponent implements OnInit {

  currentUser: User;
  atLeastOne = false;

  constructor(public fb: FbService) { }

  ngOnInit() {
    if(!this.fb.game) {
      this.fb.goToPage('/');
    } else {
      this.fb.isUserLoggedIn().then((resp) => {
        if(resp) {
          this.fb.getUser(resp);
          this.fb.user.pipe(take(1)).subscribe((userData) => {
            this.currentUser = userData;
          });
        }
      });
    }
  }

  startGame(gameObj) {
    console.log('gameObj: ', gameObj);
    //minimum of 2 players required
    if(gameObj.players.length > 1 && this.atLeastOne) {
      gameObj.active = true;
      this.fb.setDoc('games', gameObj.gid, gameObj);
      this.fb.goToPage('game');
    }
  }

  startGameForGuest(gameObj) {
    if(this.currentUser.uid != gameObj.players[0].uid) {
      console.log('emitVal: ', gameObj);
      this.fb.goToPage('game');
    }
  }

  cancelGame(gameObj: Game) {
    //host user
    if(gameObj.players[0].uid == this.currentUser.uid) {
      //if there is another player in gameObj.players[1] make them the host
      if(gameObj.players.length > 1) {
        gameObj.players[1].host = true;
        gameObj.players[1].active = true;
        //remove old host from gameObj.players list
        gameObj.players.splice(0, 1);
        this.fb.setDoc('games', gameObj.gid, gameObj);
      } else {
      //else delete the game document
      this.fb.deleteDoc('games', gameObj.gid);
      this.fb.fireSwal('Success!', 'Your game has been deleted.', 'success');
      }
    } else { //guest user <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      //remove from gameObj.players list
      var filteredAry = gameObj.players.filter(e => e.uid !== this.currentUser.uid);
      gameObj.players = filteredAry;
      this.fb.setDoc('games', gameObj.gid, gameObj);
    }
    //navigate to home
    this.fb.goToPage('/');
  }

  acceptPlayer(gameObj, uid) {
    this.acceptOrReject(gameObj, uid, true);
  }

  rejectPlayer(gameObj, uid) {
    this.acceptOrReject(gameObj, uid, false);
  }

  acceptOrReject(gameObj, uid, val) {
    for(let i = 0; i < gameObj.players.length; i++) {
      if(gameObj.players[i].uid == uid) {
        gameObj.players[i].active = val;
      }
    }
    this.fb.setDoc('games', gameObj.gid, gameObj);
    this.atLeastOne = this.atLeastOneAccepted(gameObj.players);
  }

  atLeastOneAccepted(list) {
    //i is 1 because host [0] is always active
    for(let i = 1; i < list.length; i++) {
      if(list[i].active) {
        return true;
      }
    }
    return false;
  }

}
