import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from './header/header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { PostComponent } from './posts/post/post.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { MatCardModule } from '@angular/material/card';
import { HomePageComponent } from './home-page/home-page.component';
import { HotspotsComponent } from './hotspots/hotspots.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { ExplorePageComponent } from './explore-page/explore-page.component';
import { FriendsListComponent } from './friends/friends-list/friends-list.component';
import { FriendItemComponent } from './friends/friend-item/friend-item.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PostComponent,
    PostListComponent,
    HomePageComponent,
    HotspotsComponent,
    ProfilePageComponent,
    ExplorePageComponent,
    FriendsListComponent,
    FriendItemComponent,
    LoginPageComponent,
    RegistrationPageComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatIconModule,
    MatCardModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }