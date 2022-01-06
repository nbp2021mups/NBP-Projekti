import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../../mime-type-validator/mime-type-validator';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements OnInit {
  form: FormGroup;
  drzava: string;
  grad: string;
  imagePreview: string='';

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      opis: new FormControl('', Validators.required),
      drzava: new FormControl('', Validators.required),
      grad: new FormControl('', Validators.required),
      novaDrzava: new FormControl('', Validators.required),
      noviGrad: new FormControl('', Validators.required),
      slika: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    })
  }

  onSubmit(){
    console.log( this.form.get('opis').value)
    console.log( this.form.get('drzava').value)
    console.log( this.form.get('grad').value)
    console.log(this.form.value.slika)
  }

  checkCountry(event) {
    this.drzava=event.value;
  }

  checkCity(event) {
    this.grad=event.value;
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    console.log(file)
    this.form.patchValue({ slika: file });
    this.form.get("slika").updateValueAndValidity();
    const reader = new FileReader();
    console.log(this.form.value.slika.type)
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };


    reader.readAsDataURL(file);
  }


}
