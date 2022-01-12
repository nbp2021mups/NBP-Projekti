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

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddPostComponent } from './posts/add-post/add-post.component';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { LocationPageComponent } from './location-page/location-page.component';
import { PostViewComponent } from './post-view/post-view.component';
import { CommentComponent } from './comment/comment.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { LocationCardComponent } from './location-card/location-card.component';
import { LocationCardListComponent } from './location-card-list/location-card-list.component';

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
    RegistrationPageComponent,
    AddPostComponent,
    ChatComponent,
    NotificationsComponent,
    LocationPageComponent,
    PostViewComponent,
    CommentComponent,
    CommentListComponent,
    LocationCardComponent,
    LocationCardListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
