import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-name-dialog',
  template: '<p>{{ data.userName }}</p>',
})
export class UserNameDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { userName: string }) {}
}