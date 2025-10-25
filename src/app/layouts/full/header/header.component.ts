import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/material-component/dialog/change-password/change-password.component';
import { ConfirmationComponent } from 'src/app/material-component/dialog/confirmation/confirmation.component';
import { UserService } from 'src/app/services/user.service';
import { UserNameDialogComponent } from './UserNameDialogComponent'; // Adjust path

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent implements OnInit {
  role: any;
  userName: string | undefined;

  constructor(private router: Router,
    private dialog: MatDialog,
    private userService: UserService) {
  }

  ngOnInit() {
    this.fetchUserName(); // Call fetchUserName() when component initializes
  }

  fetchUserName() {
    this.userService.getUser().subscribe(
      (response: any) => {
        console.log("response: "+response);
        console.log(response);
        
        
        this.userName = response.message; // Assuming response contains the user's name
        console.log(this.userName);
        
      },
      (error) => {
        console.error('Error fetching user name:', error);
        // Handle error
      }
    );
  }

  
  // openUserNameDialog(): void {
  //   const dialogRef = this.dialog.open(UserNameDialogComponent, {
  //     width: '250px',
  //     data: { userName: this.userName }
  //   });
  // }
  logout(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'logout',
      confirmation:true
    };

    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response)=>{
      dialogRef.close();
      localStorage.clear(); // clear token from local storage to restart the session
      this.router.navigate(['/']); // route the user back to the home page
    })
  }

  changePassword() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "500px";
    this.dialog.open(ChangePasswordComponent, dialogConfig);
  }
}
