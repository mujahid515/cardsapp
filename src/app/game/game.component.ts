import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FbService } from '../fb.service';
import { take } from 'rxjs/operators';
import { Game, User, Card, App } from '../interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @ViewChild('answersList') answersList: ElementRef;

  currentUser: User;
  currentGame: Game;
  cardList: Array<Card>;
  countdownCount = '';
  activeCard = 0;
  gameEnded = false;

  constructor(private fb: FbService) { }

  ngOnInit() {
    if(!this.fb.game) {
      this.fb.goToPage('/');
    } else {
      //countdown 3,2,1
      this.countdown();
      //Get all data whilst countdown happens
      this.getAllData();
    }
  }

  countdown() {
    setTimeout(() => {
      this.countdownCount = '3';
      setTimeout(() => {
        this.countdownCount = '2';
        setTimeout(() => {
          this.countdownCount = '1';
          setTimeout(() => {
            this.countdownCount = 'Go!';
            setTimeout(() => {
              this.countdownCount = 'finished';
            }, 500);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }

  getAllData() {
    this.fb.isUserLoggedIn().then((resp) => {
      if(resp) {
        this.fb.getUser(resp);
        this.fb.user.pipe(take(1)).subscribe((userData) => {
          this.currentUser = userData;
          this.fb.game.pipe(take(1)).subscribe((gameData) => {
            this.fb.getGameBS(gameData.gid, 'gameBS').then((gameDataBS: Game) => {
              if(gameDataBS) {
                //we now have a game behaviour subject fb.gameBS
                this.currentGame = gameDataBS;
                console.log('this.currentGame: ', this.currentGame);
                this.fb.getColQ3('cards', 'active', true, 'app', gameData.app, 'category', gameData.category).then((cardsData: [Card]) => {
                  console.log('cardsData: ', cardsData);
                  this.cardList = cardsData;
                  this.shuffleArray(this.cardList);
                })
              }
            })
          })
        });
      }
    });
  }

  selectedAnswer(answer) {
    console.log('answer: ', answer);
    if(answer == this.cardList[this.activeCard].correctAnswer) {
      //use currentUser.uid to search for player in this.currentGame and assign points this.cardList[this.activeCard].points
      for(let i = 0; i < this.currentGame[0].players.length; i++) {
        if(this.currentGame[0].players[i].uid == this.currentUser.uid) {
          var oldObj = {
            active: this.currentGame[0].players[i].active,
            firstName: this.currentGame[0].players[i].firstName,
            host: this.currentGame[0].players[i].host,
            lastName: this.currentGame[0].players[i].lastName,
            score: this.currentGame[0].players[i].score,
            uid: this.currentGame[0].players[i].uid,
          }
          var newObj = {};
          this.currentGame[0].players[i].score += Number(this.cardList[this.activeCard].points);
          newObj = this.currentGame[0].players[i];
          if(this.currentGame[0].players[i].score >= Number(this.currentGame[0].winningScore)) {
            this.currentGame[0].winner = this.currentGame[0].players[i].firstName + ' ' + this.currentGame[0].players[i].lastName;
            //update just the players obj
            console.log('oldObj: ', oldObj);
            this.fb.arrayUpdate('games', this.currentGame[0].gid, 'players', oldObj, newObj);
            //then update just the winner field
            this.fb.updateDoc('games', this.currentGame[0].gid, { winner: this.currentGame[0].winner });
            //update winners user totalScore
            //...
            break;
          }
          //update just the players obj
          console.log('oldObj: ', oldObj);
          console.log('newObj: ', newObj);
          this.fb.arrayUpdate('games', this.currentGame[0].gid, 'players', oldObj, newObj);
          break;
        }
      }
      if(this.currentGame[0].winner) {
        //end game
        this.gameEnded = true;
      } else {
        //continue game
        //increment activeCard
        this.activeCard++;
        //Shuffle answers
        this.shuffleAnswers();
      }
    } else {
      this.fb.fireSwal('Incorrect!', 'That is the wrong answer.', 'error');
    }
  }

  shuffleAnswers() {
    console.log('this.answersList', this.answersList);
    var ul = this.answersList.nativeElement;
    for (var i = ul.children.length; i >= 0; i--) {
        ul.appendChild(ul.children[Math.random() * i | 0]);
    }
  }

  shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  showWinner(winner) {
    this.gameEnded = true;
    this.fb.fireSwal('Game Over!', 'The winner is ' + winner, 'success');
  }

}
