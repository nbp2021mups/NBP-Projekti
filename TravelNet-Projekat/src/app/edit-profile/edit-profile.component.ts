import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { mimeType } from '../mime-type-validator/mime-type-validator';
import { PersonProfile } from '../models/person_models/person-profile.model';
import { AuthService } from '../services/authentication/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form: FormGroup;
  hide = true;
  rdonly = true;
  imagePreview: string;
  error: string = '';
  succes: string = '';
  person: PersonProfile;

  constructor(private router: Router, private profileService: ProfileService,
    private authService: AuthService) { }

  ngOnInit(): void {

    this.form = new FormGroup({

      ime: new FormControl('', Validators.required),
      prezime: new FormControl('', Validators.required),
      username: new FormControl(''),
      email: new FormControl(''),
      lozinka : new FormControl(''),
      novaLozinka: new FormControl('', [
        Validators.minLength(6)
      ]),
      slika: new FormControl('', {
        validators: [],
        asyncValidators: [mimeType]
      }),
      opis: new FormControl(''),
    })


    this.authService.user.subscribe(user => {
      const username = user.username;
      this.profileService.getLoggedUserBasicInfo(username).subscribe({
        next: resp => {
          this.person = resp;
          this.imagePreview = this.person.imagePath;
          this.form.patchValue({
            ime : this.person.firstName,
            prezime : this.person.lastName,
            opis : this.person.bio,
            email : this.person.email,
            username : this.person.username,
            slika : this.person.imagePath

          });
        },
        error: err => {
          console.log(err);
        }
      });
    }).unsubscribe();
  }


  onSubmit(){
    const body = {};
    let newImage : File ;
    if (this.form.get('ime').value!=this.person.firstName)
      body["firstName"]=this.form.get('ime').value;
    if (this.form.get('prezime').value!=this.person.lastName)
      body["lastName"]=this.form.get('prezime').value;
    if (this.form.get('opis').value!=this.person.bio)
      body["bio"]=this.form.get('opis').value;
    if (this.imagePreview!=this.person.imagePath){
      newImage=this.form.value.slika;
      body["oldImage"]=this.person.imagePath;
    }
    else
      newImage=null;

    if (this.form.get('novaLozinka').value.length>=6){
      body["newPassword"]=this.form.get('novaLozinka').value;
      body["password"]=this.form.get('lozinka').value;
    }

    if (Object.keys(body).length==0 && !newImage){
      this.router.navigate(["profile",this.person.username]);
    }
    const formData : FormData = new FormData();
    Object.keys(body).forEach((el)=> {
      formData.append(el, body[el]);
    })

    formData.append("image", newImage);

    this.profileService.updateLoggedUserInfo(formData, this.person.id).subscribe({
      next : resp => {
        this.router.navigate(["profile",this.person.username]);
      },
      error: err=>{
        this.error=err.error;
          setTimeout(() => {
            this.error = '';
          }, 3000);
      }
    })


  }

  onCancel(){
    this.router.navigate(["profile",this.person.username]);
  }

  onImagePicked(event: Event) {

    const file = (event.target as HTMLInputElement).files[0];

    this.form.patchValue({ slika: file });
    this.form.get("slika").updateValueAndValidity();
    const reader = new FileReader();

    if(this.form.value.slika.type.includes("image")){
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
    }

    reader.readAsDataURL(file);
  }

}
