import { Component, OnInit } from '@angular/core';
import { FbService } from '../fb.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Game } from '../interfaces';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  newCardForm: FormGroup;
  submitted = false;
  categories = [];
  pointsList = [1, 2, 3, 4, 5];
  appDetails;

  constructor(private fb: FbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newCardForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      points: ['', Validators.required],
      question: ['', Validators.required],
      correctAnswer: ['', Validators.required],
      fakeAnswer1: ['', Validators.required],
      fakeAnswer2: ['', Validators.required],
      fakeAnswer3: ['', Validators.required]
    });
    this.fb.getAppURL().then((appData) => {
      this.appDetails = appData[0];
      this.categories = appData[0].categories;
    }); 
  }

  // convenience getter for easy access to form fields
  get f() { return this.newCardForm.controls; }

  addQuestion() {
    this.submitted = true;
    if(this.newCardForm.valid) {
      var obj = {
        active: false,
        app: this.appDetails.aid,
        cid: '',
        category: this.f.category.value,
        points: this.f.points.value,
        question: this.f.question.value,
        correctAnswer: this.f.correctAnswer.value,
        fakeAnswer1: this.f.fakeAnswer1.value,
        fakeAnswer2: this.f.fakeAnswer2.value,
        fakeAnswer3: this.f.fakeAnswer3.value
      }
      this.fb.addDoc('cards', obj).then((docID: string) => {
        if(docID) {
          obj.cid = docID;
          this.fb.setDoc('cards', docID, obj);
          this.fb.fireSwal('Success!', 'Your question has been submitted.', 'success');
        } else {
          this.fb.fireSwal('Error!', docID, 'error');
        }
      })
    }
  }

}
