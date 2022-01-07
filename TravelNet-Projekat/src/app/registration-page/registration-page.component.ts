import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../mime-type-validator/mime-type-validator';
import { AuthService } from '../services/authentication/auth.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.css']
})
export class RegistrationPageComponent implements OnInit {
  form: FormGroup;
  hide = true;
  imagePreview: string='./../../assets/resources/universal.jpg';
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      ime: new FormControl('', Validators.required),
      prezime: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      lozinka: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      slika: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
      opis: new FormControl(''),
    })
  }


  onSubmit(){
    
    const fName = this.form.get('ime').value;
    const lName = this.form.get('prezime').value;
    const email = this.form.get('email').value;
    const username = this.form.get('username').value;
    const password = this.form.get('lozinka').value;
    const desc = this.form.get('opis').value;
    const imagePath = this.form.value.slika;

    this.authService.register(fName, lName, email, username, password, desc, imagePath).subscribe(
      {next : (resp) => {
        console.log(resp);
      },
      error : (err) => {
        console.log(err);
      }});

    //this.form.reset()c
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    console.log(file)
    this.form.patchValue({ slika: file });
    this.form.get("slika").updateValueAndValidity();
    const reader = new FileReader();
    console.log(this.form.value.slika.type)
    if(this.form.value.slika.type.includes("image")){
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
    }

    reader.readAsDataURL(file);
  }

}
