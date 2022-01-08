import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorePageComponent } from './explore-page/explore-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { AuthGuard } from './services/authentication/auth-guard.service';

const routes: Routes = [
  { path : '', redirectTo: 'home', pathMatch: 'full'},
  { path : 'home', component : HomePageComponent, canActivate: [AuthGuard]},
  { path : 'explore', component : ExplorePageComponent, canActivate: [AuthGuard]},
  { path : 'profile/:username', component : ProfilePageComponent, canActivate: [AuthGuard]},
  { path : 'registration', component : RegistrationPageComponent},
  { path : 'login', component : LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
