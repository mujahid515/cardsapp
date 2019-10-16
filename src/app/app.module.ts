import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule, FirebaseOptionsToken } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AddComponent } from './add/add.component';
import { NewComponent } from './new/new.component';
import { AwaitingComponent } from './awaiting/awaiting.component';
import { GameComponent } from './game/game.component';
import { ScoresComponent } from './scores/scores.component';
import { JoinComponent } from './join/join.component';

import { FbService } from './fb.service';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AfterIfDirective } from './after-if.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AddComponent,
    NewComponent,
    AwaitingComponent,
    GameComponent,
    ScoresComponent,
    JoinComponent,
    PageNotFoundComponent,
    AfterIfDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule
  ],
  providers: [
    FbService,
    AngularFireAuthGuard,
    { provide: FirebaseOptionsToken, useValue: environment.firebase },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
