import { Routes } from '@angular/router';
import {RegisterComponent} from "./features/register/register.component";
import {GameStartComponent} from "./features/game-start/game-start.component";
import {GameComponent} from "./features/game/game.component";
import {LeaderboardComponent} from "./features/leaderboard/leaderboard.component";
import {AuthGuard} from "./helper/auth.guard";
import {MentionsLegalesComponent} from "./features/mentions-legales/mentions-legales.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'start',
    component: GameStartComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'game',
    component: GameComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent
  },
  {
    path: 'mentions-legales',
    component: MentionsLegalesComponent
  }
];
