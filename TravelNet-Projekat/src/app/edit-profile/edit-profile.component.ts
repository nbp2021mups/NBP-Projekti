import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../mime-type-validator/mime-type-validator';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form: FormGroup;
  hide = true;
  imagePreview: string='./../../assets/resources/profile-avatar.jpg';

  constructor() { }

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
