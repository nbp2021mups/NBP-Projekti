import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  form: FormGroup;
  hide = true;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      lozinka: new FormControl('', Validators.required)
    })
  }

  onSubmit(){

    console.log( this.form.get('username').value)
    console.log( this.form.get('lozinka').value)

  }

}
