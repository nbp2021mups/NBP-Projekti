import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  form: FormGroup;
  hide = true;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      lozinka: new FormControl('', Validators.required)
    })
  }

  onSubmit(){

    if(!this.form.valid){
      return;
    }

    const username: string = this.form.get('username').value;
    const password: string = this.form.get('lozinka').value;

    this.authService.login(username, password).subscribe(
      {
        next: (resp) =>{
          this.router.navigate(['/home']);
        },
        error: (err) =>{
          this.error=err.error;
          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });

  }

}
