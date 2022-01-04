import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorePageComponent } from './explore-page/explore-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

const routes: Routes = [
  { path : '', redirectTo: '/home', pathMatch: 'full'},
  { path : 'home', component : HomePageComponent},
  { path : 'explore', component : ExplorePageComponent},
  { path : 'profile', component : ProfilePageComponent}
]; 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
