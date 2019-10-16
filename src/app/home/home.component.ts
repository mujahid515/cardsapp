import { Component, OnInit } from '@angular/core';
import { FbService } from '../fb.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  showPlay = false;
  showSignUp = false;
  signUpForm: FormGroup;
  loginForm: FormGroup;
  submitted = false;
  loginSubmitted = false;
  currentUser;
  appDetails;

  constructor(private fb: FbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      tc: ['', Validators.required]
    });
    this.loginForm = this.formBuilder.group({
      loginemail: ['', [Validators.required, Validators.email]],
      loginpassword: ['', Validators.required]
    });
    this.fb.getAppURL().then((appData) => {
      this.appDetails = appData[0];
    });
    this.fb.isUserLoggedIn().then((resp) => {
      if(resp) {
        this.fb.getUser(resp);
        this.fb.user.pipe(take(1)).subscribe((userData) => {
          this.currentUser = userData;
        });
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signUpForm.controls; }
  get loginf() { return this.loginForm.controls; }

  showSignUpForm() {
    this.showSignUp = true;
  }

  submitSignUp() {
    this.submitted = true;
    if(this.signUpForm.valid) {
      var prom = this.fb.createUser(this.f.email.value, this.f.password.value, this.f.firstName.value, this.f.lastName.value);
      prom.then((resp: boolean) => {
        this.showPlay = resp;
        if(resp) {
          this.fb.user.pipe(take(1)).subscribe((userData) => {
            this.currentUser = userData;
            this.fb.fireSwal('Success!', 'User has been created.', 'success');
          });
        }
      });
    }
  }

  submitLogin() {
    this.loginSubmitted = true;
    if(this.loginForm.valid) {
      var prom = this.fb.login(this.loginf.loginemail.value, this.loginf.loginpassword.value);
      prom.then((resp: boolean) => {
        this.showPlay = resp;
        if(resp) {
          this.fb.user.pipe(take(1)).subscribe((userData) => {
            this.currentUser = userData;
          });
        }
      })
    }
  }

  logOut() {
    this.fb.logout();
    this.currentUser = false;
  }

}
