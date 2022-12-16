import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.service';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  { path: '', component: PuzzleComponent, canActivate: [AuthGuard] },
  { path: 'login', component: UserComponent},
  // { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
