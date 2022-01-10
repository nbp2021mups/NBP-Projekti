import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { find } from 'rxjs';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { LocationsService } from 'src/app/services/locations.service';
import { mimeType } from '../../mime-type-validator/mime-type-validator';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements OnInit {
  form: FormGroup;
  imagePreview: string='';
  locations: LocationBasic[] = [];
  drzava: string;
  grad: string;

  constructor(private locService: LocationsService, private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      opis: new FormControl('', Validators.required),
      drzava: new FormControl('', Validators.required),
      grad: new FormControl('', Validators.required),
      novaDrzava: new FormControl('', Validators.required),
      noviGrad: new FormControl('', Validators.required),
      slika: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });

    this.locService.getAllLocations().subscribe(locs => {
      this.locations = locs;
    });
  }

  getPostValues() {
    const ret: FormData = new FormData();

    let drzava = this.form.get('drzava').value;
    if(drzava == 'ostalo'){
      drzava = this.form.get('novaDrzava').value;
      ret.append('newCountry', drzava);
    } else {
      ret.append('country', drzava);
    }
    let grad = this.form.get('grad').value;
    if(grad == 'ostalo'){
      grad = this.form.get('noviGrad').value;
      ret.append('newCity', grad);
    } else {
      ret.append('city', grad);
    }

    ret.append('description', this.form.get('opis').value);
    ret.append('image', this.form.value.slika);
    return ret;
  }

  onSubmit(){
    const postValues: FormData = this.getPostValues();
    let userSub = this.authService.user.subscribe(user => {
      postValues.append('userId', user.id.toString());
      this.http.post('http://localhost:3000/posts', postValues, {responseType: 'text'}).subscribe(resp => {
        alert(resp);
      });
    });
  }

  checkCountry(event) {
    this.drzava=event.value;
    this.grad = undefined;
  }

  checkCity(event) {
    this.grad=event.value;
  }


  getCountries(): string[] {
    const countries = [];
    this.locations.forEach(location => {
      if(!countries.find(el => el == location.country)){
        countries.push(location.country);
      }
    });
    return countries;
  }


  getCities(country: string): string[] {
    const cities = [];
    this.locations.forEach(location => {
      if(location.country == country){
        if(!cities.find(el => el == location.city)){
          cities.push(location.city);
        }
      }
    });
    return cities;
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
