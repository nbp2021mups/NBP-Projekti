import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ExplorePageComponent } from './explore-page/explore-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LocationPageComponent } from './location-page/location-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AddPostComponent } from './posts/add-post/add-post.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { AuthGuard } from './services/authentication/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
  {
    path: 'explore',
    component: ExplorePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:username',
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'location/:locationId',
    component: LocationPageComponent,
    canActivate: [AuthGuard],
  },
  { path: 'messages', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'add-post', component: AddPostComponent, canActivate: [AuthGuard]},
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
